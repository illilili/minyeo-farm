package com.minyeo.farm.domain.payment;

import com.minyeo.farm.domain.order.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrder(Order order);

    Optional<Payment> findByTossOrderId(String tossOrderId);
}
