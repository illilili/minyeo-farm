package com.minyeo.farm.domain.payment;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentEventRepository extends JpaRepository<PaymentEvent, Long> {
    Optional<PaymentEvent> findByEventId(String eventId);
}
