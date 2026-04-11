package com.minyeo.farm.auth;

import com.minyeo.farm.auth.dto.MeResponse;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.user.User;
import com.minyeo.farm.domain.user.UserRepository;
import com.minyeo.farm.security.CustomUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

    private final UserRepository userRepository;

    public MeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        return MeResponse.from(user);
    }
}
