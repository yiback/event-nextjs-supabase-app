# Custom Hooks

이 디렉토리에는 프로젝트 전체에서 재사용 가능한 커스텀 React Hook들이 포함되어 있습니다.

## 🔄 useRealtimeParticipants

Supabase Realtime을 사용하여 이벤트 참가자 목록을 실시간으로 구독하는 Hook입니다.

### 기능

- **실시간 동기화**: 다른 사용자가 참가/참가취소/응답 변경 시 자동 반영
- **자동 프로필 fetch**: INSERT 이벤트 발생 시 프로필 정보 자동 조회
- **자동 cleanup**: 컴포넌트 언마운트 시 구독 자동 해제

### 사용법

```tsx
import { useRealtimeParticipants } from "@/hooks/use-realtime-participants";

export default function ParticipantsList({ eventId, initialData }) {
  // 서버에서 받은 초기 데이터를 전달하고, 실시간 업데이트 받기
  const participants = useRealtimeParticipants(eventId, initialData);

  return (
    <div>
      <h2>참가자 목록 ({participants.length}명)</h2>
      {participants.map((participant) => (
        <div key={participant.id}>
          <span>{participant.profile.full_name}</span>
          <span>{participant.status}</span>
        </div>
      ))}
    </div>
  );
}
```

### 서버 컴포넌트와 함께 사용하기

```tsx
// app/events/[id]/participants/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import ParticipantsList from "./participants-list";

export default async function ParticipantsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 초기 데이터 fetch (서버에서)
  const { data: initialParticipants } = await supabase
    .from("participants")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("event_id", id);

  return <ParticipantsList eventId={id} initialData={initialParticipants || []} />;
}
```

```tsx
// app/events/[id]/participants/participants-list.tsx (Client Component)
"use client";

import { useRealtimeParticipants } from "@/hooks/use-realtime-participants";
import type { ParticipantWithProfile } from "@/types/database";

interface Props {
  eventId: string;
  initialData: ParticipantWithProfile[];
}

export default function ParticipantsList({ eventId, initialData }: Props) {
  const participants = useRealtimeParticipants(eventId, initialData);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        참가자 목록 ({participants.length}명)
      </h2>
      <div className="grid gap-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              {participant.profile.avatar_url && (
                <img
                  src={participant.profile.avatar_url}
                  alt={participant.profile.full_name || "사용자"}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">
                  {participant.profile.full_name || "이름 없음"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {participant.profile.email}
                </p>
              </div>
            </div>
            <div>
              {participant.status === "attending" && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                  참석
                </span>
              )}
              {participant.status === "declined" && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                  불참
                </span>
              )}
              {participant.status === "pending" && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                  미응답
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 주의사항

1. **RLS 정책**: Supabase Row Level Security 정책으로 인해 인증된 사용자만 구독 가능
2. **프로필 JOIN**: Realtime에서 직접 JOIN이 안되므로 INSERT 시 프로필을 별도로 fetch
3. **구독 해제**: useEffect의 cleanup 함수에서 자동으로 구독 해제됨
4. **로그**: 개발 환경에서 콘솔에 구독 상태가 출력됨 (프로덕션에서는 제거 권장)

### 테스트 방법

1. 이벤트 상세 페이지를 두 개의 브라우저 창에서 열기
2. 한 창에서 참석 응답 변경
3. 다른 창에서 실시간으로 업데이트되는지 확인

### 성능 최적화

- `eventId`가 변경될 때만 재구독됨
- 불필요한 리렌더링 방지를 위해 상태 업데이트 최소화
- cleanup 함수로 메모리 누수 방지

---

## 📜 useInfiniteScroll

IntersectionObserver를 사용하여 스크롤 기반 무한 로딩을 구현하는 Hook입니다.

### 기능

- **자동 페이지네이션**: 스크롤이 하단에 도달하면 자동으로 다음 데이터 로드
- **커서 기반**: 커서 기반 페이지네이션 지원 (성능 최적화)
- **로딩 상태 관리**: 로딩 중 여부와 더 이상 데이터가 없는지 여부 제공
- **IntersectionObserver**: 효율적인 스크롤 감지 (200px 미리 로드)

### 사용법

```tsx
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getEventsPaginated } from "@/app/actions/events";

