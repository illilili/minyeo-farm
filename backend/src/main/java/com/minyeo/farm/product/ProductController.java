package com.minyeo.farm.product;

import com.minyeo.farm.domain.product.ProductStatus;
import com.minyeo.farm.product.dto.ProductDetailResponse;
import com.minyeo.farm.product.dto.ProductListResponse;
import com.minyeo.farm.review.dto.ReviewResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductListResponse> list(@RequestParam(required = false) ProductStatus status,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size,
                                          @RequestParam(defaultValue = "createdAt,DESC") String sort) {
        String[] sortSpec = sort.split(",");
        Sort.Direction direction = sortSpec.length > 1 && "ASC".equalsIgnoreCase(sortSpec[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortSpec[0]));
        return productService.getProducts(status, pageable);
    }

    @GetMapping("/featured")
    public List<ProductListResponse> featured() {
        return productService.getFeaturedProducts();
    }

    @GetMapping("/{id}")
    public ProductDetailResponse detail(@PathVariable Long id) {
        return productService.getProductDetail(id);
    }

    @GetMapping("/{id}/reviews")
    public Page<ReviewResponse> reviews(@PathVariable Long id,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productService.getProductReviews(id, pageable);
    }
}
