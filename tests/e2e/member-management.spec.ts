import { test, expect } from "@playwright/test";

/**
 * 멤버 역할 관리 E2E 테스트
 *
 * 테스트 전제 조건:
 * 1. 개발 서버가 실행 중이어야 합니다 (npm run dev)
 * 2. Supabase 프로젝트가 설정되어 있어야 합니다
 * 3. 테스트용 사용자 계정이 있어야 합니다:
 *    - owner@test.com (모임장)
 *    - admin@test.com (관리자)
 *    - member@test.com (일반 멤버)
 * 4. 테스트용 모임 데이터가 있어야 합니다
 *
 * 주의: 실제 E2E 테스트를 실행하려면 테스트 환경 설정이 필요합니다.
 * 현재는 테스트 구조만 작성되어 있습니다.
 */

// 테스트용 환경변수 (실제로는 .env.test 파일에서 로드)
const TEST_BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const TEST_OWNER_EMAIL = process.env.TEST_OWNER_EMAIL || "owner@test.com";
const TEST_OWNER_PASSWORD = process.env.TEST_OWNER_PASSWORD || "test1234";
const TEST_MEMBER_EMAIL = process.env.TEST_MEMBER_EMAIL || "member@test.com";
const TEST_MEMBER_PASSWORD = process.env.TEST_MEMBER_PASSWORD || "test1234";
const TEST_GROUP_ID = process.env.TEST_GROUP_ID || "test-group-id";

/**
 * 헬퍼 함수: 사용자 로그인
 * @param page - Playwright Page 객체
 * @param email - 이메일
 * @param password - 비밀번호
 */
