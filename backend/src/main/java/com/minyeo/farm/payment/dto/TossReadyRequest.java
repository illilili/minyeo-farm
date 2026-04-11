package com.minyeo.farm.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossReadyRequest {
    @NotNull
    private Long orderId;
}
