package com.minyeo.farm.order.dto;

import com.minyeo.farm.domain.order.OrderItem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyOrderItemResponse {
    private Long orderItemId;
    private Long productId;
    private String productName;
    private Integer unitPrice;
    private Integer quantity;
    private Integer lineAmount;
    private boolean reviewWritable;

    public static MyOrderItemResponse from(OrderItem item, boolean reviewWritable) {
        return MyOrderItemResponse.builder()
                .orderItemId(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductNameSnapshot())
                .unitPrice(item.getUnitPriceSnapshot())
                .quantity(item.getQuantity())
                .lineAmount(item.getLineAmount())
                .reviewWritable(reviewWritable)
                .build();
    }
}

