package com.minyeo.farm.cart;

import com.minyeo.farm.cart.dto.CartItemResponse;
import com.minyeo.farm.cart.dto.CartItemUpsertRequest;
import com.minyeo.farm.cart.dto.CartQuantityPatchRequest;
import com.minyeo.farm.security.CustomUserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/my/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public List<CartItemResponse> list(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return cartService.getMyCart(principal);
    }

    @PostMapping
    public List<CartItemResponse> add(@AuthenticationPrincipal CustomUserPrincipal principal,
                                      @Valid @RequestBody CartItemUpsertRequest request) {
        return cartService.addItem(principal, request.getProductId(), request.getQuantity());
    }

    @PatchMapping("/{productId}")
    public List<CartItemResponse> patchQuantity(@AuthenticationPrincipal CustomUserPrincipal principal,
                                                @PathVariable Long productId,
                                                @Valid @RequestBody CartQuantityPatchRequest request) {
        return cartService.updateQuantity(principal, productId, request.getQuantity());
    }

    @DeleteMapping("/{productId}")
    public List<CartItemResponse> remove(@AuthenticationPrincipal CustomUserPrincipal principal,
                                         @PathVariable Long productId) {
        return cartService.removeItem(principal, productId);
    }
}

