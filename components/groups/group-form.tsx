"use client";

// 모임 생성/수정 폼 컴포넌트
// React Hook Form + Zod 유효성 검사

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 폼 유효성 검사 스키마
const groupFormSchema = z.object({
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

interface GroupFormProps {
  defaultValues?: Partial<GroupFormValues>;
  onSubmit: (values: GroupFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function GroupForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GroupFormProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 모임 이미지 업로드 영역 (UI만) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">모임 이미지</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-muted p-3">
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  클릭하여 이미지 업로드
                </span>
                <br />
                PNG, JPG, GIF (최대 5MB)
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            * 이미지 업로드 기능은 추후 지원 예정입니다
          </p>
        </div>

        {/* 모임 이름 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>모임 이름 *</FormLabel>
              <FormControl>
                <Input placeholder="예: 주말 수영 모임" {...field} />
              </FormControl>
              <FormDescription>
                모임을 대표하는 이름을 입력하세요 (2-50자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 모임 설명 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>모임 설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="모임에 대한 간단한 설명을 입력하세요"
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                모임의 목적, 활동 내용 등을 자유롭게 작성하세요 (최대 500자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 영역 */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              취소
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "처리 중..." : "모임 만들기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
