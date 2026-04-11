package com.minyeo.farm.post.dto;

import com.minyeo.farm.domain.post.Post;
import com.minyeo.farm.domain.post.PostCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostResponse {
    private Long id;
    private PostCategory category;
    private String title;
    private String content;
    private String authorName;
    private Long viewCount;
    private String createdAt;

    public static PostResponse from(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .authorName(post.getCreatedBy() == null ? "관리자" : post.getCreatedBy().getName())
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt().toString())
                .build();
    }
}
