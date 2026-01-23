import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 * Next.js 개발 서버와 연동하여 멤버 관리 기능 테스트
 */
export default defineConfig({
  // 테스트 파일 위치
  testDir: "./tests/e2e",

  // 각 테스트의 최대 실행 시간 (30초)
  timeout: 30 * 1000,

  // 테스트 실패 시 재시도 횟수 (CI 환경에서만)
  retries: process.env.CI ? 2 : 0,

  // 병렬 실행 설정
  workers: process.env.CI ? 1 : undefined,

  // 테스트 리포터 (콘솔에 결과 출력)
  reporter: "list",

  // 모든 테스트에 공통 적용되는 설정
  use: {
    // 기본 URL (테스트에서 상대 경로 사용 가능)
    baseURL: "http://localhost:3000",

    // 각 테스트 실행 시 스크린샷/비디오 캡처 설정
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // 테스트할 브라우저 프로젝트 정의
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 개발 서버 자동 실행 설정
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
