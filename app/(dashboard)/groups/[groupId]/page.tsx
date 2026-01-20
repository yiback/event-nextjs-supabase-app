"use client";

// 모임 상세 페이지
// 모임 정보, 이벤트 목록, 공지사항 표시

import { Suspense } from "react";
import { useParams } from "next/navigation";

function GroupDetailContent() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">모임 상세</h1>
      <p className="text-muted-foreground mt-2">
        모임 ID: <code className="font-mono bg-muted px-2 py-1 rounded">{groupId}</code>
      </p>
      {/* TODO: 모임 정보, 이벤트 목록, 공지사항 탭 구현 */}
    </div>
  );
}

export default function GroupDetailPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <GroupDetailContent />
    </Suspense>
  );
}
