package com.minyeo.farm.domain.order;

import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    PAID,
    PREPARING,
    SHIPPING,
    DELIVERED,
    CANCELED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            PENDING,   Set.of(PAID, CANCELED),
            PAID,      Set.of(PREPARING, CANCELED),
            PREPARING, Set.of(SHIPPING, CANCELED),
            SHIPPING,  Set.of(DELIVERED),
            DELIVERED, Set.of(),
            CANCELED,  Set.of()
    );

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED.getOrDefault(this, Set.of()).contains(next);
    }
}
