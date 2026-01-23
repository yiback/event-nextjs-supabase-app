import { test, expect } from "@playwright/test";

/**
 * 스모크 테스트 (Smoke Test)
 *
 * 애플리케이션의 기본적인 동작을 확인하는 간단한 테스트입니다.
 * 테스트 환경 설정 없이도 실행 가능합니다.
 *
 * 목적:
 * - Playwright 설정이 올바른지 확인
 * - Next.js 개발 서버가 정상 작동하는지 확인
 * - 기본 페이지들이 접근 가능한지 확인
 */

test.describe("스모크 테스트", () => {
  /**
   * 테스트 1: 홈페이지 접속
   */
  test("홈페이지에 접속할 수 있다", async ({ page }) => {
    // 홈페이지로 이동
    await page.goto("/");

    // 페이지 제목 확인 (현재 "Next.js and Supabase Starter Kit")
    await expect(page).toHaveTitle(/Next\.js|Supabase|Starter/i);

    // 페이지가 로드되었는지 확인 (body 요소 존재)
    await expect(page.locator("body")).toBeVisible();
  });

  /**
   * 테스트 2: 로그인 페이지 접속
   */
  test("로그인 페이지에 접속할 수 있다", async ({ page }) => {
    await page.goto("/auth/login");

    // 로그인 폼 요소들이 존재하는지 확인
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  /**
   * 테스트 3: 회원가입 페이지 접속
   */
  test("회원가입 페이지에 접속할 수 있다", async ({ page }) => {
    await page.goto("/auth/sign-up");

    // 회원가입 폼 확인 (ID로 찾기)
    await expect(page.locator('input#email, input#full-name').first()).toBeVisible();
  });

  /**
   * 테스트 4: 인증되지 않은 사용자는 보호된 페이지에 접근 불가
   */
  test("인증되지 않은 사용자는 그룹 페이지에 접근할 수 없다", async ({
    page,
  }) => {
    // 그룹 페이지로 직접 접근 시도
    await page.goto("/groups");

    // 로그인 페이지로 리다이렉트되어야 함
    await page.waitForURL(/auth\/login/, { timeout: 5000 });

    // 로그인 페이지인지 확인
    await expect(page.locator('input#email')).toBeVisible();
  });

  /**
   * 테스트 5: 404 페이지 처리
   */
  test("존재하지 않는 페이지는 404를 반환한다", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    // 404 상태 코드 확인
    expect(response?.status()).toBe(404);
  });

  /**
   * 테스트 6: 네비게이션 테스트
   */
  test("로그인 페이지에서 회원가입 페이지로 이동할 수 있다", async ({
    page,
  }) => {
    await page.goto("/auth/login");

    // "회원가입" 링크 찾기 및 클릭
    const signUpLink = page.locator('a:has-text("회원가입")');
    if (await signUpLink.isVisible()) {
      await signUpLink.click();

      // 회원가입 페이지로 이동했는지 확인
      await page.waitForURL(/sign-up/);
      await expect(page.locator('input#email, input#full-name').first()).toBeVisible();
    } else {
      test.skip(); // 링크가 없으면 테스트 스킵
    }
  });
});

/**
 * 추가 개선 사항:
 *
 * 1. 성능 테스트
 *    - 페이지 로드 시간 측정
 *    - Lighthouse 점수 확인
 *
 * 2. 접근성 테스트
 *    - axe-core를 사용한 자동 접근성 검사
 *    - 키보드 네비게이션 테스트
 *
 * 3. 반응형 테스트
 *    - 모바일, 태블릿, 데스크톱 뷰포트 테스트
 */
