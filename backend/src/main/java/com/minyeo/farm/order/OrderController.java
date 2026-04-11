package com.minyeo.farm.order;

import com.minyeo.farm.order.dto.OrderCreateRequest;
import com.minyeo.farm.order.dto.GuestOrderCancelRequest;
import com.minyeo.farm.order.dto.MyOrderDetailResponse;
import com.minyeo.farm.order.dto.OrderResponse;
import com.minyeo.farm.security.CustomUserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    public OrderResponse create(@Valid @RequestBody OrderCreateRequest request,
                                @AuthenticationPrincipal CustomUserPrincipal principal) {
        return orderService.createOrder(request, principal);
    }

    @GetMapping("/orders/guest")
    public List<OrderResponse> guestOrders(@RequestParam String phone, @RequestParam String pin) {
        return orderService.getGuestOrders(phone, pin);
    }

    @PatchMapping("/orders/guest/{orderId}/cancel")
    public OrderResponse cancelGuestOrder(@PathVariable Long orderId, @Valid @RequestBody GuestOrderCancelRequest request) {
        return orderService.cancelGuestOrder(orderId, request.getPhone(), request.getOrderPin());
    }

    @GetMapping("/my/orders")
    public Page<OrderResponse> myOrders(@AuthenticationPrincipal CustomUserPrincipal principal,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderService.getMyOrders(principal, pageable);
    }

    @GetMapping("/my/orders/{orderId}")
    public MyOrderDetailResponse myOrderDetail(@PathVariable Long orderId, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return orderService.getMyOrderDetail(orderId, principal);
    }

    @PatchMapping("/my/orders/{orderId}/cancel")
    public MyOrderDetailResponse cancelMyOrder(@PathVariable Long orderId,
                                               @AuthenticationPrincipal CustomUserPrincipal principal) {
        return orderService.cancelMyOrder(orderId, principal);
    }
}