export function EventList({ initialEvents, initialCursor, initialHasMore }) {
  const { data, isLoading, hasMore, loadMoreRef } = useInfiniteScroll({
    fetchFn: async (cursor) => {
      const result = await getEventsPaginated(cursor, 10);
      return {
        data: result.data,
        nextCursor: result.nextCursor,
      };
    },
    initialData: initialEvents,
    initialCursor,
    initialHasMore,
  });

  return (
    <div>
      {data.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {/* 로딩 중 스켈레톤 */}
      {isLoading && <EventCardSkeleton />}

      {/* 무한 스크롤 트리거 */}
      {hasMore && !isLoading && (
        <div ref={loadMoreRef}>
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* 모든 데이터 로드 완료 */}
      {!hasMore && data.length > 0 && (
        <p>모든 이벤트를 불러왔습니다</p>
      )}
    </div>
  );
}
```

### Server Component와 함께 사용하기

```tsx
// app/events/page.tsx (Server Component)
import { getEventsPaginated } from "@/app/actions/events";
import { EventListClient } from "./event-list-client";

export default async function EventsPage() {
  // 첫 페이지 데이터 서버에서 가져오기
  const { data: events, nextCursor } = await getEventsPaginated(undefined, 10);

  return (
    <EventListClient
      initialEvents={events}
      initialCursor={nextCursor}
      initialHasMore={!!nextCursor}
    />
  );
}
```

```tsx
// app/events/event-list-client.tsx (Client Component)
"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getEventsPaginated } from "@/app/actions/events";

export function EventListClient({ initialEvents, initialCursor, initialHasMore }) {
  const { data, isLoading, hasMore, loadMoreRef } = useInfiniteScroll({
    fetchFn: async (cursor) => {
      const result = await getEventsPaginated(cursor, 10);
      return { data: result.data, nextCursor: result.nextCursor };
    },
    initialData: initialEvents,
    initialCursor,
    initialHasMore,
  });

  // ... 렌더링
}
```

### Server Action 페이지네이션 함수 예시

```ts
// app/actions/events.ts
export async function getEventsPaginated(
  cursor?: string,
  limit: number = 10
): Promise<{ data: Event[]; nextCursor?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  // 커서 기반 필터링
  if (cursor) {
    const { data: cursorEvent } = await supabase
      .from("events")
      .select("event_date")
      .eq("id", cursor)
      .single();

    if (cursorEvent) {
      query = query.gt("event_date", cursorEvent.event_date);
    }
  }

  // limit + 1개를 가져와서 다음 페이지 존재 여부 확인
  query = query.limit(limit + 1);

  const { data, error } = await query;

  if (error || !data) {
    return { data: [] };
  }

  // 다음 커서 설정
  const hasMore = data.length > limit;
  const events = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? events[events.length - 1].id : undefined;

  return { data: events, nextCursor };
}
```

### 주의사항

1. **초기 데이터 필수**: 서버에서 첫 페이지 데이터를 가져와 전달 (SEO, 초기 로딩 속도)
2. **커서 기반**: OFFSET 방식보다 성능이 우수한 커서 기반 페이지네이션 권장
3. **IntersectionObserver**: 200px 전에 미리 로드하여 부드러운 UX 제공
4. **메모리 관리**: 컴포넌트 언마운트 시 자동으로 Observer 해제

### 성능 최적화

- IntersectionObserver로 효율적인 스크롤 감지
- 200px rootMargin으로 미리 로딩하여 끊김 없는 UX
- 커서 기반 페이지네이션으로 대용량 데이터 처리 최적화
- 로딩 중일 때 중복 요청 방지
