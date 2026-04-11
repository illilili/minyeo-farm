package com.minyeo.farm.product.dto;

import com.minyeo.farm.domain.product.Product;
import com.minyeo.farm.domain.product.ProductStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductListResponse {
    private Long id;
    private String name;
    private Integer price;
    private ProductStatus status;
    private String thumbnailUrl;

    public static ProductListResponse from(Product product) {
        return ProductListResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .status(product.getStatus())
                .thumbnailUrl(product.getThumbnailUrl())
                .build();
    }
}
