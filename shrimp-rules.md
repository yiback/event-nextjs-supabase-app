# 개발 가이드라인

> AI Agent 전용 프로젝트 규칙 문서 - 모임 이벤트 관리 웹 MVP

---

## 프로젝트 개요

### 목적
- 5-10명 소규모 모임 주최자가 이벤트 참석 관리와 공지를 처리하는 웹 서비스

### 기술 스택
| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| 스타일링 | TailwindCSS + shadcn/ui (new-york 스타일) |
| 백엔드 | Supabase (Auth, Database, Storage, Edge Functions) |
| 폼 처리 | React Hook Form + Zod |
| 아이콘 | Lucide React |

### 핵심 기능 ID
| ID | 기능명 |
|----|--------|
| F001 | 모임 생성 및 관리 |
| F002 | 이벤트 생성 및 관리 |
| F003 | 참석 응답 시스템 (attending/not_attending/maybe) |
| F004 | 멤버 역할 관리 (owner/admin/member) |
| F005 | 공지사항 작성 |
| F006 | 웹 푸시 알림 |
| F010 | 소셜 로그인 (카카오/구글) |
| F011 | 초대 코드 시스템 |

---

## 프로젝트 아키텍처

### 디렉토리 구조
```
app/
├── (public)/          # 비인증 페이지 (랜딩, 초대 링크)
├── (dashboard)/       # 인증 필요 페이지 (대시보드, 모임, 이벤트)
├── (auth)/            # 인증 관련 페이지 (로그인, 콜백)
├── api/               # API 라우트 (푸시 알림 등)
└── actions/           # Server Actions

components/
├── ui/                # shadcn/ui 기본 컴포넌트
├── dashboard/         # 대시보드 관련 컴포넌트
├── groups/            # 모임 관련 컴포넌트
├── events/            # 이벤트 관련 컴포넌트
└── announcements/     # 공지사항 컴포넌트

lib/
├── supabase/          # Supabase 클라이언트 설정
│   ├── client.ts      # 클라이언트 컴포넌트용
│   └── server.ts      # 서버 컴포넌트용
├── queries/           # 데이터 페칭 함수
└── utils.ts           # 공통 유틸리티

docs/                  # 프로젝트 문서
├── PRD.md             # 제품 요구사항
└── ROADMAP.md         # 개발 로드맵

supabase/migrations/   # 데이터베이스 마이그레이션
```

### 라우트 그룹 규칙
| 그룹 | 용도 | 인증 |
|------|------|------|
| `(public)` | 랜딩 페이지, 초대 링크 | 불필요 |
| `(dashboard)` | 대시보드, 모임, 이벤트, 설정 | 필수 |
| `(auth)` | 로그인, OAuth 콜백 | 불필요 |

---

## 코드 표준

### 네이밍 컨벤션
| 대상 | 형식 | 예시 |
|------|------|------|
| 파일명 | kebab-case | `event-card.tsx`, `group-form.tsx` |
| 컴포넌트 | PascalCase | `EventCard`, `GroupForm` |
| 함수/변수 | camelCase | `handleSubmit`, `eventData` |
| 상수 | UPPER_SNAKE_CASE | `MAX_PARTICIPANTS`, `API_URL` |
| 타입/인터페이스 | PascalCase | `EventResponse`, `GroupMember` |

### Import 순서
1. 외부 라이브러리 (`react`, `next`, `@supabase`)
2. `@/` 경로 내부 모듈
3. 상대 경로 (`./`, `../`)

**올바른 예시:**
```typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { EventCard } from "./event-card";
```

### 언어 규칙
| 대상 | 언어 |
|------|------|
| 코드 주석 | 한국어 |
| 커밋 메시지 | 한국어 |
| 문서화 | 한국어 |
| 변수명/함수명 | 영어 |
| UI 텍스트 | 한국어 |

---

## 기능 구현 표준

### 페이지 컴포넌트 패턴
**서버 컴포넌트 (기본):**
```typescript
// app/(dashboard)/groups/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*");

  return <GroupList groups={groups} />;
}
```

