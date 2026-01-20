"use client";

// 이벤트 상세 페이지
// 이벤트 정보, 참석자 목록, 참석 응답 관리

import { Suspense } from "react";
import { useParams } from "next/navigation";

function EventDetailContent() {
  const params = useParams();
  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">이벤트 상세</h1>
      <p className="text-muted-foreground mt-2">
        모임 ID: <code className="font-mono bg-muted px-2 py-1 rounded">{groupId}</code>
        {" / "}
        이벤트 ID: <code className="font-mono bg-muted px-2 py-1 rounded">{eventId}</code>
      </p>
      {/* TODO: 이벤트 정보, 참석자 목록, 참석/불참 버튼 구현 */}
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <EventDetailContent />
    </Suspense>
  );
}
