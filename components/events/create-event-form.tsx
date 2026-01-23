"use client";

// 이벤트 생성 폼 래퍼 컴포넌트
// Server Action 연동을 위한 클라이언트 컴포넌트

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEvent } from "@/app/actions/events";
import { EventForm, type EventFormValues } from "./event-form";

interface CreateEventFormProps {
  groupId: string;
  groupName: string;
}

export function CreateEventForm({ groupId, groupName }: CreateEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 제출 핸들러
  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("event_date", values.event_date);
      formData.append("location", values.location || "");
      if (values.response_deadline) {
        formData.append("response_deadline", values.response_deadline);
      }
      if (values.max_participants !== null && values.max_participants !== undefined) {
        formData.append("max_participants", String(values.max_participants));
      }
      formData.append("cost", String(values.cost || 0));

      // Server Action 호출 (redirect가 포함되어 있으므로 catch 불필요)
      const result = await createEvent(groupId, formData);

      // redirect가 발생하지 않은 경우 (에러)
      if (result && !result.success) {
        toast.error("이벤트 생성 실패", {
          description: result.error,
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      // NEXT_REDIRECT 에러는 정상적인 redirect이므로 무시
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        return;
      }

      console.error("이벤트 생성 오류:", error);
      toast.error("오류 발생", {
        description: "이벤트 생성 중 오류가 발생했습니다",
      });
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      {/* 모임 정보 */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{groupName}</span>
          에 새 이벤트를 만듭니다
        </p>
      </div>

      {/* 이벤트 폼 */}
      <EventForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
