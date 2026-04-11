package com.minyeo.farm.review;

import com.minyeo.farm.review.dto.ReviewCreateRequest;
import com.minyeo.farm.review.dto.ReviewResponse;
import com.minyeo.farm.security.CustomUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/my/reviews/writable")
    public boolean writable(@RequestParam Long productId, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return reviewService.isWritable(productId, principal);
    }

    @PostMapping("/reviews")
    public ReviewResponse create(@Valid @RequestBody ReviewCreateRequest request,
                                 @AuthenticationPrincipal CustomUserPrincipal principal) {
        return reviewService.create(request, principal);
    }
}
