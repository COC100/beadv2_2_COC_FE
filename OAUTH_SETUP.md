# OAuth 2.0 소셜 로그인 설정 가이드

본 문서는 카카오, 구글, 네이버 소셜 로그인 구현을 위한 설정 가이드입니다.

## 개요

소셜 로그인은 OAuth 2.0 프로토콜을 기반으로 구현되었으며, 다음과 같은 흐름으로 동작합니다:

1. **프론트엔드**: 사용자를 각 제공자의 인증 페이지로 리다이렉트
2. **제공자**: 사용자 인증 후 authorization code 발급
3. **프론트엔드**: authorization code를 백엔드로 전송
4. **백엔드**: 토큰 교환, 사용자 정보 조회, 회원 확인/가입 처리
5. **프론트엔드**: 토큰 저장 및 로그인 완료

## 환경 변수 설정

각 OAuth 제공자의 Client ID를 환경 변수로 설정해야 합니다:

```env
# 카카오 OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_rest_api_key

# 구글 OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# 네이버 OAuth
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id

# API 서버 주소
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com
```

**중요**: Client Secret은 절대 클라이언트에 노출하면 안 되며, 백엔드에서만 사용됩니다.

## 제공자별 설정

### 1. 카카오 로그인 (Kakao Login)

#### 공식 문서
- [Kakao Login REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

#### 주요 설정
- **Authorization Endpoint**: `https://kauth.kakao.com/oauth/authorize`
- **Token Endpoint**: `https://kauth.kakao.com/oauth/token` (백엔드)
- **Redirect URI**: `http://localhost:3000/oauth2/callback/kakao` (개발) 또는 `https://yourdomain.com/oauth2/callback/kakao` (운영)
- **Scope**: `profile_nickname profile_image account_email`

#### 카카오 Developers 설정
1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. **내 애플리케이션 > 앱 설정 > 요약 정보**에서 REST API 키 확인
3. **내 애플리케이션 > 제품 설정 > 카카오 로그인**에서:
   - 카카오 로그인 활성화
   - Redirect URI 등록: `http://localhost:3000/oauth2/callback/kakao`
4. **내 애플리케이션 > 제품 설정 > 카카오 로그인 > 동의 항목**에서:
   - 닉네임, 프로필 사진, 카카오계정(이메일) 동의 항목 설정

### 2. 구글 로그인 (Google OAuth 2.0)

#### 공식 문서
- [Google OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

#### 주요 설정
- **Authorization Endpoint**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Token Endpoint**: `https://oauth2.googleapis.com/token` (백엔드)
- **Redirect URI**: `http://localhost:3000/oauth2/callback/google` (개발) 또는 `https://yourdomain.com/oauth2/callback/google` (운영)
- **Scope**: `openid profile email`

#### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. **API 및 서비스 > OAuth 동의 화면**에서:
   - 사용자 유형 선택 (외부)
   - 앱 정보 입력 (이름, 이메일 등)
   - 범위 추가: `openid`, `profile`, `email`
3. **API 및 서비스 > 사용자 인증 정보**에서:
   - OAuth 2.0 클라이언트 ID 만들기
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `http://localhost:3000/oauth2/callback/google`

### 3. 네이버 로그인 (Naver Login)

#### 공식 문서
- [Naver Developers](https://developers.naver.com/docs/login/api/)

#### 주요 설정
- **Authorization Endpoint**: `https://nid.naver.com/oauth2.0/authorize`
- **Token Endpoint**: `https://nid.naver.com/oauth2.0/token` (백엔드)
- **Redirect URI**: `http://localhost:3000/oauth2/callback/naver` (개발) 또는 `https://yourdomain.com/oauth2/callback/naver` (운영)
- **Scope**: `name email profile_image`

#### 네이버 개발자센터 설정
1. [NAVER Developers](https://developers.naver.com/)에서 애플리케이션 등록
2. **Application > 내 애플리케이션**에서:
   - 애플리케이션 이름, 사용 API(네이버 로그인) 선택
   - 제공 정보 선택: 이름, 이메일, 프로필 사진
3. **API 설정**에서:
   - 서비스 URL: `http://localhost:3000` (개발)
   - Callback URL: `http://localhost:3000/oauth2/callback/naver`

## 백엔드 API 엔드포인트

백엔드는 다음 엔드포인트를 구현해야 합니다 (API_SPEC.md 참조):

### OAuth 콜백 처리
프론트엔드에서 authorization code를 받아 처리:

```
POST /oauth2/kakao/callback
POST /oauth2/google/callback
POST /oauth2/naver/callback

Request Body:
{
  "code": "authorization_code",
  "redirectUri": "callback_url"
}

Response (기존 회원):
- Plain text: "access_token_string"
- 또는 JSON: { "accessToken": "..." }
- HttpOnly 쿠키로 refresh token 발급

Response (신규 회원):
{
  "signupToken": "temporary_signup_token"
}
```

### OAuth 회원가입 완료
```
POST /api/auth/oauth2/signup

Request Body:
{
  "provider": "kakao|google|naver",
  "signupToken": "temporary_token",
  "email": "user@example.com",
  "phone": "010-1234-5678",
  "verificationToken": "email_verification_token"
}

Response:
- Plain text: "access_token_string"
- HttpOnly 쿠키로 refresh token 발급
```

## 보안 고려사항

### 1. State Parameter (CSRF 방지)
- 각 OAuth 요청마다 랜덤한 state 값 생성
- sessionStorage에 저장 후 콜백에서 검증
- 일치하지 않으면 요청 거부

### 2. HTTPS 사용
- 운영 환경에서는 반드시 HTTPS 사용
- Redirect URI도 HTTPS로 설정

### 3. Client Secret 보호
- Client Secret은 백엔드에만 저장
- 프론트엔드에 절대 노출 금지
- 환경 변수로 관리

### 4. 토큰 관리
- Access Token: localStorage에 저장
- Refresh Token: HttpOnly 쿠키로 백엔드에서 관리
- 토큰 만료 시 자동 갱신 구현

## 프론트엔드 구현 상세

### 파일 구조
```
/lib/oauth-config.ts          # OAuth 설정 및 URL 생성
/app/login/page.tsx            # 로그인 페이지 (소셜 로그인 버튼)
/app/signup/page.tsx           # 회원가입 페이지 (소셜 회원가입 버튼)
/app/oauth2/callback/kakao/page.tsx    # 카카오 콜백
/app/oauth2/callback/google/page.tsx   # 구글 콜백
/app/oauth2/callback/naver/page.tsx    # 네이버 콜백
/app/oauth2/signup/page.tsx    # OAuth 회원가입 완료
```

### OAuth 흐름 처리

1. **로그인/회원가입 버튼 클릭**
   ```typescript
   import { getKakaoAuthUrl, getGoogleAuthUrl, getNaverAuthUrl } from "@/lib/oauth-config"
   
   // 카카오 로그인
   window.location.href = getKakaoAuthUrl()
   ```

2. **콜백 페이지에서 처리**
   - Authorization code 추출
   - State 검증
   - 백엔드로 code 전송
   - 응답에 따라 로그인 완료 또는 회원가입 페이지로 이동

3. **회원가입 완료** (신규 회원)
   - 이메일, 전화번호 입력
   - 이메일 인증
   - 백엔드로 회원가입 요청
   - 로그인 완료

## 테스트 방법

### 로컬 개발 환경
1. 환경 변수 설정 (`.env.local`)
2. 각 제공자의 개발자 센터에서 `http://localhost:3000` 등록
3. 로그인/회원가입 페이지에서 소셜 로그인 버튼 클릭
4. 인증 후 콜백 처리 확인
5. 브라우저 개발자 도구 콘솔에서 `[v0]` 로그 확인

### 디버깅
프론트엔드 코드에는 `console.log("[v0] ...")` 디버그 로그가 포함되어 있습니다:
- Authorization code 수신 확인
- State 검증 결과
- 백엔드 응답 확인
- 토큰 저장 확인

## 문제 해결

### redirect_uri_mismatch 오류
- 각 제공자의 개발자 센터에서 Redirect URI가 정확히 일치하는지 확인
- 프로토콜(http/https), 도메인, 경로가 모두 일치해야 함
- 개발/운영 환경별로 다른 URI 등록 필요

### State 검증 실패
- 브라우저의 sessionStorage가 차단되지 않았는지 확인
- 시크릿 모드에서 제대로 동작하는지 테스트

### 토큰 응답 오류
- 백엔드 API 엔드포인트 경로 확인
- CORS 설정 확인 (credentials: 'include')
- 응답 형식 확인 (JSON vs plain text)

### Client ID 오류
- 환경 변수가 올바르게 설정되었는지 확인
- NEXT_PUBLIC_ 접두사가 붙어있는지 확인
- 개발 서버 재시작

## 참고 자료

- [OAuth 2.0 공식 스펙](https://oauth.net/2/)
- [Kakao Login REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Naver Login API](https://developers.naver.com/docs/login/api/)