**클라이언트 컴포넌트 (인터랙션 필요 시):**
```typescript
// components/events/attendance-buttons.tsx
"use client";

import { useState } from "react";
import { updateAttendance } from "@/app/actions/participants";

export function AttendanceButtons({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  // ...
}
```

### Server Actions 패턴
**위치:** `app/actions/` 디렉토리에 도메인별 파일 생성

```typescript
// app/actions/groups.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groups")
    .insert({ name: formData.get("name") })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/groups");
  return data;
}
```

### 폼 처리 패턴
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "모임 이름을 입력해주세요").max(50),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export function GroupForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

---

## Supabase 사용 표준

### 클라이언트 생성 규칙
| 환경 | 파일 | 사용법 |
|------|------|--------|
| 서버 컴포넌트 | `lib/supabase/server.ts` | `const supabase = await createClient();` |
| 클라이언트 컴포넌트 | `lib/supabase/client.ts` | `const supabase = createClient();` |
| Server Actions | `lib/supabase/server.ts` | `const supabase = await createClient();` |
| API Routes | `lib/supabase/server.ts` | `const supabase = await createClient();` |

**⚠️ 금지:** 서버 클라이언트를 전역 변수로 저장하지 마라

**올바른 예시:**
```typescript
export default async function Page() {
  const supabase = await createClient(); // 매 요청마다 새로 생성
  // ...
}
```

**잘못된 예시:**
```typescript
const supabase = await createClient(); // 전역 변수 금지!

export default async function Page() {
  // ...
}
```

### 데이터베이스 테이블 구조
| 테이블 | 주요 필드 | 관계 |
|--------|----------|------|
| `profiles` | id, email, full_name, avatar_url | Auth 연동 |
| `groups` | id, name, invite_code, owner_id | → profiles |
| `group_members` | id, group_id, user_id, role | → groups, profiles |
| `events` | id, group_id, title, event_date | → groups |
| `participants` | id, event_id, user_id, status | → events, profiles |
| `announcements` | id, group_id, event_id, title | → groups, events |

### RLS 정책 고려사항
- 모든 SELECT: 해당 그룹 멤버만 접근 가능
- INSERT/UPDATE: 역할 기반 권한 확인 (owner/admin)
- 본인 데이터: 본인만 수정 가능 (participants, push_subscriptions)

### Storage 버킷
| 버킷명 | 용도 | 최대 크기 |
|--------|------|----------|
| `group-images` | 모임 대표 이미지 | 5MB |
| `event-images` | 이벤트 이미지 | 5MB |
| `avatars` | 프로필 이미지 | 2MB |

---

## UI 컴포넌트 표준

### shadcn/ui 사용법
**컴포넌트 추가:**
```bash
npx shadcn@latest add [component-name]
```

**스타일:** new-york 스타일 유지 (components.json에 정의됨)

### 컬러 시스템 (파란색 계열)
| 용도 | Tailwind 클래스 |
|------|-----------------|
| Primary | `blue-500` (hover: `blue-600`) |
| Success (참석) | `emerald-500` |
| Warning (미정) | `amber-500` |
| Error (불참) | `red-500` |
| Background | `gray-50` |
| Text Primary | `gray-900` |
| Text Secondary | `gray-500` |

### 반응형 브레이크포인트
| 디바이스 | 너비 | 레이아웃 |
|----------|------|----------|
| Mobile | < 768px | 하단 네비게이션, 단일 컬럼 |
| Tablet | 768px ~ 1024px | 상단 헤더, 2컬럼 |
| Desktop | > 1024px | 상단 헤더 + 사이드바, 3컬럼 |

### Badge 종류
| 뱃지 | 클래스 | 사용 |
|------|--------|------|
| NEW | `bg-blue-500 text-white` | 7일 이내 생성 이벤트 |
| 참석 | `bg-emerald-100 text-emerald-700` | 참석 응답 |
| 불참 | `bg-red-100 text-red-700` | 불참 응답 |
| 미정 | `bg-amber-100 text-amber-700` | 미정 응답 |

---

## 핵심 파일 상호작용 규칙

