"use client";

// 공지사항 작성 폼 클라이언트 컴포넌트
// Server Action 연결

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/app/actions/announcements";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import type { AnnouncementFormValues } from "@/components/announcements/announcement-form";
import { toast } from "sonner";

interface AnnouncementCreateFormProps {
  groupId: string;
  eventId?: string;
}

export function AnnouncementCreateForm({
  groupId,
  eventId,
}: AnnouncementCreateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: AnnouncementFormValues) => {
    setIsSubmitting(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);

      // Server Action 호출
      const result = await createAnnouncement(groupId, eventId || null, formData);

      // 에러 처리 (redirect가 아닌 경우에만 result가 반환됨)
      if (result && !result.success) {
        toast.error("공지사항 생성 실패", {
          description: result.error,
        });
        setIsSubmitting(false);
      }
      // 성공 시 Server Action에서 redirect 처리
    } catch (error) {
      // NEXT_REDIRECT 에러는 정상적인 redirect이므로 무시
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        return;
      }

      console.error("공지사항 생성 오류:", error);
      toast.error("오류가 발생했습니다", {
        description: "다시 시도해주세요",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/groups/${groupId}/announcements`);
  };

  return (
    <AnnouncementForm
      groupId={groupId}
      eventId={eventId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
}
