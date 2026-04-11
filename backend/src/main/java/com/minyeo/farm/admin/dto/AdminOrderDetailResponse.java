package com.minyeo.farm.admin.dto;

import com.minyeo.farm.domain.order.Order;
import com.minyeo.farm.domain.order.OrderItem;
import com.minyeo.farm.domain.order.OrderStatus;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminOrderDetailResponse {
    private Long id;
    private String orderNo;
    private OrderStatus orderStatus;
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;
    private String createdAt;

    private String buyerName;
    private String buyerPhone;
    private String buyerEmail;

    private String receiverName;
    private String receiverPhone;
    private String receiverZipcode;
    private String receiverAddress1;
    private String receiverAddress2;
    private String deliveryRequest;

    private String courierCode;
    private String trackingNumber;
    private List<AdminOrderItemResponse> items;

    public static AdminOrderDetailResponse from(Order order, List<OrderItem> items) {
        return AdminOrderDetailResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .orderStatus(order.getOrderStatus())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt().toString())
                .buyerName(order.getBuyerName())
                .buyerPhone(order.getBuyerPhone())
                .buyerEmail(order.getBuyerEmail())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverZipcode(order.getReceiverZipcode())
                .receiverAddress1(order.getReceiverAddress1())
                .receiverAddress2(order.getReceiverAddress2())
                .deliveryRequest(order.getDeliveryRequest())
                .courierCode(order.getCourierCode())
                .trackingNumber(order.getTrackingNumber())
                .items(items.stream().map(AdminOrderItemResponse::from).toList())
                .build();
    }
}

