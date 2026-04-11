package com.minyeo.farm.domain.order;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import com.minyeo.farm.domain.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "order_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name_snapshot", nullable = false, length = 120)
    private String productNameSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false)
    private Integer unitPriceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "line_amount", nullable = false)
    private Integer lineAmount;

    @Builder
    public OrderItem(Order order, Product product, String productNameSnapshot, Integer unitPriceSnapshot, Integer quantity, Integer lineAmount) {
        this.order = order;
        this.product = product;
        this.productNameSnapshot = productNameSnapshot;
        this.unitPriceSnapshot = unitPriceSnapshot;
        this.quantity = quantity;
        this.lineAmount = lineAmount;
    }
}
