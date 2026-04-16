package com.minyeo.farm.product;

import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.product.Product;
import com.minyeo.farm.domain.product.ProductRepository;
import com.minyeo.farm.domain.product.ProductStatus;
import com.minyeo.farm.domain.review.ReviewRepository;
import com.minyeo.farm.product.dto.ProductDetailResponse;
import com.minyeo.farm.product.dto.ProductListResponse;
import com.minyeo.farm.review.dto.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getProducts(ProductStatus status, Pageable pageable) {
        if (status == null) {
            return productRepository.findByStatusNot(ProductStatus.HIDDEN, pageable).map(ProductListResponse::from);
        }
        return productRepository.findByStatus(status, pageable).map(ProductListResponse::from);
    }

    @Transactional(readOnly = true)
    public java.util.List<ProductListResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndStatusOrderByUpdatedAtDesc(ProductStatus.ON_SALE)
                .stream().map(ProductListResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));
        return ProductDetailResponse.from(product);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndHiddenFalse(productId, pageable).map(ReviewResponse::from);
    }
}
