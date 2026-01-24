"use client";

// 이벤트 삭제 버튼 컴포넌트
// 확인 다이얼로그 후 삭제 실행

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteEventButtonProps {
  eventId: string;
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteEvent(eventId);

        // redirect가 발생하지 않은 경우 (에러)
        if (result && !result.success) {
          toast.error("이벤트 삭제 실패", {
            description: result.error,
          });
          setOpen(false);
        }
        // 성공 시 redirect가 발생하므로 토스트는 표시되지 않음
      } catch (error) {
        // NEXT_REDIRECT 에러는 정상적인 redirect이므로 무시
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          return;
        }

        console.error("이벤트 삭제 오류:", error);
        toast.error("오류가 발생했습니다", {
          description: "다시 시도해주세요",
        });
        setOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이벤트를 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다. 이벤트와 관련된 모든 데이터(참석자
            응답, 이미지 등)가 영구적으로 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "삭제 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
