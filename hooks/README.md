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
