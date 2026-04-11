package com.minyeo.farm.admin;

import com.minyeo.farm.common.exception.AppException;
import com.minyeo.farm.common.exception.ErrorCode;
import com.minyeo.farm.domain.review.Review;
import com.minyeo.farm.domain.review.ReviewRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    private final ReviewRepository reviewRepository;

    public AdminReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @PatchMapping("/{id}/hide")
    public void hide(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "후기를 찾을 수 없습니다."));
        review.hide();
        reviewRepository.save(review);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reviewRepository.deleteById(id);
    }
}
