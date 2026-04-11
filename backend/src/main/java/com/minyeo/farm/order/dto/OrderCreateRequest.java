package com.minyeo.farm.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCreateRequest {

    @Getter
    @Setter
    public static class Item {
        @NotNull
        private Long productId;

        @NotNull
        @Min(1)
        private Integer quantity;
    }

    private String buyerName;
    private String buyerPhone;
    @Email
    private String buyerEmail;
    private String orderPin;

    @NotBlank
    private String receiverName;
    @NotBlank
    private String receiverPhone;
    @NotBlank
    private String receiverZipcode;
    @NotBlank
    private String receiverAddress1;
    private String receiverAddress2;
    private String deliveryRequest;

    @Valid
    @NotEmpty
    private List<Item> items;
}
