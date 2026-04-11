package com.minyeo.farm.cart.dto;

import com.minyeo.farm.domain.cart.CartItem;
import com.minyeo.farm.domain.product.ProductStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartItemResponse {
    private Long productId;
    private String productName;
    private Integer price;
    private ProductStatus status;
    private String thumbnailUrl;
    private Integer quantity;
    private Integer lineAmount;

    public static CartItemResponse from(CartItem cartItem) {
        return CartItemResponse.builder()
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .price(cartItem.getProduct().getPrice())
                .status(cartItem.getProduct().getStatus())
                .thumbnailUrl(cartItem.getProduct().getThumbnailUrl())
                .quantity(cartItem.getQuantity())
                .lineAmount(cartItem.getProduct().getPrice() * cartItem.getQuantity())
                .build();
    }
}

