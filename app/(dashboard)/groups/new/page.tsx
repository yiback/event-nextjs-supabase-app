"use client";

// 모임 생성 페이지
// 새 모임을 생성하는 폼

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupForm, type GroupFormValues } from "@/components/groups/group-form";

export default function NewGroupPage() {
  const router = useRouter();

  // 폼 제출 핸들러 (Phase 3에서 API 연동 예정)
  const handleSubmit = (values: GroupFormValues) => {
    console.log("모임 생성 데이터:", values);
    // TODO: Phase 3에서 실제 API 호출로 교체
    // 임시로 모임 목록 페이지로 이동
    router.push("/groups");
  };

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

      {/* 모임 생성 폼 */}
      <GroupForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
