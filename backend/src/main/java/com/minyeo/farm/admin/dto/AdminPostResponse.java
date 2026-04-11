package com.minyeo.farm.admin.dto;

import com.minyeo.farm.domain.post.Post;
import com.minyeo.farm.domain.post.PostCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPostResponse {
    private Long id;
    private PostCategory category;
    private String title;
    private String content;
    private boolean published;
    private String createdAt;

    public static AdminPostResponse from(Post post) {
        return AdminPostResponse.builder()
                .id(post.getId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .published(post.isPublished())
                .createdAt(post.getCreatedAt().toString())
                .build();
    }
}

