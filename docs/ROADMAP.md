# 모임 이벤트 관리 웹 개발 로드맵

5-10명 소규모 모임 주최자가 이벤트 참석 관리와 공지를 효율적으로 처리할 수 있는 웹 서비스

## 개요

모임 이벤트 관리 웹은 소규모 정기 모임(수영, 헬스, 친구 모임)을 운영하는 주최자 및 참여자를 위한 서비스로 다음 기능을 제공합니다:

- **모임 관리**: 모임 생성, 초대 코드 발급, 멤버 역할 관리 (owner/admin/member)
- **이벤트 관리**: 이벤트 CRUD, 참석 응답 시스템 (참석/불참/미정)
- **실시간 알림**: 웹 푸시 알림을 통한 새 이벤트, 리마인더, 공지사항 전달
- **공지사항**: 모임/이벤트별 공지 작성 및 조회

## 기술 스택

- **프론트엔드**: Next.js 15 (App Router), React 19, TypeScript 5.6+
- **스타일링**: TailwindCSS v3.4, shadcn/ui, Lucide React
- **폼/검증**: React Hook Form 7.x, Zod
- **백엔드**: Supabase (Auth, Database, Edge Functions)
- **푸시 알림**: Web Push API
- **배포**: Vercel

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
   - 초기 상태의 샘플로 `000-sample.md` 참조

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> 전체 라우트 구조와 빈 페이지들 생성, 공통 레이아웃과 네비게이션 골격, 기본 타입 정의

- **Task 001: 프로젝트 구조 및 라우팅 설정** - 우선순위
  - Next.js App Router 기반 전체 라우트 구조 생성
  - 모든 주요 페이지의 빈 껍데기 파일 생성
  - 공통 레이아웃 컴포넌트 골격 구현
  - 라우트 그룹 설정: `(public)`, `(dashboard)`, `(auth)`

- **Task 002: 타입 정의 및 인터페이스 설계**
  - TypeScript 인터페이스 및 타입 정의 파일 생성
  - 데이터베이스 스키마 타입 정의 (Database types)
  - API 응답 타입 정의
  - 컴포넌트 Props 타입 정의

- **Task 003: 공통 레이아웃 컴포넌트 구현**
  - 데스크톱 헤더 컴포넌트 골격
  - 모바일 하단 네비게이션 컴포넌트 골격
  - 대시보드 레이아웃 구조 설정
  - 반응형 레이아웃 기반 구축

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> 공통 컴포넌트 라이브러리 구현, 모든 페이지 UI 완성 (하드코딩된 더미 데이터 사용)

- **Task 004: 공통 컴포넌트 라이브러리 구현** - 우선순위
  - shadcn/ui 기반 공통 컴포넌트 설정
  - 디자인 시스템 및 스타일 가이드 적용 (컬러, 타이포그래피, 간격)
  - Badge 컴포넌트 (NEW, 마감 D-N, 참석/불참/미정)
  - ViewToggle 컴포넌트 (리스트/캘린더 전환)

- **Task 005: 더미 데이터 및 Mock 유틸리티 구현**
  - 더미 데이터 생성 및 관리 유틸리티 작성
  - Mock 사용자, 모임, 이벤트, 참석자 데이터
  - 개발 환경에서 사용할 faker 데이터 생성 함수

- **Task 006: 랜딩 페이지 및 로그인 UI 구현**
  - 랜딩 페이지 UI 완성 (서비스 소개, 핵심 기능 프리뷰)
  - 소셜 로그인 페이지 UI (카카오/구글 버튼)
  - 반응형 디자인 적용

- **Task 007: 대시보드 페이지 UI 구현**
  - 대시보드 홈 UI 구현 (더미 데이터 사용)
  - 배너 슬라이더 컴포넌트 (embla-carousel)
  - 다가오는 이벤트 카드 목록
  - 최근 공지사항 섹션
  - 푸시 알림 권한 요청 배너 UI

- **Task 008: 모임 관련 페이지 UI 구현**
  - 모임 목록 페이지 UI (그리드/리스트 뷰)
  - GroupCard 컴포넌트
  - 모임 생성 페이지 폼 UI
  - 모임 상세 페이지 UI (이벤트 목록, 멤버 수, 초대 코드)
  - 멤버 관리 페이지 UI (멤버 목록, 역할 표시)

