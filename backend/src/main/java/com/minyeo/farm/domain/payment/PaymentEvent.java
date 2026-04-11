package com.minyeo.farm.domain.payment;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "payment_events")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentEvent extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "event_type", nullable = false, length = 60)
    private String eventType;

    @Column(name = "event_id", unique = true, length = 120)
    private String eventId;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String payload;

    @Builder
    public PaymentEvent(Payment payment, String eventType, String eventId, String payload) {
        this.payment = payment;
        this.eventType = eventType;
        this.eventId = eventId;
        this.payload = payload;
    }
}
