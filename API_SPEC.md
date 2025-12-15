# MODI 서비스 API 명세

본 문서는 member-service, account-service, seller-service, product-service, rental-service, review-service, notification-service 의 컨트롤러 기반 API 명세입니다. 기본 응답은 `ApiResponse<T>`(`success:boolean, code:string, message:string, data:T`)를 사용하며, 내부용(wallet/product/rental/settlement) 엔드포인트와 리뷰 삭제는 래퍼 없이 원본을 반환하고 알림 스트림은 text/event-stream을 반환합니다.

## 인증/권한
- JWT Bearer: 헤더 `Authorization: Bearer <accessToken>`
- 토큰 예외: 회원가입 `POST /api/members/signup`, 인증 구간 `/api/auth/**`, Swagger(`/swagger-ui/**`, `/v3/api-docs/**`), Actuator(`/actuator/**`), 내부용 `/internal/**`
- 기본 Role 클레임: `ROLE_<role>`(MemberRole), 기본 USER. principal(CustomMember.memberId) 필요 API는 토큰 필수.

## Enum 목록
- AddressType: `MEMBER`, `SELLER`
- MemberRole: `USER`, `SELLER`
- MemberStatus: `ACTIVE`, `INACTIVE`, `WITHDRAWN`
- ProductCategory: `LAPTOP`, `DESKTOP`, `CAMERA`, `TABLET`, `MOBILE`, `MONITOR`, `ACCESSORY`, `DRONE`, `AUDIO`, `PROJECTOR`
- ProductStatus: `ACTIVE`, `INACTIVE`, `DELETE`
- ProductSortType: `LATEST`, `OLDEST`, `PRICE_HIGH`, `PRICE_LOW`
- WalletTransactionType: `DEPOSIT_CHARGE`, `RENTAL_PAYMENT`, `RENTAL_REFUND`, `DEPOSIT_CANCEL`, `ADJUST`
- PgDepositStatus: `REQUESTED`, `SUCCESS`, `FAILED`, `CANCELED`
- SellerStatus: `ACTIVE`, `SUSPENDED`, `CLOSED`
- SellerSettlementStatus: `READY`, `PAID`, `CANCELED`
- SettlementBatchStatus: `READY`, `CALCULATING`, `COMPLETED`, `FAILED`
- RentalStatus: `REQUESTED`, `PARTIALLY_ACCEPTED`, `ACCEPTED`, `PAID`, `IN_PROGRESS`, `CANCELED`, `COMPLETED`
- RentalItemStatus: `REQUESTED`, `ACCEPTED`, `REJECTED`, `PAID`, `RENTING`, `RETURNED`, `CANCELED`

---
## member-service
### 회원
- **POST /api/members/signup** — 회원가입
  - Req: `email:string(email)`, `password:string(8-20, 영문+숫자+특수문자)`, `name:string<=20`, `phone:string(휴대폰)`
  - Res: `MemberSignupResponse { email, name, phone, createdAt:datetime }`
- **GET /api/members/profile** — 내 정보 조회 (Auth)
  - Res: `MemberProfileResponse { id:long, name, phone }`
- **PUT /api/members/profile** — 내 정보 수정 (Auth)
  - Req: `name?:string<=20`, `phone?:string(휴대폰)`
  - Res: `MemberProfileResponse`
- **PATCH /api/members/passwords** — 비밀번호 수정 (Auth)
  - Req: `name:string`, `password:string(규칙 동일)`, `email:string`, `verificationCode:string(6)`
  - Res: `Void`
- **DELETE /api/members** — 회원 탈퇴 (Auth)
  - Res: `Void`

### 주소
- **GET /api/addresses/profile** — 내 배송지 목록 (Auth)
  - Res: `AddressResponse[] { addressId, addressLabel, recipientName, recipientPhone, type:AddressType, postcode, roadAddress, detailAddress, isDefault:boolean }`
- **POST /api/addresses/profile** — 배송지 등록 (Auth)
  - Req: `addressLabel:string<=30`, `recipientName:string<=20`, `recipientPhone:string(휴대폰)`, `type:AddressType`, `postcode:string(5)`, `roadAddress:string<=100`, `detailAddress:string<=100`, `isDefault:boolean`
  - Res: `Void` (201)
- **PUT /api/addresses/profile/{addressId}** — 배송지 수정 (Auth)
  - Path: `addressId:long`
  - Req: 각 필드 선택적(`addressLabel`, `recipientName`, `recipientPhone`, `type`, `postcode`, `roadAddress`, `detailAddress`, `isDefault:boolean`)
  - Res: `Void`
- **DELETE /api/addresses/profile/{addressId}** — 배송지 삭제 (Auth)
  - Path: `addressId:long`
  - Res: `Void`

