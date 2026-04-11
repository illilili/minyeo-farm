package com.minyeo.farm.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossConfirmRequest {
    @NotBlank
    private String paymentKey;
    @NotBlank
    private String orderId;
    @NotNull
    private Integer amount;
}
