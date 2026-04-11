package com.minyeo.farm.payment;

import com.minyeo.farm.payment.dto.PaymentResponse;
import com.minyeo.farm.payment.dto.TossConfirmRequest;
import com.minyeo.farm.payment.dto.TossReadyRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments/toss")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/ready")
    public PaymentResponse ready(@Valid @RequestBody TossReadyRequest request) {
        return paymentService.ready(request.getOrderId());
    }

    @PostMapping("/confirm")
    public PaymentResponse confirm(@Valid @RequestBody TossConfirmRequest request) {
        return paymentService.confirm(request);
    }

    @PostMapping("/webhook")
    public void webhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhook(payload);
    }
}
