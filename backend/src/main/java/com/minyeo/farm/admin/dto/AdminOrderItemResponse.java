package com.minyeo.farm.admin.dto;

import com.minyeo.farm.domain.order.OrderItem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminOrderItemResponse {
    private Long productId;
    private String productName;
    private Integer unitPrice;
    private Integer quantity;
    private Integer lineAmount;

    public static AdminOrderItemResponse from(OrderItem item) {
        return AdminOrderItemResponse.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProductNameSnapshot())
                .unitPrice(item.getUnitPriceSnapshot())
                .quantity(item.getQuantity())
                .lineAmount(item.getLineAmount())
                .build();
    }
}

