package com.minyeo.farm.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "C001", "입력값이 올바르지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "C002", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "C003", "접근 권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "C004", "리소스를 찾을 수 없습니다."),
    CONFLICT(HttpStatus.CONFLICT, "C005", "중복 또는 충돌이 발생했습니다."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "P001", "결제 금액이 주문 금액과 다릅니다."),
    PAYMENT_CONFIRM_FAILED(HttpStatus.BAD_GATEWAY, "P002", "결제 승인 검증에 실패했습니다."),
    PAYMENT_CANCEL_FAILED(HttpStatus.BAD_GATEWAY, "P003", "결제 취소 처리에 실패했습니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C999", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
