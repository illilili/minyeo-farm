package com.minyeo.farm.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthTokenResponse {
    private String accessToken;
    private String tokenType;
}