- **Task 009: 이벤트 관련 페이지 UI 구현**
  - EventCard 컴포넌트 (이미지 슬라이더, 응답마감 뱃지, 참석 현황)
  - 이벤트 생성 페이지 폼 UI
  - 이벤트 상세 페이지 UI (정보, 참석 응답 버튼, 참석자 명단)
  - AttendanceButtons 컴포넌트 (참석/불참/미정)
  - ParticipantsList 컴포넌트 (참석 상태별 명단)
  - 내 이벤트 전체 페이지 UI (캘린더/리스트 뷰 토글)

- **Task 010: 부가 페이지 UI 구현**
  - 알림 페이지 UI (알림 목록, 타입별 아이콘)
  - 설정 페이지 UI (알림 설정, 프로필 표시)
  - 초대 링크 페이지 UI (모임 정보 미리보기)
  - 공지사항 카드 및 폼 컴포넌트

- **Task 011: 반응형 디자인 및 접근성 완성**
  - 모든 페이지 모바일/태블릿/데스크톱 반응형 검증
  - 접근성 기준 적용 (ARIA 레이블, 키보드 네비게이션)
  - 사용자 플로우 검증 및 네비게이션 완성

---

### Phase 3: 데이터베이스 설정 및 핵심 기능 구현

> 데이터베이스 연동, 인증 시스템, 핵심 비즈니스 로직, 더미 데이터를 실제 API로 교체

- **Task 012: Supabase 프로젝트 설정 및 데이터베이스 구축** - 우선순위
  - Supabase 프로젝트 연결 및 환경변수 설정
  - 데이터베이스 마이그레이션 파일 작성 (8개 테이블)
  - RLS (Row Level Security) 정책 설정
  - Supabase Storage 버킷 설정 (group-images, event-images, avatars)

- **Task 013: 소셜 로그인 시스템 구현**
  - Supabase Auth 카카오/구글 OAuth 설정
  - OAuth 콜백 라우트 구현 (`/api/auth/callback`)
  - 자동 프로필 생성 로직
  - 로그인/로그아웃 기능 연동
  - 인증 미들웨어 구현

- **Task 014: 모임 관리 기능 구현 (F001)**
  - 모임 CRUD Server Actions 구현
  - 초대 코드 자동 생성 및 공유 기능
  - 모임 멤버십 관리 로직
  - 더미 데이터를 실제 API 호출로 교체

- **Task 015: 멤버 역할 관리 기능 구현 (F004)**
  - owner/admin/member 3단계 권한 시스템
  - 역할 변경 Server Actions
  - 멤버 제거 기능
  - 권한 기반 UI 접근 제어

- **Task 016: 이벤트 관리 기능 구현 (F002)**
  - 이벤트 CRUD Server Actions 구현
  - 이벤트 목록 데이터 페칭 (쿼리 함수)
  - 이벤트 상세 정보 로직
  - 이벤트 이미지 업로드 기능

- **Task 017: 참석 응답 시스템 구현 (F003)**
  - 참석/불참/미정 응답 Server Actions
  - Optimistic UI 업데이트
  - 실시간 참석자 명단 업데이트 (Supabase Realtime)
  - 참석률 계산 로직

- **Task 018: 공지사항 기능 구현 (F005)**
  - 공지사항 CRUD Server Actions
  - 모임/이벤트별 공지 작성 및 조회
  - 공지사항 목록 페이지네이션

- **Task 019: 초대 코드 시스템 구현 (F011)**
  - 초대 링크 페이지 로직
  - 초대 코드 유효성 검증
  - 비로그인 시 리디렉션 처리
  - 자동 모임 가입 프로세스

- **Task 020: 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 전체 사용자 플로우 테스트
  - 주최자 플로우 E2E 테스트
  - 참여자 플로우 E2E 테스트
  - API 연동 및 비즈니스 로직 검증
  - 에러 핸들링 및 엣지 케이스 테스트

---

### Phase 4: 고급 기능 및 최적화

> 웹 푸시 알림, 실시간 기능, 성능 최적화, 배포

- **Task 021: 웹 푸시 알림 시스템 구현 (F006)** - 우선순위
  - Service Worker 설정 (`public/sw.js`)
  - VAPID 키 생성 및 환경변수 설정
  - 푸시 구독 등록 API (`/api/push/subscribe`)
  - 푸시 발송 API (`/api/push/send`)
  - Supabase Edge Function 알림 발송 로직