### 동시 수정 필요 파일
| 작업 | 수정 파일 |
|------|----------|
| 새 라우트 추가 | `app/` 해당 라우트 + `docs/ROADMAP.md` 진행 상황 |
| DB 스키마 변경 | `supabase/migrations/` + `lib/types/database.ts` |
| 새 컴포넌트 | `components/` + 필요시 `@/components/ui/` 추가 |
| Server Action 추가 | `app/actions/` + 관련 페이지 연동 |
| 환경변수 추가 | `.env.local` + `README.md` 또는 문서 업데이트 |

### 타입 정의 연동
- DB 스키마 변경 시 → `lib/types/database.ts` 업데이트 필수
- API 응답 변경 시 → 관련 타입 정의 파일 업데이트

---

## AI 의사결정 표준

### 기능 구현 우선순위
1. `docs/ROADMAP.md`의 현재 Phase 작업 우선
2. 기존 코드 패턴 유지
3. PRD.md의 기능 명세 준수

### 컴포넌트 위치 결정
| 조건 | 위치 |
|------|------|
| 단일 페이지에서만 사용 | 해당 페이지 폴더 내 |
| 2개 이상 페이지에서 사용 | `components/[도메인]/` |
| 범용 UI 컴포넌트 | `components/ui/` |

### 서버 vs 클라이언트 컴포넌트 판단
| 상황 | 선택 |
|------|------|
| 데이터 페칭만 필요 | 서버 컴포넌트 |
| useState, useEffect 필요 | 클라이언트 컴포넌트 |
| onClick, onChange 핸들러 | 클라이언트 컴포넌트 |
| 브라우저 API 사용 | 클라이언트 컴포넌트 |

### 에러 처리 패턴
```typescript
// Server Action
try {
  const result = await supabase.from("table").insert(data);
  if (result.error) throw new Error(result.error.message);
  return { success: true, data: result.data };
} catch (error) {
  return { success: false, error: (error as Error).message };
}
```

---

## 금지 사항

### 절대 하지 말 것
| 항목 | 이유 |
|------|------|
| ❌ 서버 Supabase 클라이언트를 전역 변수로 저장 | 요청 간 상태 공유 문제 |
| ❌ `"use client"` 없이 클라이언트 훅 사용 | 서버 컴포넌트 에러 |
| ❌ shadcn/ui new-york 스타일 변경 | 디자인 일관성 |
| ❌ 영어로 주석/커밋 메시지 작성 | 프로젝트 언어 규칙 |
| ❌ 라우트 그룹 구조 무시하고 페이지 생성 | 아키텍처 일관성 |
| ❌ RLS 정책 고려 없이 쿼리 작성 | 보안 문제 |
| ❌ 타입 정의 없이 any 사용 | TypeScript 타입 안전성 |
| ❌ PRD에 정의되지 않은 기능 임의 추가 | MVP 범위 준수 |

### 하지 말아야 할 코드 패턴
**❌ 잘못된 예시:**
```typescript
// 전역 클라이언트 (금지)
const supabase = await createClient();

// any 타입 사용 (금지)
const data: any = await fetchData();

// 영어 주석 (금지)
// This function creates a new group
```

**✅ 올바른 예시:**
```typescript
// 함수 내에서 클라이언트 생성
export async function createGroup() {
  const supabase = await createClient();
  // ...
}

// 명확한 타입 정의
const data: Group[] = await fetchGroups();

// 한국어 주석
// 새 모임을 생성하는 함수
```

---

## 워크플로우 참조

### 작업 시작 전 확인사항
1. `docs/ROADMAP.md`에서 현재 작업 확인
2. `docs/PRD.md`에서 기능 명세 확인
3. 관련 기존 코드 패턴 확인

### 작업 완료 후
1. `docs/ROADMAP.md` 진행 상황 업데이트
2. 타입 정의 동기화 확인
3. 린트/빌드 오류 확인 (`npm run lint`, `npm run build`)

---

## 환경 설정

### 필수 환경변수
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### 푸시 알림 환경변수 (Phase 4)
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

### 개발 명령어
```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```