### 인증
- **POST /api/auth/login**
  - Req: `email`, `password:string(8-20 영문/숫자/특수문자)`
  - Res: `MemberLoginResponse { accessToken, refreshToken, member:{ id:long, email, name, role } }`
- **POST /api/auth/email/verify/send**
  - Req: `email`
  - Res: `EmailVerificationSendResponse { result:"OK" }`
- **POST /api/auth/email/verify/confirm**
  - Req: `email`, `code:string(6)`
  - Res: `EmailVerificationConfirmResponse { verified:boolean }`
- **POST /api/auth/password/reset/send**
  - Req: `email`
  - Res: `Void`
- **POST /api/auth/password/reset/confirm**
  - Req: `email`, `code:string(6)`, `newPassword:string(규칙 동일)`
  - Res: `Void`

---
## account-service
### 지갑
- **GET /api/accounts/balance** — 내 예치금 (Auth)
  - Res: `MemberWalletResponse { balance:decimal, createdAt:datetime }`
- **GET /api/accounts/transactions** — 내 거래내역 (Auth)
  - Res: `WalletTransactionResponse[] { txType:WalletTransactionType, amount, balanceAfter, relatedRentalId?:long, relatedPgDepositId?:long, relatedSettlementId?:long, description, createdAt }`

### PG 예치금
- **POST /api/deposits/pg/request** — 충전 요청 (Auth)
  - Req: `amount:decimal>0`
  - Res: `DepositResponse { id, memberId, amount, status:PgDepositStatus, pgProvider, orderId, requestedAt, approvedAt, failedReason }`
- **POST /api/deposits/pg/approve** — 결제 승인
  - Req: `paymentKey`, `orderId`, `amount:decimal`
  - Res: `DepositResponse`
- **GET /api/deposits/pg/config** — 위젯 설정
  - Res: `TossConfigResponse { clientKey, successUrl, failUrl }`
- **POST /api/deposits/pg/cancel** — 충전 취소/환불 (Auth)
  - Req: `paymentKey`, `orderId`, `amount:decimal`, `reason:string`
  - Res: `DepositResponse`

### 내부 지갑 (래퍼 없음)
- **POST /internal/wallets/{memberId}** — 지갑 생성
  - Path: `memberId:long`
  - Res: `Void`
- **POST /internal/wallets/rental-payment** — 대여 결제 차감
  - Req: `memberId:long`, `rentalId:long`, `amount:decimal`
  - Res: `RentalPaymentResponse { walletId, memberId, balance:decimal }`
- **POST /internal/wallets/rental-refund** — 대여 환불 적립
  - Req: `memberId:long`, `rentalId:long`, `rentalItemId:long`, `amount:decimal`
  - Res: `RentalPaymentResponse`

---
## seller-service
### 판매자 기본
- **POST /api/sellers** — 판매자 등록 (Auth)
  - Req: `storeName:string<=50`, `bizRegNo?:string<=20`, `storePhone?:string<=20`
  - Res: `SellerDetailResponse { sellerId, memberId, storeName, bizRegNo, storePhone, status:SellerStatus, createdAt, updatedAt }`
- **GET /api/sellers/self** — 내 판매자 (Auth)
  - Res: `SellerDetailResponse`
- **GET /api/sellers/self/rentals** — 내 대여 목록 (Auth)
  - Query: `productId?:long`, `status:string`, `startDate:yyyy-MM-dd`, `endDate:yyyy-MM-dd`, `page?:int`, `size?:int`
  - Res: `SellerRentalResponse[] { rentalItemId, productId, memberId, sellerId, status, totalAmount:decimal, startDate, endDate, paidAt }`
- **PUT /api/sellers/self** — 내 판매자 수정 (Auth)
  - Req: `storeName`, `bizRegNo?`, `storePhone?`, `status:SellerStatus`
  - Res: `SellerDetailResponse`

### 내부 판매자 (래퍼 없음)
- **GET /internal/sellers/by-member/{memberId}** — 판매자 ID 조회
  - Res: `SellerIdResponse { sellerId, memberId }`
- **GET /internal/sellers/{sellerId}** — 판매자 조회
  - Res: `SellerDetailResponse`

### 판매자 정산(셀프)
- **GET /api/settlements/sellers/self** — 내 정산 목록 (Auth)
  - Query: `periodYm?:yyyy-MM`, `pageable`
  - Res: `Page<SellerSettlementResponse>`
- **GET /api/settlements/sellers/self/{sellerSettlementId}** — 단건 (Auth)
  - Res: `SellerSettlementResponse`
- **GET /api/settlements/sellers/self/{sellerSettlementId}/lines** — 라인 상세 (Auth)
  - Res: `SellerSettlementLineResponse[] { id, sellerSettlementId, sellerId, rentalItemId, memberId, productId, rentalAmount, feeAmount }`
