# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 및 커뮤니케이션 규칙

- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)

## 프로젝트 개요

모임 이벤트 관리 웹 MVP - 소규모 모임(5-10명) 주최자가 이벤트 참석 관리와 공지를 효율적으로 처리할 수 있는 웹 서비스

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + React 19 + TypeScript
- **스타일링**: TailwindCSS + shadcn/ui (new-york 스타일)
- **백엔드**: Supabase (Auth, Database, Storage, Edge Functions)
- **폼 처리**: React Hook Form + Zod
- **UI 라이브러리**: Radix UI, Lucide React, embla-carousel, framer-motion

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## 프로젝트 구조

```
app/                    # Next.js App Router 페이지
├── auth/              # 인증 관련 페이지 (로그인, 회원가입, 비밀번호 재설정)
├── protected/         # 인증 필요 레이아웃
components/            # React 컴포넌트
├── ui/               # shadcn/ui 기본 컴포넌트
lib/
├── supabase/         # Supabase 클라이언트 설정
│   ├── client.ts     # 브라우저용 클라이언트
│   └── server.ts     # 서버 컴포넌트용 클라이언트
├── utils.ts          # 공통 유틸리티 (cn 함수 등)
docs/                  # 프로젝트 문서
├── PRD.md            # 제품 요구사항 문서
├── ROADMAP.md        # 개발 로드맵
└── guides/           # 개발 가이드
```

## Supabase 클라이언트 사용

```typescript
// 서버 컴포넌트/Server Actions에서
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// 클라이언트 컴포넌트에서
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

**중요**: 서버 클라이언트는 매 요청마다 새로 생성해야 함 (전역 변수 금지)

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
```

## 코드 컨벤션

### 파일 네이밍
- 파일명: `kebab-case.tsx`
- 컴포넌트: `PascalCase`
- 폴더명: `kebab-case`

### Import 순서
1. 외부 라이브러리
2. `@/` 경로 (내부 모듈)
3. 상대 경로

### 경로 별칭
```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## 주요 문서 참조

- `docs/PRD.md`: 기능 명세, 데이터 모델, UI/UX 가이드라인
- `docs/ROADMAP.md`: 개발 단계별 태스크
- `docs/guides/`: 스타일링, 폼, 컴포넌트 패턴 가이드
