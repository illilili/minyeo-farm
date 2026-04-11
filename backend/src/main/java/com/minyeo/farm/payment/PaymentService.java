package com.minyeo.farm.payment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.order.Order;
import com.minyeo.farm.domain.order.OrderStatus;
import com.minyeo.farm.domain.order.OrderRepository;
import com.minyeo.farm.domain.payment.Payment;
import com.minyeo.farm.domain.payment.PaymentEvent;
import com.minyeo.farm.domain.payment.PaymentEventRepository;
import com.minyeo.farm.domain.payment.PaymentProvider;
import com.minyeo.farm.domain.payment.PaymentRepository;
import com.minyeo.farm.domain.payment.PaymentStatus;
import com.minyeo.farm.payment.dto.PaymentResponse;
import com.minyeo.farm.payment.dto.TossConfirmRequest;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class PaymentService {

    private static final Logger paymentLogger = LoggerFactory.getLogger("PAYMENT_LOG");

    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final String tossConfirmUrl;
    private final String tossCancelUrlTemplate;
    private final String tossSecretKey;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentEventRepository paymentEventRepository,
                          OrderRepository orderRepository,
                          ObjectMapper objectMapper,
                          WebClient.Builder webClientBuilder,
                          @Value("${app.toss.confirm-url}") String tossConfirmUrl,
                          @Value("${app.toss.cancel-url-template}") String tossCancelUrlTemplate,
                          @Value("${app.toss.secret-key}") String tossSecretKey) {
        this.paymentRepository = paymentRepository;
        this.paymentEventRepository = paymentEventRepository;
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
        this.webClient = webClientBuilder.build();
        this.tossConfirmUrl = tossConfirmUrl;
        this.tossCancelUrlTemplate = tossCancelUrlTemplate;
        this.tossSecretKey = tossSecretKey;
    }

    @Transactional
    public PaymentResponse ready(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseGet(() -> paymentRepository.save(Payment.builder()
                        .order(order)
                        .pgProvider(PaymentProvider.TOSS)
                        .tossOrderId(order.getOrderNo())
                        .status(PaymentStatus.READY)
                        .build()));

        paymentLogger.info("payment_ready orderNo={} amount={}", order.getOrderNo(), order.getTotalAmount());
        return PaymentResponse.from(payment);
    }

    @Transactional
    public PaymentResponse confirm(TossConfirmRequest request) {
        Order order = orderRepository.findByOrderNo(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "주문을 찾을 수 없습니다."));

        if (!order.getTotalAmount().equals(request.getAmount())) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "결제 준비 데이터가 없습니다."));

        if (payment.getStatus() == PaymentStatus.APPROVED) {
            return PaymentResponse.from(payment);
        }

        Map<String, Object> tossResponse;
        try {
            tossResponse = requestTossConfirm(request);
        } catch (AppException exception) {
            payment.markFailed(exception.getMessage(), LocalDateTime.now());
            throw exception;
        }
        if (tossResponse == null) {
            payment.markFailed("empty_confirm_response", LocalDateTime.now());
            throw new AppException(ErrorCode.PAYMENT_CONFIRM_FAILED, "토스 승인 응답이 비어 있습니다.");
        }

        String responseOrderId = asString(tossResponse.get("orderId"));
        Integer responseAmount = asInteger(tossResponse.get("totalAmount"));
        if (!order.getOrderNo().equals(responseOrderId) || !order.getTotalAmount().equals(responseAmount)) {
            payment.markFailed("confirm_mismatch", LocalDateTime.now());
            throw new AppException(ErrorCode.PAYMENT_CONFIRM_FAILED, "토스 승인 응답 검증에 실패했습니다.");
        }

        String method = asString(tossResponse.get("method"));
        LocalDateTime approvedAt = parseApprovedAt(asString(tossResponse.get("approvedAt")));
        String rawPayload = toJson(tossResponse);

        payment.markApproved(request.getPaymentKey(), method == null ? "UNKNOWN" : method, rawPayload, approvedAt);
        order.markPaid(LocalDateTime.now());

        paymentLogger.info("payment_confirmed orderNo={} paymentKey={}", order.getOrderNo(), request.getPaymentKey());
        return PaymentResponse.from(payment);
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        String eventId = payload.get("eventId") == null ? null : payload.get("eventId").toString();
        String eventType = payload.get("eventType") == null ? "UNKNOWN" : payload.get("eventType").toString();
        String tossOrderId = payload.get("orderId") == null ? null : payload.get("orderId").toString();

        if (eventId != null && paymentEventRepository.findByEventId(eventId).isPresent()) {
            return;
        }
        if (tossOrderId == null) {
            paymentLogger.warn("webhook_without_orderId payload={}", payload);
            return;
        }

        Payment payment = paymentRepository.findByTossOrderId(tossOrderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "결제 데이터를 찾을 수 없습니다."));

        paymentEventRepository.save(PaymentEvent.builder()
                .payment(payment)
                .eventId(eventId)
                .eventType(eventType)
                .payload(payload.toString())
                .build());

        paymentLogger.info("payment_webhook eventType={} eventId={} tossOrderId={}", eventType, eventId, tossOrderId);
    }

    @Transactional
    public void cancelApprovedPayment(Order order, String cancelReason) {
        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "결제 정보를 찾을 수 없습니다."));

        if (payment.getStatus() == PaymentStatus.REFUNDED || payment.getStatus() == PaymentStatus.CANCELED) {
            return;
        }
        if (payment.getStatus() != PaymentStatus.APPROVED) {
            throw new AppException(ErrorCode.INVALID_INPUT, "결제 완료 상태에서만 자동 환불할 수 있습니다.");
        }
        if (payment.getTossPaymentKey() == null || payment.getTossPaymentKey().isBlank()) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "결제 키가 없어 환불을 진행할 수 없습니다.");
        }

        Map<String, Object> tossResponse = requestTossCancel(payment.getTossPaymentKey(), cancelReason);
        if (tossResponse == null) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "토스 취소 응답이 비어 있습니다.");
        }

        String responseOrderId = asString(tossResponse.get("orderId"));
        if (!order.getOrderNo().equals(responseOrderId)) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "토스 취소 응답 검증에 실패했습니다.");
        }

        payment.markRefunded(toJson(tossResponse), LocalDateTime.now());
        paymentLogger.info("payment_canceled orderNo={} paymentKey={}", order.getOrderNo(), payment.getTossPaymentKey());
    }

    @Transactional
    public void refundForAdmin(Order order, String cancelReason, Integer cancelAmount) {
        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "결제 정보를 찾을 수 없습니다."));
        if (payment.getStatus() != PaymentStatus.APPROVED) {
            throw new AppException(ErrorCode.INVALID_INPUT, "결제 완료된 주문만 환불할 수 있습니다.");
        }
        if (payment.getTossPaymentKey() == null || payment.getTossPaymentKey().isBlank()) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "결제 키가 없어 환불을 진행할 수 없습니다.");
        }
        if (cancelAmount != null && cancelAmount <= 0) {
            throw new AppException(ErrorCode.INVALID_INPUT, "환불 금액은 1원 이상이어야 합니다.");
        }

        Map<String, Object> tossResponse = requestTossCancel(payment.getTossPaymentKey(), cancelReason, cancelAmount);
        if (tossResponse == null) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "토스 취소 응답이 비어 있습니다.");
        }

        String responseOrderId = asString(tossResponse.get("orderId"));
        if (!order.getOrderNo().equals(responseOrderId)) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "토스 취소 응답 검증에 실패했습니다.");
        }

        payment.markRefunded(toJson(tossResponse), LocalDateTime.now());
        if (order.getOrderStatus() != OrderStatus.CANCELED) {
            order.cancel(LocalDateTime.now());
        }

        paymentLogger.info("payment_admin_refund orderNo={} paymentKey={} cancelAmount={}",
                order.getOrderNo(), payment.getTossPaymentKey(), cancelAmount == null ? "ALL" : cancelAmount);
    }

    private Map<String, Object> requestTossConfirm(TossConfirmRequest request) {
        try {
            return webClient.post()
                    .uri(tossConfirmUrl)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .headers(headers -> headers.setBasicAuth(tossSecretKey, ""))
                    .bodyValue(Map.of(
                            "paymentKey", request.getPaymentKey(),
                            "orderId", request.getOrderId(),
                            "amount", request.getAmount()
                    ))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();
        } catch (WebClientResponseException exception) {
            throw new AppException(ErrorCode.PAYMENT_CONFIRM_FAILED, extractTossErrorMessage(exception));
        } catch (Exception exception) {
            throw new AppException(ErrorCode.PAYMENT_CONFIRM_FAILED, "토스 승인 API 호출에 실패했습니다.");
        }
    }

    private Map<String, Object> requestTossCancel(String paymentKey, String cancelReason) {
        return requestTossCancel(paymentKey, cancelReason, null);
    }

    private Map<String, Object> requestTossCancel(String paymentKey, String cancelReason, Integer cancelAmount) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("cancelReason", cancelReason);
            if (cancelAmount != null) {
                requestBody.put("cancelAmount", cancelAmount);
            }

            return webClient.post()
                    .uri(String.format(tossCancelUrlTemplate, paymentKey))
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .headers(headers -> headers.setBasicAuth(tossSecretKey, ""))
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();
        } catch (WebClientResponseException exception) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, extractTossErrorMessage(exception));
        } catch (Exception exception) {
            throw new AppException(ErrorCode.PAYMENT_CANCEL_FAILED, "토스 취소 API 호출에 실패했습니다.");
        }
    }

    private String extractTossErrorMessage(WebClientResponseException exception) {
        String body = exception.getResponseBodyAsString();
        if (body == null || body.isBlank()) {
            return "토스 승인 요청이 거절되었습니다.";
        }

        try {
            Map<?, ?> errorBody = objectMapper.readValue(body, Map.class);
            Object message = errorBody.get("message");
            if (message != null) {
                return message.toString();
            }
        } catch (Exception ignored) {
            // ignore parse failure and use raw body
        }
        return body;
    }

    private String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            return payload.toString();
        }
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Integer asInteger(Object value) {
        if (value == null) return null;
        try {
            return Integer.valueOf(value.toString());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private LocalDateTime parseApprovedAt(String approvedAt) {
        if (approvedAt == null || approvedAt.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return OffsetDateTime.parse(approvedAt).toLocalDateTime();
        } catch (Exception exception) {
            return LocalDateTime.now();
        }
    }
}
