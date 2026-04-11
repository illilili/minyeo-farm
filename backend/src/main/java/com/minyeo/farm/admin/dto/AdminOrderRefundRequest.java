package com.minyeo.farm.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderRefundRequest {
    @NotBlank
    private String cancelReason;

    @Min(1)
    private Integer cancelAmount;
}
