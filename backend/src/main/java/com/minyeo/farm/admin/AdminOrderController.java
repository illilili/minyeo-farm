package com.minyeo.farm.admin;

import com.minyeo.farm.admin.dto.AdminOrderDetailResponse;
import com.minyeo.farm.admin.dto.AdminOrderRefundRequest;
import com.minyeo.farm.admin.dto.AdminOrderStatusPatchRequest;
import com.minyeo.farm.admin.dto.AdminOrderTrackingPatchRequest;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.order.Order;
import com.minyeo.farm.domain.order.OrderItem;
import com.minyeo.farm.domain.order.OrderItemRepository;
import com.minyeo.farm.domain.order.OrderRepository;
import com.minyeo.farm.domain.order.OrderStatus;
import com.minyeo.farm.payment.PaymentService;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;

    public AdminOrderController(OrderRepository orderRepository,
                                OrderItemRepository orderItemRepository,
                                PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<AdminOrderDetailResponse> list() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.ASC, "createdAt"));
        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        Map<Long, List<OrderItem>> itemsByOrderId = orderItemRepository.findByOrderIdIn(orderIds)
                .stream().collect(Collectors.groupingBy(item -> item.getOrder().getId()));
        return orders.stream()
                .map(order -> AdminOrderDetailResponse.from(order, itemsByOrderId.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @GetMapping("/{id}")
    public AdminOrderDetailResponse detail(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));
        return AdminOrderDetailResponse.from(order, orderItemRepository.findByOrderId(order.getId()));
    }

    @PatchMapping("/{id}/status")
    public AdminOrderDetailResponse patchStatus(@PathVariable Long id, @Valid @RequestBody AdminOrderStatusPatchRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));
        order.updateStatus(request.getOrderStatus());
        Order updated = orderRepository.save(order);
        return AdminOrderDetailResponse.from(updated, orderItemRepository.findByOrderId(updated.getId()));
    }

    @PatchMapping("/{id}/tracking")
    public AdminOrderDetailResponse patchTracking(@PathVariable Long id, @Valid @RequestBody AdminOrderTrackingPatchRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));

        if (order.getOrderStatus() != OrderStatus.PREPARING) {
            throw new AppException(ErrorCode.INVALID_INPUT, "택배 정보는 '상품 준비중' 상태에서만 저장/수정할 수 있습니다.");
        }

        order.updateTracking(request.getCourierCode(), request.getTrackingNumber());
        Order updated = orderRepository.save(order);
        return AdminOrderDetailResponse.from(updated, orderItemRepository.findByOrderId(updated.getId()));
    }

    @PatchMapping("/{id}/refund")
    public AdminOrderDetailResponse refund(@PathVariable Long id, @Valid @RequestBody AdminOrderRefundRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));
        if (order.getOrderStatus() != OrderStatus.PREPARING
                && order.getOrderStatus() != OrderStatus.SHIPPING
                && order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_INPUT, "관리자 환불은 주문 준비중 이후 상태에서만 가능합니다.");
        }

        paymentService.refundForAdmin(order, request.getCancelReason(), request.getCancelAmount());
        Order updated = orderRepository.save(order);
        return AdminOrderDetailResponse.from(updated, orderItemRepository.findByOrderId(updated.getId()));
    }

    @GetMapping("/export/xlsx")
    public ResponseEntity<byte[]> exportXlsx() {
        // MVP skeleton: 실제 xlsx 대신 CSV 바이트 반환. Apache POI로 대체 예정.
        String content = "orderNo,status,totalAmount\n" + orderRepository.findAll().stream()
                .map(o -> o.getOrderNo() + "," + o.getOrderStatus() + "," + o.getTotalAmount())
                .reduce("", (a, b) -> a + b + "\n");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content.getBytes(StandardCharsets.UTF_8));
    }
}
