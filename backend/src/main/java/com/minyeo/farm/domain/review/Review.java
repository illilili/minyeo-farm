package com.minyeo.farm.domain.review;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import com.minyeo.farm.domain.order.OrderItem;
import com.minyeo.farm.domain.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "reviews")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false, unique = true)
    private OrderItem orderItem;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_hidden", nullable = false)
    private boolean hidden;

    @Builder
    public Review(Product product, OrderItem orderItem, Integer rating, String content, boolean hidden) {
        this.product = product;
        this.orderItem = orderItem;
        this.rating = rating;
        this.content = content;
        this.hidden = hidden;
    }

    public void hide() {
        this.hidden = true;
    }
}
