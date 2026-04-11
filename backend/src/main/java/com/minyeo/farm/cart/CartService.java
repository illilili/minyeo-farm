package com.minyeo.farm.cart;

import com.minyeo.farm.cart.dto.CartItemResponse;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.cart.CartItem;
import com.minyeo.farm.domain.cart.CartItemRepository;
import com.minyeo.farm.domain.product.Product;
import com.minyeo.farm.domain.product.ProductRepository;
import com.minyeo.farm.domain.user.User;
import com.minyeo.farm.domain.user.UserRepository;
import com.minyeo.farm.security.CustomUserPrincipal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> getMyCart(CustomUserPrincipal principal) {
        Long userId = getUserId(principal);
        return cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(CartItemResponse::from)
                .toList();
    }

    @Transactional
    public List<CartItemResponse> addItem(CustomUserPrincipal principal, Long productId, Integer quantity) {
        Long userId = getUserId(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .map(existing -> {
                    existing.updateQuantity(existing.getQuantity() + quantity);
                    return existing;
                })
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(quantity)
                        .build());

        cartItemRepository.save(cartItem);
        return getMyCart(principal);
    }

    @Transactional
    public List<CartItemResponse> updateQuantity(CustomUserPrincipal principal, Long productId, Integer quantity) {
        Long userId = getUserId(principal);
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "장바구니 상품을 찾을 수 없습니다."));
        cartItem.updateQuantity(quantity);
        cartItemRepository.save(cartItem);
        return getMyCart(principal);
    }

    @Transactional
    public List<CartItemResponse> removeItem(CustomUserPrincipal principal, Long productId) {
        Long userId = getUserId(principal);
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        return getMyCart(principal);
    }

    private Long getUserId(CustomUserPrincipal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return principal.getUserId();
    }
}

