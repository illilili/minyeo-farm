package com.minyeo.farm.domain.order;

import com.minyeo.farm.domain.user.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNo(String orderNo);

    Optional<Order> findByOrderNoAndBuyerPhone(String orderNo, String buyerPhone);

    List<Order> findByGuestTrueAndBuyerPhoneOrderByCreatedAtDesc(String buyerPhone);

    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Order> findByOrderStatusAndCreatedAtBefore(OrderStatus orderStatus, LocalDateTime threshold);
}