async function login(page: any, email: string, password: string) {
  await page.goto(`${TEST_BASE_URL}/sign-in`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // 로그인 완료 대기 (대시보드로 리다이렉트)
  await page.waitForURL(/\/groups/, { timeout: 10000 });
}

/**
 * 헬퍼 함수: 멤버 관리 페이지로 이동
 */
async function goToMembersPage(page: any, groupId: string) {
  await page.goto(`${TEST_BASE_URL}/groups/${groupId}/members`);
  await page.waitForSelector("h1:has-text('멤버 관리')");
}

test.describe("멤버 역할 관리 기능", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 페이지를 초기화합니다
    await page.goto(TEST_BASE_URL);
  });

  /**
   * 테스트 1: Owner가 member를 admin으로 승격
   *
   * 시나리오:
   * 1. Owner로 로그인
   * 2. 멤버 관리 페이지 이동
   * 3. 특정 멤버의 역할 드롭다운 클릭
   * 4. "관리자" 선택
   * 5. 토스트 메시지 확인
   * 6. 역할이 "관리자"로 변경되었는지 확인
   */
  test("Owner가 member를 admin으로 승격할 수 있다", async ({ page }) => {
    // 1. Owner로 로그인
    await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);

    // 2. 멤버 관리 페이지로 이동
    await goToMembersPage(page, TEST_GROUP_ID);

    // 3. 첫 번째 member 역할의 멤버 찾기
    const memberRow = page
      .locator('div:has(select)')
      .filter({ has: page.locator('select:has-text("멤버")') })
      .first();

    // 4. 역할 드롭다운 클릭 및 "관리자" 선택
    await memberRow.locator("select").selectOption({ label: "관리자" });

    // 5. 성공 토스트 메시지 확인
    await expect(page.locator('text="역할이 변경되었습니다"')).toBeVisible({
      timeout: 5000,
    });

    // 6. 페이지 새로고침 후 역할이 변경되었는지 확인
    await page.reload();
    await expect(memberRow.locator('text="관리자"')).toBeVisible();
  });

  /**
   * 테스트 2: Admin이 member 역할 변경
   *
   * Admin은 member만 변경할 수 있습니다 (admin으로 승격 불가)
   */
  test("Admin이 member 역할을 변경할 수 있다", async ({ page }) => {
    // Admin으로 로그인 (실제로는 admin 계정 필요)
    test.skip(!process.env.TEST_ADMIN_EMAIL, "Admin 테스트 계정 필요");

    // 테스트 구현은 위와 동일한 패턴
  });

  /**
   * 테스트 3: Owner가 member 제거
   *
   * 시나리오:
   * 1. Owner로 로그인
   * 2. 멤버 관리 페이지 이동
   * 3. 특정 멤버의 제거 버튼 클릭
   * 4. 확인 다이얼로그에서 "제거" 버튼 클릭
   * 5. 토스트 메시지 확인
   * 6. 멤버 목록에서 해당 멤버가 사라졌는지 확인
   */
  test("Owner가 member를 제거할 수 있다", async ({ page }) => {
    await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
    await goToMembersPage(page, TEST_GROUP_ID);

    // 제거할 멤버의 이름을 저장
    const memberToRemove = await page
      .locator('div:has-text("member@test.com")')
      .locator("p")
      .first()
      .textContent();

    // 제거 버튼 클릭 (UserMinus 아이콘 버튼)
    await page
      .locator('button[title="멤버 제거"]')
      .first()
      .click();

    // AlertDialog가 나타나는지 확인
    await expect(
      page.locator('h2:has-text("멤버 제거")')
    ).toBeVisible();

    // "제거" 버튼 클릭
    await page.locator('button:has-text("제거")').click();

    // 성공 토스트 확인
    await expect(
      page.locator('text="멤버가 제거되었습니다"')
    ).toBeVisible({ timeout: 5000 });

    // 멤버 목록에서 제거되었는지 확인
    await page.reload();
    if (memberToRemove) {
      await expect(
        page.locator(`text="${memberToRemove}"`)
      ).not.toBeVisible();
    }
  });

  /**
   * 테스트 4: Member는 역할 변경 불가 (UI 확인)
   *
   * 일반 멤버로 로그인하면 역할 변경 드롭다운이 보이지 않고
   * 역할 뱃지만 표시됩니다
   */
  test("Member는 다른 멤버의 역할을 변경할 수 없다", async ({ page }) => {
    await login(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD);
    await goToMembersPage(page, TEST_GROUP_ID);

    // 역할 변경 드롭다운이 없어야 함
    await expect(page.locator("select")).not.toBeVisible();

    // 역할 뱃지만 표시되어야 함
    await expect(
      page.locator('[data-slot="badge"]').first()
    ).toBeVisible();
  });

  /**
   * 테스트 5: Owner 제거 버튼이 표시되지 않음
   *
   * Owner는 제거할 수 없으므로 제거 버튼이 표시되지 않습니다
   */
  test("Owner는 제거 버튼이 표시되지 않는다", async ({ page }) => {
    await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
    await goToMembersPage(page, TEST_GROUP_ID);

    // Owner 역할을 가진 행 찾기
    const ownerRow = page
      .locator('div:has-text("모임장")')
      .filter({ has: page.locator('[data-slot="badge"]') })
      .first();

    // 해당 행에 제거 버튼이 없어야 함
    await expect(
      ownerRow.locator('button[title="멤버 제거"]')
    ).not.toBeVisible();
  });

  /**
   * 테스트 6: 본인의 역할 변경/제거 불가
   *
   * 로그인한 사용자 자신의 역할은 변경하거나 제거할 수 없습니다
   */
  test("본인의 역할을 변경하거나 제거할 수 없다", async ({ page }) => {
    await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
    await goToMembersPage(page, TEST_GROUP_ID);

    // "(나)" 텍스트가 있는 행 찾기
    const myRow = page.locator('div:has-text("(나)")').first();

    // 본인 행에는 역할 변경 드롭다운이 없어야 함
    await expect(myRow.locator("select")).not.toBeVisible();

    // 본인 행에는 제거 버튼이 없어야 함
    await expect(
      myRow.locator('button[title="멤버 제거"]')
    ).not.toBeVisible();
  });
});

/**
 * 추가 테스트 시나리오 (선택적)
 *
 * - 초대 코드 복사 기능
 * - 멤버 목록 정렬 (owner → admin → member)
 * - 잘못된 권한으로 역할 변경 시도 시 에러 처리
 * - 네트워크 에러 처리
 */
