package com.minyeo.farm.review.dto;

import com.minyeo.farm.domain.review.Review;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String content;
    private String createdAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt().toString())
                .build();
    }
}
