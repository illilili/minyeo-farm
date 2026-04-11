package com.minyeo.farm.auth.dto;

import com.minyeo.farm.domain.user.AuthProvider;
import com.minyeo.farm.domain.user.User;
import com.minyeo.farm.domain.user.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MeResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private AuthProvider provider;

    public static MeResponse from(User user) {
        return MeResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
