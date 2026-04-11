# Minyeo Farm MVP 작업 플랜

## 1단계: Auth + 상품조회
- 백엔드
  - Naver OAuth 로그인 URL/콜백
  - JWT 발급 및 `/api/me`
  - 상품 목록/상세/후기조회, 소식 목록/상세
- 프론트
  - 상품 목록/상세, 소식 목록/상세, 정책 페이지
- 테스트 단위
  - `GET /api/products`
  - `GET /api/products/{id}`
  - `GET /api/auth/naver/login`
  - `GET /api/me` (JWT 포함)

## 2단계: 주문 + 결제
- 백엔드
  - 주문 생성(PENDING), 회원/비회원 조회
  - Toss ready/confirm/webhook(idempotent)
  - 금액 검증(amount == order.totalAmount)
  - PENDING 2시간 자동 정리 스케줄러
- 프론트
  - 주문 작성/결제 흐름 화면
  - 결제 실패 페이지
- 테스트 단위
  - `POST /api/orders`
  - `POST /api/payments/toss/ready`
  - `POST /api/payments/toss/confirm`
  - `POST /api/payments/toss/webhook`

## 3단계: 관리자 주문/엑셀
- 백엔드
  - 관리자 주문 목록/상세
  - 상태 변경/송장 입력
  - 다운로드 엔드포인트(현재 CSV 스켈레톤, 이후 xlsx 전환)
- 프론트
  - 관리자 주문 목록 화면
- 테스트 단위
  - `GET /api/admin/orders`
  - `PATCH /api/admin/orders/{id}/status`
  - `PATCH /api/admin/orders/{id}/tracking`
  - `GET /api/admin/orders/export/xlsx`

## 4단계: 후기
- 백엔드
  - 작성 가능 여부 조회
  - 후기 작성(배송완료 + order_item 1회)
  - 관리자 숨김/삭제
- 프론트
  - 상품상세 후기 표시
  - 마이페이지 후기 작성 진입점
- 테스트 단위
  - `GET /api/my/reviews/writable`
  - `POST /api/reviews`
  - `PATCH /api/admin/reviews/{id}/hide`
