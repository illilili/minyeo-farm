package com.minyeo.farm.domain.order;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import com.minyeo.farm.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "orders")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 50)
    private String orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "is_guest", nullable = false)
    private boolean guest;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 20)
    private OrderStatus orderStatus;

    @Column(name = "buyer_name", nullable = false, length = 80)
    private String buyerName;
    @Column(name = "buyer_phone", nullable = false, length = 30)
    private String buyerPhone;
    @Column(name = "buyer_email", length = 120)
    private String buyerEmail;

    @Column(name = "receiver_name", nullable = false, length = 80)
    private String receiverName;
    @Column(name = "receiver_phone", nullable = false, length = 30)
    private String receiverPhone;
    @Column(name = "receiver_zipcode", nullable = false, length = 20)
    private String receiverZipcode;
    @Column(name = "receiver_address1", nullable = false, length = 255)
    private String receiverAddress1;
    @Column(name = "receiver_address2", length = 255)
    private String receiverAddress2;
    @Column(name = "delivery_request", length = 500)
    private String deliveryRequest;

    @Column(name = "subtotal_amount", nullable = false)
    private Integer subtotalAmount;
    @Column(name = "shipping_fee", nullable = false)
    private Integer shippingFee;
    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "courier_code", length = 40)
    private String courierCode;
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(name = "order_pin", length = 100)
    private String orderPin;

    @Column(name = "agree_terms", nullable = false)
    private boolean agreeTerms;
    @Column(name = "agree_privacy", nullable = false)
    private boolean agreePrivacy;
    @Column(name = "agree_cancel_policy", nullable = false)
    private boolean agreeCancelPolicy;
    @Column(name = "agreed_at")
    private LocalDateTime agreedAt;

    @Builder
    public Order(String orderNo, User user, boolean guest, OrderStatus orderStatus, String buyerName, String buyerPhone,
                 String buyerEmail, String receiverName, String receiverPhone, String receiverZipcode, String receiverAddress1,
                 String receiverAddress2, String deliveryRequest, Integer subtotalAmount, Integer shippingFee, Integer totalAmount,
                 String orderPin, boolean agreeTerms, boolean agreePrivacy, boolean agreeCancelPolicy, LocalDateTime agreedAt) {
        this.orderNo = orderNo;
        this.user = user;
        this.guest = guest;
        this.orderStatus = orderStatus;
        this.buyerName = buyerName;
        this.buyerPhone = buyerPhone;
        this.buyerEmail = buyerEmail;
        this.receiverName = receiverName;
        this.receiverPhone = receiverPhone;
        this.receiverZipcode = receiverZipcode;
        this.receiverAddress1 = receiverAddress1;
        this.receiverAddress2 = receiverAddress2;
        this.deliveryRequest = deliveryRequest;
        this.subtotalAmount = subtotalAmount;
        this.shippingFee = shippingFee;
        this.totalAmount = totalAmount;
        this.orderPin = orderPin;
        this.agreeTerms = agreeTerms;
        this.agreePrivacy = agreePrivacy;
        this.agreeCancelPolicy = agreeCancelPolicy;
        this.agreedAt = agreedAt;
    }

    public void markPaid(LocalDateTime paidAt) {
        this.orderStatus = OrderStatus.PAID;
        this.paidAt = paidAt;
    }

    public void cancel(LocalDateTime canceledAt) {
        this.orderStatus = OrderStatus.CANCELED;
        this.canceledAt = canceledAt;
    }

    public void updateStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
    }

    public void updateTracking(String courierCode, String trackingNumber) {
        this.courierCode = courierCode;
        this.trackingNumber = trackingNumber;
    }
}
