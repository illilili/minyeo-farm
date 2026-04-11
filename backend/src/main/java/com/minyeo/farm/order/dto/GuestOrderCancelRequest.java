package com.minyeo.farm.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuestOrderCancelRequest {
    @NotBlank
    private String phone;

    @NotBlank
    private String orderPin;
}
