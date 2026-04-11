package com.minyeo.farm.admin.dto;

import com.minyeo.farm.domain.product.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductUpsertRequest {
    @NotBlank
    private String name;
    @NotNull
    @Min(0)
    private Integer price;
    @NotNull
    private ProductStatus status;
    private String thumbnailUrl;
    private String description;
}
