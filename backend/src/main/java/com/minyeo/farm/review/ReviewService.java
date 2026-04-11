package com.minyeo.farm.review;

import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.order.OrderItem;
import com.minyeo.farm.domain.order.OrderItemRepository;
import com.minyeo.farm.domain.order.OrderStatus;
import com.minyeo.farm.domain.review.Review;
import com.minyeo.farm.domain.review.ReviewRepository;
import com.minyeo.farm.review.dto.ReviewCreateRequest;
import com.minyeo.farm.review.dto.ReviewResponse;
import com.minyeo.farm.security.CustomUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewService(ReviewRepository reviewRepository, OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
    }

    /**
     * 해당 상품에 대해 현재 사용자가 작성 가능한 후기 대상이 있는지 확인한다.
     * 조건: 회원 본인 주문 + 배송완료 + 미작성(order_item 기준 1회).
     */
    @Transactional(readOnly = true)
    public boolean isWritable(Long productId, CustomUserPrincipal principal) {
        return orderItemRepository.findDeliveredItemsByProductAndUser(productId, principal.getUserId())
                .stream()
                .anyMatch(item -> reviewRepository.findByOrderItemId(item.getId()).isEmpty());
    }

    /**
     * 후기 작성: order_item 기준 1회만 허용한다.
     */
    @Transactional
    public ReviewResponse create(ReviewCreateRequest request, CustomUserPrincipal principal) {
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문상품을 찾을 수 없습니다."));
        if (orderItem.getOrder().getUser() == null || !orderItem.getOrder().getUser().getId().equals(principal.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "작성 권한이 없습니다.");
        }
        if (orderItem.getOrder().getOrderStatus() != OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_INPUT, "배송완료 주문만 후기 작성이 가능합니다.");
        }
        if (reviewRepository.findByOrderItemId(orderItem.getId()).isPresent()) {
            throw new AppException(ErrorCode.CONFLICT, "이미 후기를 작성한 주문상품입니다.");
        }
        Review review = reviewRepository.save(Review.builder()
                .product(orderItem.getProduct())
                .orderItem(orderItem)
                .rating(request.getRating())
                .content(request.getContent())
                .hidden(false)
                .build());
        return ReviewResponse.from(review);
    }
}
