"use client";

// 모임 생성 페이지
// 새 모임을 생성하는 폼 + Server Action 연동

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupForm } from "@/components/groups/group-form";
import { createGroup } from "@/app/actions/groups";

export default function NewGroupPage() {
  const router = useRouter();

  // 취소 핸들러
  const handleCancel = () => {
    router.push("/groups");
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/groups">
          <ArrowLeft className="h-4 w-4 mr-2" />
          모임 목록으로
        </Link>
      </Button>

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">새 모임 만들기</h1>
        <p className="text-muted-foreground mt-2">
          새로운 모임을 만들어 멤버들을 초대하세요
        </p>
      </div>

      {/* 모임 생성 폼 (Server Action 연동) */}
      <GroupForm action={createGroup} onCancel={handleCancel} />
    </div>
  );
}
