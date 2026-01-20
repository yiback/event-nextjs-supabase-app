"use client";

// 초대 링크 페이지
// 모임 초대 코드로 접근하는 공개 페이지

import { Suspense } from "react";
import { useParams } from "next/navigation";

function InviteContent() {
  const params = useParams();
  const code = params.code as string;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <h1 className="text-2xl font-bold">모임 초대</h1>
      <p className="text-muted-foreground mt-2">
        초대 코드: <code className="font-mono bg-muted px-2 py-1 rounded">{code}</code>
      </p>
      <div className="mt-6">
        {/* 추후 초대 수락/거절 UI 구현 예정 */}
        <p className="text-sm text-muted-foreground">
          로그인 후 초대를 수락할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">로딩 중...</div>}>
      <InviteContent />
    </Suspense>
  );
}
