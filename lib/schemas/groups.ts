import { z } from "zod";

// 모임 생성/수정 폼 유효성 검사 스키마
// Server Actions와 Client Component 양쪽에서 재사용
export const groupFormSchema = z.object({
  name: z
    .string()
    .min(2, "모임 이름은 2자 이상이어야 합니다")
    .max(50, "모임 이름은 50자 이하여야 합니다"),
  description: z
    .string()
    .max(500, "설명은 500자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;
