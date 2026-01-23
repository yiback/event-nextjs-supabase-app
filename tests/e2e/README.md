# E2E 테스트 가이드

## 📋 개요

이 디렉토리에는 Playwright를 사용한 End-to-End (E2E) 테스트가 포함되어 있습니다.

## 🚀 테스트 실행 방법

### 1. 기본 테스트 실행

```bash
npm run test:e2e
```

### 2. UI 모드로 실행 (테스트 과정 시각화)

```bash
npm run test:e2e:ui
```

### 3. 디버그 모드로 실행

```bash
npm run test:e2e:debug
```

## ⚙️ 테스트 환경 설정 (필수)

E2E 테스트를 실행하기 전에 다음 설정이 필요합니다:

### 1. 환경변수 파일 생성

프로젝트 루트에 `.env.test.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 테스트용 Supabase 프로젝트 (프로덕션과 분리 권장)
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-test-publishable-key

# 테스트용 사용자 계정
TEST_OWNER_EMAIL=owner@test.com
TEST_OWNER_PASSWORD=test_password_123
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=test_password_123
TEST_MEMBER_EMAIL=member@test.com
TEST_MEMBER_PASSWORD=test_password_123

# 테스트용 모임 ID
TEST_GROUP_ID=your-test-group-uuid
```

### 2. 테스트 데이터 준비

#### 2-1. 테스트용 사용자 생성

Supabase Dashboard에서 다음 테스트 계정을 생성하세요:

- **owner@test.com**: 모임장 역할
- **admin@test.com**: 관리자 역할
- **member@test.com**: 일반 멤버 역할

#### 2-2. 테스트용 모임 생성

1. Owner 계정으로 로그인
2. 새 모임 생성 (예: "E2E 테스트 모임")
3. 모임 ID를 복사하여 `TEST_GROUP_ID`에 설정

#### 2-3. 멤버 초대

1. 초대 코드를 사용하여 admin, member 계정을 모임에 추가
2. Owner가 admin 계정의 역할을 "관리자"로 변경
3. member 계정은 "멤버"로 유지

### 3. 개발 서버 실행

테스트 실행 시 개발 서버가 자동으로 시작되지만, 수동으로 실행할 수도 있습니다:

```bash
npm run dev
```

## 📝 테스트 시나리오

### member-management.spec.ts

멤버 역할 관리 기능을 테스트합니다:

1. ✅ **Owner가 member를 admin으로 승격**
   - Owner 로그인 → 멤버 관리 페이지 → 역할 변경 → 확인

2. ✅ **Admin이 member 역할 변경**
   - Admin 로그인 → 멤버 관리 페이지 → member 역할 변경

3. ✅ **Owner가 member 제거**
   - Owner 로그인 → 멤버 제거 버튼 → 확인 다이얼로그 → 제거

4. ✅ **Member는 역할 변경 불가**
   - Member 로그인 → UI에 역할 변경 드롭다운 없음 확인

5. ✅ **Owner 제거 버튼 표시 안 됨**
   - Owner 행에 제거 버튼이 표시되지 않음

6. ✅ **본인 역할 변경/제거 불가**
   - 로그인한 사용자 자신의 행에는 변경/제거 UI 없음

## 🔧 문제 해결

### 테스트 실패 시

1. **환경변수 확인**: `.env.test.local` 파일이 올바르게 설정되었는지 확인
2. **개발 서버**: `http://localhost:3000`에 접속 가능한지 확인
3. **테스트 데이터**: 테스트용 계정과 모임이 존재하는지 확인
4. **브라우저**: Chromium이 설치되어 있는지 확인 (`npx playwright install chromium`)

### 테스트 디버깅

```bash
# 특정 테스트만 실행
npm run test:e2e -- --grep "Owner가 member를 admin으로 승격"

# 헤드풀 모드로 실행 (브라우저 창 보기)
npm run test:e2e -- --headed

# 느린 동작으로 실행
npm run test:e2e -- --slow-mo=1000
```

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Next.js Testing 가이드](https://nextjs.org/docs/testing)
- [Supabase Auth Testing](https://supabase.com/docs/guides/auth/testing)

## ⚠️ 주의사항

- **프로덕션 데이터 사용 금지**: 반드시 테스트 전용 Supabase 프로젝트를 사용하세요
- **테스트 격리**: 각 테스트는 독립적으로 실행되어야 합니다
- **테스트 데이터 정리**: 테스트 후 데이터를 정리하는 스크립트가 있으면 좋습니다
