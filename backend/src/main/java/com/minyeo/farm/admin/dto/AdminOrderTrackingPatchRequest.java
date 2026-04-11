package com.minyeo.farm.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderTrackingPatchRequest {
    @NotBlank
    private String courierCode;
    @NotBlank
    private String trackingNumber;
}
