package com.minyeo.farm.admin;

import com.minyeo.farm.admin.dto.AdminProductUpsertRequest;
import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.product.Product;
import com.minyeo.farm.domain.product.ProductRepository;
import com.minyeo.farm.domain.product.ProductStatus;
import com.minyeo.farm.product.dto.ProductDetailResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductRepository productRepository;

    public AdminProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDetailResponse> list() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(ProductDetailResponse::from)
                .toList();
    }

    @PostMapping
    public ProductDetailResponse create(@Valid @RequestBody AdminProductUpsertRequest request) {
        Product product = productRepository.save(Product.builder()
                .name(request.getName())
                .price(request.getPrice())
                .status(request.getStatus())
                .thumbnailUrl(request.getThumbnailUrl())
                .description(request.getDescription())
                .build());
        return ProductDetailResponse.from(product);
    }

    @PutMapping("/{id}")
    public ProductDetailResponse update(@PathVariable Long id, @Valid @RequestBody AdminProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));
        product.update(request.getName(), request.getPrice(), request.getStatus(), request.getThumbnailUrl(), request.getDescription());
        return ProductDetailResponse.from(productRepository.save(product));
    }

    @PatchMapping("/{id}/status")
    public ProductDetailResponse updateStatus(@PathVariable Long id, @RequestBody AdminProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));
        product.update(product.getName(), product.getPrice(), request.getStatus(), product.getThumbnailUrl(), product.getDescription());
        return ProductDetailResponse.from(productRepository.save(product));
    }

    @PatchMapping("/{id}/featured")
    public ProductDetailResponse toggleFeatured(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));
        if (!product.isFeatured()) {
            long count = productRepository.findByFeaturedTrueAndStatusOrderByUpdatedAtDesc(ProductStatus.ON_SALE).size();
            if (count >= 3) {
                throw new AppException(ErrorCode.INVALID_INPUT, "홈 표시 상품은 최대 3개까지 선택할 수 있습니다.");
            }
        }
        product.setFeatured(!product.isFeatured());
        return ProductDetailResponse.from(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "상품을 찾을 수 없습니다."));

        // 주문/장바구니/리뷰 이력 FK를 깨지 않도록 물리삭제 대신 비노출 처리
        product.update(
                product.getName(),
                product.getPrice(),
                ProductStatus.HIDDEN,
                product.getThumbnailUrl(),
                product.getDescription()
        );
        productRepository.save(product);
    }
}
