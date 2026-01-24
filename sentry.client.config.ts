/**
 * Sentry 클라이언트 설정
 * - 브라우저에서 실행되는 에러 모니터링
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 성능 모니터링: 트랜잭션의 10%를 샘플링
  tracesSampleRate: 0.1,

  // 세션 리플레이: 에러 발생 시 100%, 일반 세션 1%
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // 개발 환경에서는 디버그 모드 활성화
  debug: process.env.NODE_ENV === "development",

  // 통합 설정
  integrations: [
    Sentry.replayIntegration({
      // 개인정보 마스킹
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 환경 태그
  environment: process.env.NODE_ENV,

  // 에러 필터링
  beforeSend(event) {
    // 개발 환경에서는 전송하지 않음
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },
});
