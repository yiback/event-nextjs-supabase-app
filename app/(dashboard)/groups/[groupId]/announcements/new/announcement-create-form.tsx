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
        toast.error(result.error || "공지사항 생성에 실패했습니다");
        setIsSubmitting(false);
      }
      // 성공 시 Server Action에서 redirect 처리
    } catch (error) {
      console.error("공지사항 생성 오류:", error);
      toast.error("공지사항 생성 중 오류가 발생했습니다");
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