- **POST /api/settlements/sellers/self/{sellerSettlementId}/pay** — 지급 처리 (Auth)
  - Query: `paidAt?:ISO_LOCAL_DATE_TIME`(기본 now)
  - Res: `SellerSettlementResponse`
- **POST /api/settlements/sellers/self/{sellerSettlementId}/cancel** — 정산 취소 (Auth)
  - Res: `SellerSettlementResponse`

### 정산 배치 내부 (래퍼 ApiResponse)
- **POST /internal/settlements/batches** — 배치 생성
  - Req: `periodYm:string`
  - Res: `SettlementBatchResponse { id, periodYm, status:SettlementBatchStatus, startedAt, completedAt, createdAt, updatedAt }`
- **POST /internal/settlements/batches/{batchId}/start** — 배치 시작 표시
  - Res: `SettlementBatchResponse`
- **POST /internal/settlements/batches/{batchId}/complete** — 배치 완료 표시
  - Res: `SettlementBatchResponse`
- **GET /internal/settlements/batches** — 배치 목록
  - Query: `periodYm?:string`, `pageable`
  - Res: `Page<SettlementBatchResponse>`
- **GET /internal/settlements/batches/{batchId}** — 배치 단건
  - Res: `SettlementBatchResponse`
- **POST /internal/settlements/batches/{batchId}/run** — 배치 실행
  - Req: `SettlementBatchRunCommand { periodYm?, startDate?, endDate?, sellerId?, pageSize? }`
  - Res: `SettlementBatchResponse`

---
## product-service
### 상품
- **GET /api/products** — 상품 스크롤 목록
  - Query: `keyword?`, `category?:ProductCategory`, `minPrice?:decimal`, `maxPrice?:decimal`, `sellerId?:long`, `startDate?:date`, `endDate?:date`, `cursor?:string`, `size:int=20`, `sortType:ProductSortType=LATEST`
  - Res: `ProductScrollResponse { products:ProductListResponse[], nextCursor:string, hasNext:boolean }`, `ProductListResponse { productId, name, pricePerDay, status:ProductStatus, sellerId, thumbnailUrl }`
- **GET /api/products/seller** — 내 상품 목록 (Auth)
  - Query: `pageable`(size=20, sort=createdAt,desc 기본)
  - Res: `Page<ProductListResponse>`
- **GET /api/products/{productId}** — 상품 상세 (Auth)
  - Res: `ProductDetailResponse { productId, sellerId, name, description, pricePerDay, status:ProductStatus, category, thumbnailImageId, images:ImageInfo[] }`
  - `ImageInfo { imageId, url, ordering }`
- **POST /api/products** — 상품 등록 (Auth)
  - Req: `name`, `description`, `pricePerDay:decimal>0`, `category:ProductCategory`, `images?:string[]`
  - Res: `ProductDetailResponse` (201)
- **PUT /api/products/{productId}** — 상품 수정 (Auth)
  - Req: `name`, `description`, `pricePerDay:decimal>0`, `category`, `images?:ImageInfo[] (imageId?, url, ordering)`
  - Res: `ProductDetailResponse`
- **PATCH /api/products/{productId}/active** — 활성화 (Auth)
  - Res: `Void`
- **PATCH /api/products/{productId}/inactive** — 숨김 (Auth)
  - Res: `Void`
- **DELETE /api/products/{productId}** — 삭제 (Auth)
  - Res: `Void`

### 이미지
- **POST /api/images/upload** — 이미지 업로드 (Auth)
  - Req: multipart `file`, query `dir?:string`
  - Res: `String`(imageUrl) (201)

### 내부 상품 (래퍼 없음)
- **POST /internal/products/bulk** — 상품 다건 조회
  - Req: `productIds:long[]`
  - Res: `ProductBulkResponse[] { productId, sellerId, price:decimal, status:string }`

---
## rental-service
### 대여 생성/결제/상태
- **POST /api/rentals/carts** — 장바구니 대여 생성 (Auth)
  - Req: `cartItemIds:long[] (>0)`
  - Res: `Void` (201)
- **POST /api/rentals** — 바로 대여 생성 (Auth)
  - Req: `productId:long`, `startDate:date(오늘 이후)`, `endDate:date(오늘 이후)`
  - Res: `Void` (201)
- **PATCH /api/rentals/{rentalItemId}/accept** — 판매자 수락 (Auth)
  - Path: `rentalItemId:long`
  - Res: `Void`
- **PATCH /api/rentals/{rentalItemId}/reject** — 판매자 거절 (Auth)
  - Res: `Void`
- **POST /api/rentals/{rentalId}/pay** — 결제 완료 처리 (Auth)
  - Path: `rentalId:long`
  - Res: `PayRentalResponse { rentalId, paidAt:datetime, amount:decimal, balance:decimal, rentalStatus:string }`
