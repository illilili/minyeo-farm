package com.minyeo.farm.domain.payment;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import com.minyeo.farm.domain.order.Order;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "payments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "pg_provider", nullable = false, length = 20)
    private PaymentProvider pgProvider;

    @Column(name = "toss_payment_key", unique = true, length = 200)
    private String tossPaymentKey;

    @Column(name = "toss_order_id", nullable = false, unique = true, length = 100)
    private String tossOrderId;

    @Column(length = 60)
    private String method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    @Column(name = "failed_at")
    private LocalDateTime failedAt;
    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Lob
    @Column(name = "raw_payload", columnDefinition = "LONGTEXT")
    private String rawPayload;

    @Builder
    public Payment(Order order, PaymentProvider pgProvider, String tossOrderId, PaymentStatus status) {
        this.order = order;
        this.pgProvider = pgProvider;
        this.tossOrderId = tossOrderId;
        this.status = status;
    }

    public void markApproved(String tossPaymentKey, String method, String rawPayload, LocalDateTime approvedAt) {
        this.tossPaymentKey = tossPaymentKey;
        this.method = method;
        this.rawPayload = rawPayload;
        this.approvedAt = approvedAt;
        this.status = PaymentStatus.APPROVED;
    }

    public void markFailed(String rawPayload, LocalDateTime failedAt) {
        this.rawPayload = rawPayload;
        this.failedAt = failedAt;
        this.status = PaymentStatus.FAILED;
    }

    public void markRefunded(String rawPayload, LocalDateTime refundedAt) {
        this.rawPayload = rawPayload;
        this.refundedAt = refundedAt;
        this.status = PaymentStatus.REFUNDED;
    }
}
