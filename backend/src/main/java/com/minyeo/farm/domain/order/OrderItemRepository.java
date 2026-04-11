package com.minyeo.farm.domain.order;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    /** N+1 방지: 주문 ID 목록으로 상품 아이템을 한 번에 조회한다. */
    List<OrderItem> findByOrderIdIn(List<Long> orderIds);

    /** 후기 작성 가능 여부 체크: 특정 상품 + 회원 + 배송완료 주문의 아이템만 조회한다. */
    @Query("SELECT i FROM OrderItem i WHERE i.product.id = :productId AND i.order.user.id = :userId AND i.order.orderStatus = com.minyeo.farm.domain.order.OrderStatus.DELIVERED")
    List<OrderItem> findDeliveredItemsByProductAndUser(@Param("productId") Long productId, @Param("userId") Long userId);
}
