package com.minyeo.farm.admin.dto;

import com.minyeo.farm.domain.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderStatusPatchRequest {
    @NotNull
    private OrderStatus orderStatus;
}
