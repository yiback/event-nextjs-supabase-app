"use client";

// 공지사항 작성 폼 컴포넌트
// React Hook Form + Zod 유효성 검사

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Megaphone } from "lucide-react";
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
const announcementFormSchema = z.object({
  title: z
    .string()
    .min(2, "제목은 2자 이상이어야 합니다")
    .max(100, "제목은 100자 이하여야 합니다"),
  content: z
    .string()
    .min(10, "내용은 10자 이상이어야 합니다")
    .max(1000, "내용은 1000자 이하여야 합니다"),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AnnouncementFormProps {
  groupId?: string;
  eventId?: string;
  defaultValues?: Partial<AnnouncementFormValues>;
  onSubmit: (values: AnnouncementFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AnnouncementForm({
  groupId,
  eventId,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
    },
  });

  // 현재 글자 수
  const titleLength = form.watch("title")?.length ?? 0;
  const contentLength = form.watch("content")?.length ?? 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 폼 헤더 */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">공지사항 작성</h2>
            <p className="text-sm text-muted-foreground">
              {groupId && eventId
                ? "이벤트 공지사항"
                : groupId
                  ? "모임 공지사항"
                  : "공지사항"}
            </p>
          </div>
        </div>

        {/* 제목 입력 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="공지사항 제목을 입력하세요"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                {titleLength}/100자
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 내용 입력 */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="공지사항 내용을 입력하세요"
                  className="min-h-[200px] resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                {contentLength}/1000자
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 그룹 */}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "공지사항 등록"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
