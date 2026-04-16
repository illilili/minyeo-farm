package com.minyeo.farm.domain.product;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByStatusNot(ProductStatus status, Pageable pageable);

    List<Product> findByFeaturedTrueAndStatusOrderByUpdatedAtDesc(ProductStatus status);
}
