import { z } from "zod";

// 이벤트 생성/수정 폼 유효성 검사 스키마
// Server Actions와 Client Component 양쪽에서 재사용
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(2, "이벤트 제목은 2자 이상이어야 합니다")
    .max(100, "이벤트 제목은 100자 이하여야 합니다"),
  description: z
    .string()
    .max(2000, "설명은 2000자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  event_date: z
    .string()
    .min(1, "이벤트 날짜를 선택해주세요")
    .refine((date) => !isNaN(Date.parse(date)), "올바른 날짜 형식이 아닙니다"),
  location: z
    .string()
    .max(200, "장소는 200자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  response_deadline: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "올바른 날짜 형식이 아닙니다"
    ),
  max_participants: z
    .number()
    .int("정수를 입력해주세요")
    .min(1, "최소 1명 이상이어야 합니다")
    .max(1000, "최대 1000명까지 설정 가능합니다")
    .optional()
    .nullable(),
  cost: z
    .number()
    .int("정수를 입력해주세요")
    .min(0, "비용은 0원 이상이어야 합니다")
    .max(10000000, "비용은 1000만원 이하여야 합니다")
    .optional()
    .default(0),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

// 이벤트 상태 변경 스키마
export const eventStatusSchema = z.enum([
  "scheduled",
  "ongoing",
  "completed",
  "cancelled",
]);

export type EventStatusValues = z.infer<typeof eventStatusSchema>;
