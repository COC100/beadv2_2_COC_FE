// OAuth 제공자별 설정 (클라이언트 측)
// 주의: Client Secret은 절대 클라이언트에 노출하면 안 되며, 백엔드에서만 사용됩니다
export const OAUTH_CONFIG = {
  kakao: {
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
    redirectUri: typeof window !== "undefined" ? `${window.location.origin}/oauth2/callback/kakao` : "",
    scope: "profile_nickname profile_image account_email", // 카카오 공식 스코프
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    redirectUri: typeof window !== "undefined" ? `${window.location.origin}/oauth2/callback/google` : "",
    scope: "openid profile email", // Google OAuth 2.0 표준 스코프
  },
  naver: {
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
    clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
    redirectUri: typeof window !== "undefined" ? `${window.location.origin}/oauth2/callback/naver` : "",
    scope: "name email profile_image", // 네이버 공식 스코프
  },
}

// State 생성 (CSRF 방지)
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 카카오 로그인 URL 생성
export function getKakaoAuthUrl(): string {
  const state = generateState()
  sessionStorage.setItem("oauth_state", state)

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.kakao.clientId,
    redirect_uri: OAUTH_CONFIG.kakao.redirectUri,
    response_type: "code",
    state,
  })

  // 카카오는 scope 파라미터를 공백으로 구분된 문자열로 전달
  if (OAUTH_CONFIG.kakao.scope) {
    params.append("scope", OAUTH_CONFIG.kakao.scope)
  }

  return `${OAUTH_CONFIG.kakao.authUrl}?${params.toString()}`
}

// 구글 로그인 URL 생성
export function getGoogleAuthUrl(): string {
  const state = generateState()
  sessionStorage.setItem("oauth_state", state)

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.google.clientId,
    redirect_uri: OAUTH_CONFIG.google.redirectUri,
    response_type: "code",
    scope: OAUTH_CONFIG.google.scope,
    state,
    access_type: "online", // 웹 로그인은 online 권장 (offline은 refresh token 필요시)
    prompt: "select_account", // 계정 선택 화면 표시
  })

  return `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`
}

// 네이버 로그인 URL 생성
export function getNaverAuthUrl(): string {
  const state = generateState()
  sessionStorage.setItem("oauth_state", state)

  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH_CONFIG.naver.clientId,
    redirect_uri: OAUTH_CONFIG.naver.redirectUri,
    state,
  })

  // 네이버는 scope를 선택적으로 사용 (기본: name, email 제공)
  if (OAUTH_CONFIG.naver.scope) {
    params.append("scope", OAUTH_CONFIG.naver.scope)
  }

  return `${OAUTH_CONFIG.naver.authUrl}?${params.toString()}`
}

// State 검증
export function validateState(receivedState: string): boolean {
  const storedState = sessionStorage.getItem("oauth_state")
  sessionStorage.removeItem("oauth_state")
  return storedState === receivedState
}
