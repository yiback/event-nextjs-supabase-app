// 내 이벤트 페이지 (서버 컴포넌트)
// 사용자가 속한 모임의 모든 이벤트 목록 + 무한 스크롤

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventsForUserPaginated } from "@/app/actions/events";
import { getParticipantCounts } from "@/app/actions/participants";
import { MyEventsClient } from "@/components/events/my-events-client";

export default async function MyEventsPage() {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 첫 페이지 이벤트 목록 조회 (10개)
  const { data: events, nextCursor } = await getEventsForUserPaginated(
    undefined,
    10
  );

  // 각 이벤트의 참석 현황 조회
  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const counts = await getParticipantCounts(event.id);
      return {
        ...event,
        participantCounts: counts,
      };
    })
  );

  // 다음 페이지가 있는지 여부
  const hasMore = !!nextCursor;

  return (
    <MyEventsClient
      events={eventsWithCounts}
      initialCursor={nextCursor}
      initialHasMore={hasMore}
    />
  );
}