- **Task 022: 알림 구독 관리 기능 구현 (F013)**
  - 푸시 알림 권한 요청 프롬프트
  - 알림 타입별 설정 (새 이벤트, 리마인더, 공지)
  - 알림 목록 페이지 기능 연동
  - 읽음/안읽음 상태 관리

- **Task 023: 실시간 기능 및 UX 개선**
  - Supabase Realtime 구독 설정
  - 참석 현황 실시간 업데이트
  - 로딩 상태 및 스켈레톤 UI
  - 에러 처리 및 토스트 메시지
  - 빈 상태 UI 구현
  - Pull-to-Refresh (모바일)
  - 무한 스크롤 (이벤트 목록, 알림 목록)

- **Task 024: 이미지 업로드 및 미디어 처리**
  - Supabase Storage 이미지 업로드 구현
  - 클라이언트 이미지 리사이징 (1200px max width)
  - 이벤트 이미지 슬라이더 연동
  - 프로필/모임 이미지 업로드

- **Task 025: 성능 최적화**
  - Next.js 이미지 최적화 적용
  - 데이터 캐싱 전략 (React Query 또는 SWR)
  - 코드 스플리팅 및 동적 임포트
  - 번들 사이즈 분석 및 최적화

- **Task 026: 테스트 및 품질 보증**
  - 단위 테스트 작성 (Jest/Vitest)
  - E2E 테스트 시나리오 확장 (Playwright)
  - 접근성 테스트
  - 크로스 브라우저 테스트

- **Task 027: 배포 및 모니터링**
  - Vercel 배포 설정
  - 환경변수 구성 (Production)
  - CI/CD 파이프라인 구축
  - 에러 모니터링 설정 (Sentry 등)
  - 성능 모니터링 설정

---

## 페이지 및 라우트 구조

```
app/
├── (public)/
│   ├── page.tsx                     # 랜딩 페이지 (/)
│   └── invite/[code]/page.tsx       # 초대 링크 (/invite/[code])
├── (auth)/
│   └── auth/
│       ├── login/page.tsx           # 로그인 (/auth/login)
│       └── callback/route.ts        # OAuth 콜백
├── (dashboard)/
│   ├── layout.tsx                   # 대시보드 레이아웃
│   ├── dashboard/page.tsx           # 대시보드 홈 (/dashboard)
│   ├── groups/
│   │   ├── page.tsx                 # 모임 목록 (/groups)
│   │   ├── new/page.tsx             # 모임 생성 (/groups/new)
│   │   └── [groupId]/
│   │       ├── page.tsx             # 모임 상세 (/groups/[groupId])
│   │       ├── members/page.tsx     # 멤버 관리 (/groups/[groupId]/members)
│   │       └── events/
│   │           ├── new/page.tsx     # 이벤트 생성
│   │           └── [eventId]/page.tsx  # 이벤트 상세
│   ├── events/page.tsx              # 내 이벤트 전체 (/events)
│   ├── notifications/page.tsx       # 알림 (/notifications)
│   └── settings/page.tsx            # 설정 (/settings)
└── api/
    ├── auth/callback/route.ts       # OAuth 콜백
    └── push/
        ├── subscribe/route.ts       # 푸시 구독
        └── send/route.ts            # 푸시 발송
```

---

## 핵심 기능 매핑

| 기능 ID | 기능명 | 관련 Task | Phase |
|---------|--------|-----------|-------|
| F001 | 모임 생성 및 관리 | Task 014 | Phase 3 |
| F002 | 이벤트 생성 및 관리 | Task 016 | Phase 3 |
| F003 | 참석 응답 시스템 | Task 017 | Phase 3 |
| F004 | 멤버 역할 관리 | Task 015 | Phase 3 |
| F005 | 공지사항 작성 | Task 018 | Phase 3 |
| F006 | 웹 푸시 알림 | Task 021 | Phase 4 |
| F010 | 소셜 로그인 | Task 013 | Phase 3 |
| F011 | 초대 코드 시스템 | Task 019 | Phase 3 |
| F012 | 대시보드 | Task 007, 014 | Phase 2, 3 |
| F013 | 알림 구독 관리 | Task 022 | Phase 4 |

---

## 진행 상황

- [ ] Phase 1: 애플리케이션 골격 구축 (0/3)
- [ ] Phase 2: UI/UX 완성 (0/8)
- [ ] Phase 3: 데이터베이스 설정 및 핵심 기능 구현 (0/9)
- [ ] Phase 4: 고급 기능 및 최적화 (0/7)

**총 진행률**: 0/27 Tasks 완료
