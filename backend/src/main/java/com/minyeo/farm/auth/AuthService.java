package com.minyeo.farm.auth;

import com.minyeo.farm.auth.dto.AuthTokenResponse;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.user.AuthProvider;
import com.minyeo.farm.domain.user.User;
import com.minyeo.farm.domain.user.UserRepository;
import com.minyeo.farm.domain.user.UserRole;
import com.minyeo.farm.security.CustomUserPrincipal;
import com.minyeo.farm.security.JwtTokenProvider;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@EnableConfigurationProperties(NaverOAuthProperties.class)
public class AuthService {

    private static final String NAVER_AUTHORIZE_URL = "https://nid.naver.com/oauth2.0/authorize";
    private static final String NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
    private static final String NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me";

    private final NaverOAuthProperties naverOAuthProperties;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final WebClient webClient;
    private final String adminProviderUserId;

    public AuthService(NaverOAuthProperties naverOAuthProperties,
                       UserRepository userRepository,
                       JwtTokenProvider jwtTokenProvider,
                       @Value("${app.admin.naver-provider-user-id:}") String adminProviderUserId) {
        this.naverOAuthProperties = naverOAuthProperties;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.webClient = WebClient.builder().build();
        this.adminProviderUserId = adminProviderUserId;
    }

    /**
     * 네이버 OAuth 인가 URL을 생성한다.
     * 프론트는 이 URL로 리다이렉트해서 code/state를 획득한다.
     */
    public String buildLoginUrl() {
        String state = UUID.randomUUID().toString();
        return NAVER_AUTHORIZE_URL
                + "?response_type=code"
                + "&client_id=" + naverOAuthProperties.getClientId()
                + "&redirect_uri=" + naverOAuthProperties.getRedirectUri()
                + "&state=" + state;
    }

    /**
     * 네이버 code/state로 토큰을 교환하고 프로필을 조회한 뒤,
     * 사용자 upsert 후 자체 JWT를 발급한다.
     */
    @Transactional
    public AuthTokenResponse loginByNaver(String code, String state) {
        String tokenRequestUri = UriComponentsBuilder.fromHttpUrl(NAVER_TOKEN_URL)
                .queryParam("grant_type", "authorization_code")
                .queryParam("client_id", naverOAuthProperties.getClientId())
                .queryParam("client_secret", naverOAuthProperties.getClientSecret())
                .queryParam("code", code)
                .queryParam("state", state)
                .build(true)
                .toUriString();

        Map<String, Object> tokenResponse = webClient.get()
                .uri(tokenRequestUri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "네이버 토큰 발급 실패");
        }
        String naverAccessToken = tokenResponse.get("access_token").toString();
        Map<String, Object> profileWrapper = webClient.get()
                .uri(NAVER_PROFILE_URL)
                .headers(headers -> headers.setBearerAuth(naverAccessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        if (profileWrapper == null || profileWrapper.get("response") == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "네이버 사용자 정보 조회 실패");
        }
        Map<String, Object> profile = (Map<String, Object>) profileWrapper.get("response");
        String providerUserId = String.valueOf(profile.get("id"));
        String email = profile.get("email") == null ? null : String.valueOf(profile.get("email"));
        String name = profile.get("name") == null ? "네이버회원" : String.valueOf(profile.get("name"));
        String mobile = profile.get("mobile") == null ? null : String.valueOf(profile.get("mobile"));

        User user = userRepository.findByProviderAndProviderUserId(AuthProvider.NAVER, providerUserId)
                .map(existing -> {
                    existing.updateProfile(email, name, mobile);
                    if (!adminProviderUserId.isBlank() && adminProviderUserId.equals(providerUserId)) {
                        existing.promoteToAdmin();
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    UserRole role = (!adminProviderUserId.isBlank() && adminProviderUserId.equals(providerUserId))
                            ? UserRole.ADMIN : UserRole.USER;
                    return userRepository.save(User.builder()
                            .provider(AuthProvider.NAVER)
                            .providerUserId(providerUserId)
                            .role(role)
                            .name(name)
                            .email(email)
                            .phone(mobile)
                            .build());
                });

        String accessToken = jwtTokenProvider.createAccessToken(user);
        return AuthTokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }

    /**
     * 인증 컨텍스트에서 현재 사용자 ID를 추출한다.
     */
    public Long getCurrentUserId(CustomUserPrincipal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return principal.getUserId();
    }
}
