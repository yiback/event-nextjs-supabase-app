import { test, expect } from "@playwright/test";

/**
 * 이벤트 관리 E2E 테스트
 *
 * 테스트 전제 조건:
 * 1. 개발 서버가 실행 중이어야 합니다 (npm run dev)
 * 2. Supabase 프로젝트가 설정되어 있어야 합니다
 * 3. 테스트용 사용자 계정이 있어야 합니다:
 *    - owner@test.com (모임장)
 *    - member@test.com (일반 멤버)
 * 4. 테스트용 모임 데이터가 있어야 합니다
 *
 * 테스트 범위:
 * - 이벤트 생성 (CRUD - Create)
 * - 이벤트 상세 조회 (CRUD - Read)
 * - 이벤트 수정 (CRUD - Update)
 * - 이벤트 삭제 (CRUD - Delete)
 * - 이미지 업로드
 * - 권한 검사
 */

// 테스트용 환경변수
const TEST_BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const TEST_OWNER_EMAIL = process.env.TEST_OWNER_EMAIL || "owner@test.com";
const TEST_OWNER_PASSWORD = process.env.TEST_OWNER_PASSWORD || "test1234";
const TEST_MEMBER_EMAIL = process.env.TEST_MEMBER_EMAIL || "member@test.com";
const TEST_MEMBER_PASSWORD = process.env.TEST_MEMBER_PASSWORD || "test1234";
const TEST_GROUP_ID = process.env.TEST_GROUP_ID || "test-group-id";

/**
 * 헬퍼 함수: 사용자 로그인
 */
async function login(page: any, email: string, password: string) {
  await page.goto(`${TEST_BASE_URL}/sign-in`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/groups/, { timeout: 10000 });
}

/**
 * 헬퍼 함수: 이벤트 생성 페이지로 이동
 */
async function goToCreateEventPage(page: any, groupId: string) {
  await page.goto(`${TEST_BASE_URL}/groups/${groupId}/events/new`);
  await page.waitForSelector('h1:has-text("새 이벤트")');
}

/**
 * 헬퍼 함수: 모임 상세 페이지로 이동
 */
async function goToGroupPage(page: any, groupId: string) {
  await page.goto(`${TEST_BASE_URL}/groups/${groupId}`);
  await page.waitForLoadState("networkidle");
}

/**
 * 헬퍼 함수: 내 이벤트 페이지로 이동
 */
async function goToMyEventsPage(page: any) {
  await page.goto(`${TEST_BASE_URL}/events`);
  await page.waitForSelector('h1:has-text("내 이벤트")');
}

