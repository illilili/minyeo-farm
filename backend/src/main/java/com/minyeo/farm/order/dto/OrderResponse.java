package com.minyeo.farm.order.dto;

import com.minyeo.farm.domain.order.Order;
import com.minyeo.farm.domain.order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String orderNo;
    private OrderStatus orderStatus;
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;
    private String createdAt;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .orderStatus(order.getOrderStatus())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt().toString())
                .build();
    }
}
