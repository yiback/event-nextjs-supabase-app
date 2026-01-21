"use client";

// 이벤트 생성 페이지
// 모임 내 새 이벤트 생성 폼

import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockGroups } from "@/lib/mock/data";
import { Button } from "@/components/ui/button";
import { EventForm, type EventFormValues } from "@/components/events/event-form";

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 그룹 데이터 로드
  const group = mockGroups.find((g) => g.id === groupId);

  // 그룹이 없으면 404
  if (!group) {
    notFound();
  }

  // 폼 제출 핸들러 (mock)
  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);

    // 실제 API 연동 전 mock 처리
    console.log("새 이벤트 생성:", values);

    // 잠시 대기 (로딩 상태 시뮬레이션)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);

    // 성공 알림 및 리디렉션
    alert("이벤트가 생성되었습니다! (mock)");
    router.push(`/groups/${groupId}`);
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold">새 이벤트 만들기</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-xl mx-auto">
        {/* 모임 정보 */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{group.name}</span>
            에 새 이벤트를 만듭니다
          </p>
        </div>

        {/* 이벤트 폼 */}
        <EventForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}
