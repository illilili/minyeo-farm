package com.minyeo.farm.auth;

import com.minyeo.farm.auth.dto.AuthTokenResponse;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/auth/naver")
public class AuthController {

    private final AuthService authService;
    private final String frontendOrigin;

    public AuthController(AuthService authService,
                          @Value("${app.frontend-origin:http://localhost:3000}") String frontendOrigin) {
        this.authService = authService;
        this.frontendOrigin = frontendOrigin;
    }

    @GetMapping("/login")
    public Map<String, String> loginUrl() {
        return Map.of("loginUrl", authService.buildLoginUrl());
    }

    @GetMapping("/exchange")
    public AuthTokenResponse exchange(@RequestParam @NotBlank String code,
                                      @RequestParam @NotBlank String state) {
        return authService.loginByNaver(code, state);
    }

    @GetMapping(value = "/callback", produces = MediaType.TEXT_HTML_VALUE)
    public String callback(@RequestParam @NotBlank String code,
                           @RequestParam @NotBlank String state) {
        AuthTokenResponse token = authService.loginByNaver(code, state);
        String accessToken = escapeJs(token.getAccessToken());
        String origin = escapeJs(frontendOrigin);
        return """
                <!doctype html>
                <html lang="ko">
                <head><meta charset="UTF-8"><title>로그인 완료</title></head>
                <body>
                <p>로그인 완료 처리 중입니다...</p>
                <script>
                (function () {
                  const payload = { type: "MINYEO_AUTH_SUCCESS", accessToken: '%s' };
                  if (window.opener) {
                    window.opener.postMessage(payload, '%s');
                    window.close();
                    return;
                  }
                  document.body.innerHTML = "<p>로그인은 완료되었습니다. 창을 닫고 돌아가 주세요.</p>";
                })();
                </script>
                </body>
                </html>
                """.formatted(accessToken, origin);
    }

    private String escapeJs(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("'", "\\'");
    }
}
