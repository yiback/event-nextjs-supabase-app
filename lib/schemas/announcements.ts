import { z } from "zod";

// 공지사항 생성/수정 폼 유효성 검사 스키마
// Server Actions와 Client Component 양쪽에서 재사용
export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(2, "공지 제목은 2자 이상이어야 합니다")
    .max(100, "공지 제목은 100자 이하여야 합니다"),
  content: z
    .string()
    .min(10, "공지 내용은 10자 이상이어야 합니다")
    .max(1000, "공지 내용은 1000자 이하여야 합니다"),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
