"use client";

// 멤버 관리 페이지
// 모임 멤버 목록 및 관리 (관리자 전용)

import { Suspense } from "react";
import { useParams } from "next/navigation";

function MembersContent() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">멤버 관리</h1>
      <p className="text-muted-foreground mt-2">
        모임 ID: <code className="font-mono bg-muted px-2 py-1 rounded">{groupId}</code>
      </p>
      {/* TODO: 멤버 목록, 초대 링크 생성, 역할 변경 구현 */}
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <MembersContent />
    </Suspense>
  );
}
