package com.minyeo.farm.domain.review;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndHiddenFalse(Long productId, Pageable pageable);

    Optional<Review> findByOrderItemId(Long orderItemId);
}
