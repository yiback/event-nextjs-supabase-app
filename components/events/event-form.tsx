"use client";

// 이벤트 생성/수정 폼 컴포넌트
// React Hook Form + Zod 유효성 검사

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Calendar, MapPin, Users, Clock, Coins } from "lucide-react";
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
const eventFormSchema = z.object({
  title: z
    .string()
    .min(2, "이벤트 제목은 2자 이상이어야 합니다")
    .max(100, "이벤트 제목은 100자 이하여야 합니다"),
  description: z
    .string()
    .max(1000, "설명은 1000자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  event_date: z.string().min(1, "이벤트 날짜를 선택해주세요"),
  location: z
    .string()
    .max(200, "장소는 200자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  response_deadline: z.string().optional().or(z.literal("")),
  max_participants: z
    .number()
    .min(1, "최소 1명 이상이어야 합니다")
    .max(100, "최대 100명까지 가능합니다")
    .optional()
    .nullable(),
  cost: z
    .number()
    .min(0, "비용은 0원 이상이어야 합니다"),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function EventForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      event_date: defaultValues?.event_date ?? "",
      location: defaultValues?.location ?? "",
      response_deadline: defaultValues?.response_deadline ?? "",
      max_participants: defaultValues?.max_participants ?? null,
      cost: defaultValues?.cost ?? 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 이벤트 이미지 업로드 영역 (UI만) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">이벤트 이미지</label>
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

        {/* 이벤트 제목 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이벤트 제목 *</FormLabel>
              <FormControl>
                <Input placeholder="예: 주말 수영 모임" {...field} />
              </FormControl>
              <FormDescription>
                이벤트를 대표하는 제목을 입력하세요 (2-100자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이벤트 설명 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이벤트 설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대한 상세 설명을 입력하세요"
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                이벤트의 목적, 준비물, 주의사항 등을 자유롭게 작성하세요 (최대 1000자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이벤트 날짜/시간 */}
        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                이벤트 날짜 및 시간 *
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 장소 */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                장소
              </FormLabel>
              <FormControl>
                <Input placeholder="예: 올림픽 수영장 2층" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 응답 마감일 */}
        <FormField
          control={form.control}
          name="response_deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                응답 마감일
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                참석 응답을 받을 마감 시간을 설정하세요 (선택)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* 최대 인원 */}
          <FormField
            control={form.control}
            name="max_participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  최대 인원
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="제한 없음"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value, 10) : null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 참가 비용 */}
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  참가 비용 (원)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            {isSubmitting ? "처리 중..." : "이벤트 만들기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
