package com.minyeo.farm.order;

import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.order.Order;
import com.minyeo.farm.domain.order.OrderItem;
import com.minyeo.farm.domain.order.OrderItemRepository;
import com.minyeo.farm.domain.order.OrderRepository;
import com.minyeo.farm.domain.order.OrderStatus;
import com.minyeo.farm.domain.product.Product;
import com.minyeo.farm.domain.product.ProductRepository;
import com.minyeo.farm.domain.product.ProductStatus;
import com.minyeo.farm.domain.review.ReviewRepository;
import com.minyeo.farm.domain.user.User;
import com.minyeo.farm.domain.user.UserRepository;
import com.minyeo.farm.order.dto.MyOrderDetailResponse;
import com.minyeo.farm.order.dto.MyOrderItemResponse;
import com.minyeo.farm.order.dto.OrderCreateRequest;
import com.minyeo.farm.order.dto.OrderResponse;
import com.minyeo.farm.payment.PaymentService;
import com.minyeo.farm.security.CustomUserPrincipal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private static final int SHIPPING_FEE = 3000;
    private static final int FREE_SHIPPING_THRESHOLD = 50000;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        ReviewRepository reviewRepository,
                        PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.paymentService = paymentService;
    }

    /**
     * 주문서를 생성하고 상태를 PENDING으로 저장한다.
     * 회원은 buyer 정보를 생략하면 사용자 정보로 자동 채운다.
     */
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, CustomUserPrincipal principal) {
        User user = null;
        boolean guest = principal == null;
        if (!guest) {
            user = userRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
        }

        int subtotal = 0;
        for (OrderCreateRequest.Item item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));
            if (product.getStatus() != ProductStatus.ON_SALE) {
                throw new AppException(ErrorCode.INVALID_INPUT,
                        "현재 주문할 수 없는 상품입니다: " + product.getName());
            }
            subtotal += product.getPrice() * item.getQuantity();
        }
        int shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
        int total = subtotal + shippingFee;

        String buyerName = guest ? require(request.getBuyerName(), "비회원 buyerName은 필수입니다.") : fallback(request.getBuyerName(), user.getName());
        String buyerPhone = guest ? require(request.getBuyerPhone(), "비회원 buyerPhone은 필수입니다.") : fallback(request.getBuyerPhone(), user.getPhone());
        String buyerEmail = guest ? request.getBuyerEmail() : fallback(request.getBuyerEmail(), user.getEmail());

        String hashedPin = null;
        if (guest) {
            String rawPin = require(request.getOrderPin(), "비회원 주문에는 주문 조회 PIN(4자리)이 필수입니다.");
            if (!rawPin.matches("\\d{4}")) {
                throw new AppException(ErrorCode.INVALID_INPUT, "PIN은 숫자 4자리여야 합니다.");
            }
            hashedPin = passwordEncoder.encode(rawPin);
        }

        if (!request.isAgreeTerms() || !request.isAgreePrivacy() || !request.isAgreeCancelPolicy()) {
            throw new AppException(ErrorCode.INVALID_INPUT, "이용약관, 개인정보 수집·이용, 환불 정책에 모두 동의해야 합니다.");
        }

        Order order = orderRepository.save(Order.builder()
                .orderNo("MF-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                .user(user)
                .guest(guest)
                .orderStatus(OrderStatus.PENDING)
                .buyerName(buyerName)
                .buyerPhone(buyerPhone)
                .buyerEmail(buyerEmail)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .receiverZipcode(request.getReceiverZipcode())
                .receiverAddress1(request.getReceiverAddress1())
                .receiverAddress2(request.getReceiverAddress2())
                .deliveryRequest(request.getDeliveryRequest())
                .subtotalAmount(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(total)
                .orderPin(hashedPin)
                .agreeTerms(true)
                .agreePrivacy(true)
                .agreeCancelPolicy(true)
                .agreedAt(LocalDateTime.now())
                .build());

        for (OrderCreateRequest.Item item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));
            orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .unitPriceSnapshot(product.getPrice())
                    .quantity(item.getQuantity())
                    .lineAmount(product.getPrice() * item.getQuantity())
                    .build());
        }
        return OrderResponse.from(order);
    }

    /**
     * 비회원 주문조회: 연락처 + PIN으로 조회한다.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getGuestOrders(String phone, String pin) {
        return orderRepository.findByGuestTrueAndBuyerPhoneOrderByCreatedAtDesc(phone).stream()
                .filter(order -> order.getOrderPin() != null && passwordEncoder.matches(pin, order.getOrderPin()))
                .map(OrderResponse::from)
                .toList();
    }

    /**
     * 마이페이지 주문목록: 최신순(createdAt DESC)으로 조회한다.
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(CustomUserPrincipal principal, Pageable pageable) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable).map(OrderResponse::from);
    }

    /**
     * 마이페이지 주문상세: 본인 주문만 조회 가능하다.
     */
    @Transactional(readOnly = true)
    public MyOrderDetailResponse getMyOrderDetail(Long orderId, CustomUserPrincipal principal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));
        if (order.getUser() == null || !order.getUser().getId().equals(principal.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return toMyOrderDetailResponse(order);
    }

    /**
     * 마이페이지 주문취소: 주문대기 또는 결제완료 상태에서만 허용한다.
     */
    @Transactional
    public MyOrderDetailResponse cancelMyOrder(Long orderId, CustomUserPrincipal principal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));
        if (order.getUser() == null || !order.getUser().getId().equals(principal.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        if (order.getOrderStatus() == OrderStatus.PAID) {
            paymentService.cancelApprovedPayment(order, "고객 요청 주문 취소");
        } else if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_INPUT, "해당 상태에서는 주문 취소가 불가능합니다.");
        }

        order.cancel(LocalDateTime.now());
        Order canceled = orderRepository.save(order);
        return toMyOrderDetailResponse(canceled);
    }

    @Transactional
    public OrderResponse cancelGuestOrder(Long orderId, String phone, String pin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));
        if (!order.isGuest()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        if (!phone.equals(order.getBuyerPhone())
                || order.getOrderPin() == null
                || !passwordEncoder.matches(pin, order.getOrderPin())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (order.getOrderStatus() == OrderStatus.PAID) {
            paymentService.cancelApprovedPayment(order, "비회원 고객 요청 주문 취소");
        } else if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_INPUT, "해당 상태에서는 주문 취소가 불가능합니다.");
        }

        order.cancel(LocalDateTime.now());
        return OrderResponse.from(orderRepository.save(order));
    }

    private MyOrderDetailResponse toMyOrderDetailResponse(Order order) {
        List<MyOrderItemResponse> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(item -> {
                    boolean reviewWritable = order.getOrderStatus() == OrderStatus.DELIVERED
                            && reviewRepository.findByOrderItemId(item.getId()).isEmpty();
                    return MyOrderItemResponse.from(item, reviewWritable);
                })
                .toList();
        return MyOrderDetailResponse.from(order, items);
    }

    /**
     * 2시간 이상 지난 PENDING 주문은 자동 취소한다.
     */
    @Transactional
    public int cleanupPendingOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(2);
        List<Order> targets = orderRepository.findByOrderStatusAndCreatedAtBefore(OrderStatus.PENDING, threshold);
        targets.forEach(order -> order.cancel(LocalDateTime.now()));
        return targets.size();
    }

    private String require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new AppException(ErrorCode.INVALID_INPUT, message);
        }
        return value;
    }

    private String fallback(String value, String defaultValue) {
        return (value == null || value.isBlank()) ? defaultValue : value;
    }
}

