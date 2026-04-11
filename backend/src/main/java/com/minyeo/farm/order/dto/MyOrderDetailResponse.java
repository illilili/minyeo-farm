package com.minyeo.farm.order.dto;

import com.minyeo.farm.domain.order.Order;
import com.minyeo.farm.domain.order.OrderStatus;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyOrderDetailResponse {
    private Long id;
    private String orderNo;
    private OrderStatus orderStatus;
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;
    private String createdAt;
    private String courierCode;
    private String trackingNumber;
    private List<MyOrderItemResponse> items;

    public static MyOrderDetailResponse from(Order order, List<MyOrderItemResponse> items) {
        return MyOrderDetailResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .orderStatus(order.getOrderStatus())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt().toString())
                .courierCode(order.getCourierCode())
                .trackingNumber(order.getTrackingNumber())
                .items(items)
                .build();
    }
}
