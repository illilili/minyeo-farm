package com.minyeo.farm.order;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PendingOrderCleanupScheduler {

    private final boolean enabled;
    private final OrderService orderService;

    public PendingOrderCleanupScheduler(
            @Value("${app.scheduler.pending-order-cleanup-enabled:true}") boolean enabled,
            OrderService orderService) {
        this.enabled = enabled;
        this.orderService = orderService;
    }

    @Scheduled(fixedDelayString = "600000")
    public void cleanup() {
        if (!enabled) {
            return;
        }
        int count = orderService.cleanupPendingOrders();
        if (count > 0) {
            log.info("PENDING 주문 자동 취소 완료 count={}", count);
        }
    }
}
