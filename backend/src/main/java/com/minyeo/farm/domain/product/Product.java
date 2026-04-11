package com.minyeo.farm.domain.product;

import com.minyeo.farm.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "products")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder
    public Product(String name, Integer price, ProductStatus status, String thumbnailUrl, String description) {
        this.name = name;
        this.price = price;
        this.status = status;
        this.thumbnailUrl = thumbnailUrl;
        this.description = description;
    }

    public void update(String name, Integer price, ProductStatus status, String thumbnailUrl, String description) {
        this.name = name;
        this.price = price;
        this.status = status;
        this.thumbnailUrl = thumbnailUrl;
        this.description = description;
    }
}
