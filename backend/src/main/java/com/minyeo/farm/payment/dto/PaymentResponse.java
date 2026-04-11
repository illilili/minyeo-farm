package com.minyeo.farm.payment.dto;

import com.minyeo.farm.domain.payment.Payment;
import com.minyeo.farm.domain.payment.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {
    private Long paymentId;
    private String tossOrderId;
    private PaymentStatus status;

    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .tossOrderId(payment.getTossOrderId())
                .status(payment.getStatus())
                .build();
    }
}
