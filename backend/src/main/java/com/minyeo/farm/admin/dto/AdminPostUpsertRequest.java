package com.minyeo.farm.admin.dto;

import com.minyeo.farm.domain.post.PostCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPostUpsertRequest {
    @NotNull
    private PostCategory category;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private boolean published;
}
