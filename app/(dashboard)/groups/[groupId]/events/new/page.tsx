"use client";

// 이벤트 생성 페이지
// 모임 내 새 이벤트 생성 폼

import { Suspense } from "react";
import { useParams } from "next/navigation";

function NewEventContent() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">새 이벤트 만들기</h1>
      <p className="text-muted-foreground mt-2">
        모임 ID: <code className="font-mono bg-muted px-2 py-1 rounded">{groupId}</code>
      </p>
      {/* TODO: 이벤트 생성 폼 (제목, 날짜, 시간, 장소, 최대 인원) 구현 */}
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <NewEventContent />
    </Suspense>
  );
}