- **POST /api/rentals/{rentalItemId}/rent** — 대여 시작 처리 (Auth)
  - Path: `rentalItemId:long`
  - Res: `Void` (결제 완료된 아이템을 대여 시작 상태(RENTING)로 전환)
- **PATCH /api/rentals/{rentalItemId}/cancel** — 대여 취소 (Auth)
  - Path: `rentalItemId:long`
  - Res: `Void`
- **POST /api/rentals/{rentalItemId}/return** — 반납 처리 (Auth)
  - Path: `rentalItemId:long`
  - Req: `damageFee?:decimal>=0`, `damageReason?:string<=255`, `lateFee?:decimal>=0`, `lateReason?:string<=255`, `memo?:string<=500`
  - Res: `RentalReturnResponse { rentalId, rentalItemId, status, extraFeeAmount }`
- **POST /api/rentals/{rentalItemId}/refund** — 환불 (Auth)
  - Path: `rentalItemId:long`
  - Res: `Void`
- **POST /api/rentals/{rentalItemId}/extend** — 대여 연장 (Auth)
  - Path: `rentalItemId:long`
  - Req: `newEndDate:date(오늘 이후)`
  - Res: `Void`
- **GET /api/rentals/{rentalId}** — 대여 상세 (Auth)
  - Path: `rentalId:long`
  - Res: `RentalResponse { rentalId, paidAt, items:RentalItemResponse[] }`, `RentalItemResponse { rentalItemId, productId, startDate, endDate, status, unitPrice:decimal }`
- **GET /api/rentals** — 대여 검색 (Auth)
  - Query: `startDate?:date`, `endDate?:date`, `rentalStatus?:RentalStatus`
  - Res: `RentalResponse[]`

### 장바구니
- **GET /api/carts** — 내 장바구니 (Auth)
  - Res: `CartResponse { items:CartItemResponse[], updatedAt }`, `CartItemResponse { cartItemId, productId, startDate, endDate, price:decimal, status }`
- **POST /api/carts/items** — 아이템 추가 (Auth)
  - Req: `productId:long`, `startDate:date(오늘 이후)`, `endDate:date(오늘 이후)`
  - Res: `Void`
- **PUT /api/carts/me/items/{cartItemId}** — 아이템 수정 (Auth)
  - Path: `cartItemId:long`
  - Req: `startDate`, `endDate`
  - Res: `Void`
- **DELETE /api/carts/me/items/{cartItemId}** — 아이템 삭제 (Auth)
  - Path: `cartItemId:long`
  - Res: `Void`

### 내부 대여 (래퍼 없음)
- **GET /internal/rentals** — 판매자/기간별 대여 아이템 목록
  - Query(ModelAttribute): `sellerId:long`, `productId?:long`, `status:RentalItemStatus`, `startDate:date`, `endDate:date`, `pageable`
  - Res: `RentalItemInfoListResponse { rentalItemInfoList:RentalItemInfo[], totalCount:long, totalPages:int }`
  - `RentalItemInfo { rentalItemId, productId, memberId, sellerId, status, totalAmount:decimal, startDate, endDate, paidAt }`
- **POST /internal/rentals/unavailable-products** — 기간 중 대여 불가 상품
  - Req: `startDate:date(오늘 이후)`, `endDate:date(오늘 이후)`, `productIds:long[]`
  - Res: `UnavailableProductsResponse { unavailableProductIds:long[] }`

---
## review-service
- **POST /api/reviews** — 판매자 리뷰 작성 (Auth)
  - Req: `rentalItemId:long`, `sellerId:long`, `rating:short(1~5)`, `content:string`
  - Res: `ReviewResponse { id, rentalItemId, sellerId, memberId, rating, content, createdAt, updatedAt }` (201)
- **PATCH /api/reviews/{reviewId}** — 리뷰 수정 (Auth)
  - Req: `rating?:short(1~5)`, `content?:string`
  - Res: `ReviewResponse`
- **DELETE /api/reviews/{reviewId}** — 리뷰 삭제(소프트)
  - Res: `204 No Content` (래퍼 없음)
- **GET /api/reviews/{reviewId}** — 리뷰 상세
  - Res: `ReviewResponse`
- **GET /api/reviews** — 판매자 리뷰 목록
  - Query: `sellerId:long`, `pageable(sort=createdAt,desc 기본)`
  - Res: `ReviewSummaryResponse[] { id, rentalItemId, sellerId, memberId, rating, content, createdAt }`
- **GET /api/reviews/me** — 내가 작성한 리뷰 목록 (Auth)
  - Query: `pageable(sort=createdAt,desc 기본)`
  - Res: `ReviewSummaryResponse[]`

---
## notification-service
- **GET /api/notifications/stream** — 알림 SSE 구독 (Auth)
  - Res: `SseEmitter` stream(`text/event-stream`), 클라이언트는 Last-Event-ID 지원 시 재연결 처리