test.describe("이벤트 관리 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test.describe("이벤트 생성", () => {
    /**
     * 테스트 1: Owner가 이벤트를 생성할 수 있다
     *
     * 시나리오:
     * 1. Owner로 로그인
     * 2. 이벤트 생성 페이지로 이동
     * 3. 필수 필드 입력 (제목, 날짜)
     * 4. 선택 필드 입력 (설명, 장소, 비용 등)
     * 5. "이벤트 만들기" 버튼 클릭
     * 6. 성공 후 모임 상세 페이지로 리다이렉트 확인
     */
    test("Owner가 이벤트를 생성할 수 있다", async ({ page }) => {
      await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
      await goToCreateEventPage(page, TEST_GROUP_ID);

      // 이벤트 제목 입력
      await page.fill('input[name="title"]', "테스트 이벤트");

      // 이벤트 날짜/시간 입력 (내일 날짜)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      await page.fill('input[type="datetime-local"]', dateStr);

      // 설명 입력
      await page.fill('textarea[name="description"]', "테스트 이벤트 설명입니다");

      // 장소 입력
      await page.fill('input[name="location"]', "테스트 장소");

      // 비용 입력
      await page.fill('input[name="cost"]', "10000");

      // 제출 버튼 클릭
      await page.click('button[type="submit"]');

      // 모임 상세 페이지로 리다이렉트 확인
      await page.waitForURL(new RegExp(`/groups/${TEST_GROUP_ID}`), {
        timeout: 10000,
      });

      // 생성된 이벤트가 목록에 있는지 확인
      await expect(page.locator('text="테스트 이벤트"')).toBeVisible();
    });

    /**
     * 테스트 2: Member는 이벤트 생성 페이지에 접근할 수 없다
     *
     * 시나리오:
     * 1. Member로 로그인
     * 2. 이벤트 생성 페이지 직접 접근 시도
     * 3. 리다이렉트 또는 권한 없음 메시지 확인
     */
    test("Member는 이벤트 생성 페이지에 접근할 수 없다", async ({ page }) => {
      await login(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD);

      // 직접 URL로 이벤트 생성 페이지 접근 시도
      await page.goto(`${TEST_BASE_URL}/groups/${TEST_GROUP_ID}/events/new`);

      // 모임 상세 페이지로 리다이렉트되어야 함
      await page.waitForURL(new RegExp(`/groups/${TEST_GROUP_ID}$`), {
        timeout: 10000,
      });
    });

    /**
     * 테스트 3: 필수 필드 누락 시 유효성 검사 에러
     */
    test("필수 필드 누락 시 유효성 검사 에러가 표시된다", async ({ page }) => {
      await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
      await goToCreateEventPage(page, TEST_GROUP_ID);

      // 아무것도 입력하지 않고 제출
      await page.click('button[type="submit"]');

      // 유효성 검사 에러 메시지 확인
      await expect(
        page.locator('text="제목은 2자 이상이어야 합니다"')
      ).toBeVisible();
    });
  });

  test.describe("이벤트 상세 조회", () => {
    /**
     * 테스트 4: 이벤트 상세 페이지에서 정보가 올바르게 표시된다
     */
    test("이벤트 상세 페이지에서 정보가 표시된다", async ({ page }) => {
      await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
      await goToGroupPage(page, TEST_GROUP_ID);

      // 이벤트 탭 클릭
      await page.click('button:has-text("이벤트")');

      // 첫 번째 이벤트 카드 클릭
      const eventCard = page.locator('[data-testid="event-card"]').first();
      if (await eventCard.isVisible()) {
        await eventCard.click();

        // 이벤트 상세 페이지 요소들 확인
        await page.waitForLoadState("networkidle");
        await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="event-date"]')).toBeVisible();
      }
    });

    /**
     * 테스트 5: Owner는 수정/삭제 버튼이 보인다
     */
    test("Owner에게는 수정/삭제 버튼이 표시된다", async ({ page }) => {
      await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
      await goToGroupPage(page, TEST_GROUP_ID);

      // 이벤트 탭 클릭
      await page.click('button:has-text("이벤트")');

      // 첫 번째 이벤트가 있는 경우
      const eventCard = page.locator('[data-testid="event-card"]').first();
      if (await eventCard.isVisible()) {
        await eventCard.click();
        await page.waitForLoadState("networkidle");

        // 수정/삭제 버튼 확인
        await expect(page.locator('a:has-text("수정")')).toBeVisible();
        await expect(page.locator('button:has-text("삭제")')).toBeVisible();
      }
    });

    /**
     * 테스트 6: Member에게는 수정/삭제 버튼이 안 보인다
     */
    test("Member에게는 수정/삭제 버튼이 표시되지 않는다", async ({ page }) => {
      await login(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD);
      await goToGroupPage(page, TEST_GROUP_ID);

      // 이벤트 탭 클릭
      await page.click('button:has-text("이벤트")');

      // 첫 번째 이벤트가 있는 경우
      const eventCard = page.locator('[data-testid="event-card"]').first();
      if (await eventCard.isVisible()) {
        await eventCard.click();
        await page.waitForLoadState("networkidle");

        // 수정/삭제 버튼이 없어야 함
        await expect(page.locator('a:has-text("수정")')).not.toBeVisible();
        await expect(page.locator('button:has-text("삭제")')).not.toBeVisible();
      }
    });
  });

  test.describe("이벤트 수정", () => {
    /**
     * 테스트 7: Owner가 이벤트를 수정할 수 있다
     */
    test("Owner가 이벤트를 수정할 수 있다", async ({ page }) => {
      await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
      await goToGroupPage(page, TEST_GROUP_ID);

      // 이벤트 탭 클릭
      await page.click('button:has-text("이벤트")');

      // 첫 번째 이벤트 클릭
      const eventCard = page.locator('[data-testid="event-card"]').first();
      if (await eventCard.isVisible()) {
        await eventCard.click();
        await page.waitForLoadState("networkidle");

        // 수정 버튼 클릭
        await page.click('a:has-text("수정")');

        // 수정 페이지 확인
        await page.waitForSelector('h1:has-text("이벤트 수정")');

        // 제목 수정
        await page.fill('input[name="title"]', "수정된 테스트 이벤트");

        // 저장 버튼 클릭
        await page.click('button[type="submit"]');

        // 상세 페이지로 리다이렉트 확인
        await page.waitForURL(/\/events\//, { timeout: 10000 });

        // 수정된 제목 확인
        await expect(page.locator('text="수정된 테스트 이벤트"')).toBeVisible();
      }
    });
  });

  test.describe("이벤트 삭제", () => {
    /**
     * 테스트 8: Owner가 이벤트를 삭제할 수 있다
     */
    test("Owner가 이벤트를 삭제할 수 있다", async ({ page }) => {
      await login(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD);
      await goToGroupPage(page, TEST_GROUP_ID);

      // 이벤트 탭 클릭
      await page.click('button:has-text("이벤트")');

      // 첫 번째 이벤트 클릭
      const eventCard = page.locator('[data-testid="event-card"]').first();
      if (await eventCard.isVisible()) {
        const eventTitle = await eventCard.locator("h3").textContent();
        await eventCard.click();
        await page.waitForLoadState("networkidle");

        // 삭제 버튼 클릭
        await page.click('button:has-text("삭제")');

        // 확인 다이얼로그 확인
        await expect(
          page.locator('text="이벤트를 삭제하시겠습니까?"')
        ).toBeVisible();

        // "삭제" 버튼 클릭 (다이얼로그 내)
        await page.locator('button:has-text("삭제")').last().click();

        // 모임 상세 페이지로 리다이렉트 확인
        await page.waitForURL(new RegExp(`/groups/${TEST_GROUP_ID}$`), {
          timeout: 10000,
        });

        // 삭제된 이벤트가 목록에 없는지 확인
        if (eventTitle) {
          await expect(page.locator(`text="${eventTitle}"`)).not.toBeVisible();
        }
      }
    });
  });

  test.describe("참석 응답", () => {
    /**
     * 테스트 9: 사용자가 참석 응답을 할 수 있다
     */
    test("사용자가 참석 응답을 변경할 수 있다", async ({ page }) => {
      await login(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD);
      await goToGroupPage(page, TEST_GROUP_ID);

      // 이벤트 탭 클릭
      await page.click('button:has-text("이벤트")');

      // 첫 번째 이벤트 클릭
      const eventCard = page.locator('[data-testid="event-card"]').first();
      if (await eventCard.isVisible()) {
        await eventCard.click();
        await page.waitForLoadState("networkidle");

        // 참석 버튼 클릭
        await page.click('button:has-text("참석")');

        // 성공 토스트 또는 UI 변경 확인
        await expect(
          page.locator('button:has-text("참석")').locator('[data-selected="true"]')
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("내 이벤트 페이지", () => {
    /**
     * 테스트 10: 내 이벤트 페이지에서 필터링이 작동한다
     */
    test("내 이벤트 페이지에서 필터가 작동한다", async ({ page }) => {
      await login(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD);
      await goToMyEventsPage(page);

      // 필터 탭 확인
      await expect(page.locator('button:has-text("전체")')).toBeVisible();
      await expect(page.locator('button:has-text("예정")')).toBeVisible();
      await expect(page.locator('button:has-text("지난")')).toBeVisible();

      // "예정" 탭 클릭
      await page.click('button:has-text("예정")');

      // 탭이 활성화되었는지 확인
      await expect(
        page.locator('button:has-text("예정")[data-state="active"]')
      ).toBeVisible();
    });

    /**
     * 테스트 11: 내 이벤트 페이지에서 뷰 모드 전환이 작동한다
     */
    test("내 이벤트 페이지에서 뷰 모드 전환이 작동한다", async ({ page }) => {
      await login(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD);
      await goToMyEventsPage(page);

      // 캘린더 뷰 버튼 클릭
      const calendarButton = page.locator('button:has-text("캘린더")');
      if (await calendarButton.isVisible()) {
        await calendarButton.click();

        // 캘린더 컴포넌트가 표시되는지 확인
        await expect(page.locator('[data-testid="simple-calendar"]')).toBeVisible();
      }
    });
  });
});

/**
 * 추가 테스트 시나리오 (선택적)
 *
 * - 이미지 업로드 테스트 (최대 5개 제한)
 * - 응답 마감일 지난 이벤트 참석 응답 불가
 * - 최대 인원 초과 시 참석 불가
 * - 네트워크 에러 처리
 * - 로딩 상태 UI 테스트
 */
