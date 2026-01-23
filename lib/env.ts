// 환경변수 검증 유틸리티
// 서버 측에서만 사용되는 환경변수와 클라이언트에서도 사용 가능한 환경변수를 구분합니다.

/**
 * 클라이언트에서 접근 가능한 환경변수 (NEXT_PUBLIC_ 접두사)
 */
export const clientEnv = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  // VAPID 공개키
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
};

/**
 * 서버에서만 접근 가능한 환경변수
 * 주의: 이 객체는 서버 컴포넌트나 API 라우트에서만 사용해야 합니다.
 */
export const serverEnv = {
  // VAPID 비밀키 (절대 클라이언트에 노출 금지!)
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY!,
  // VAPID 식별자
  VAPID_SUBJECT: process.env.VAPID_SUBJECT!,
};

/**
 * 필수 환경변수가 설정되어 있는지 검증합니다.
 * 서버 시작 시 또는 API 라우트에서 호출하여 설정 누락을 조기에 발견합니다.
 */
export function validateServerEnv(): void {
  const requiredServerVars = [
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
  ];

  const missing = requiredServerVars.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `필수 서버 환경변수가 설정되지 않았습니다: ${missing.join(", ")}\n` +
      "npx web-push generate-vapid-keys 명령어로 VAPID 키를 생성하세요."
    );
  }
}

/**
 * 클라이언트 환경변수가 설정되어 있는지 검증합니다.
 */
export function validateClientEnv(): void {
  const requiredClientVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  ];

  const missing = requiredClientVars.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `필수 클라이언트 환경변수가 설정되지 않았습니다: ${missing.join(", ")}`
    );
  }
}

/**
 * VAPID 설정이 완료되었는지 확인합니다.
 * 푸시 알림 기능 사용 전 호출하세요.
 */
export function isVapidConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  );
}

/**
 * 푸시 알림에 필요한 VAPID 설정을 가져옵니다.
 * 서버 측에서만 사용해야 합니다.
 */
export function getVapidConfig() {
  validateServerEnv();

  return {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
    subject: process.env.VAPID_SUBJECT!,
  };
}
