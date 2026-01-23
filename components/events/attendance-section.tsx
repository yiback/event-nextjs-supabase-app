"use client";

// 참석 응답 섹션 컴포넌트
// Server Action 연동을 위한 클라이언트 컴포넌트

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { respondToEvent } from "@/app/actions/participants";
import type { AttendanceStatus } from "@/types/enums";
import { AttendanceButtons } from "./attendance-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceSectionProps {
  eventId: string;
  initialStatus: AttendanceStatus | null;
}

export function AttendanceSection({
  eventId,
  initialStatus,
}: AttendanceSectionProps) {
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus | null>(
    initialStatus
  );
  const [isPending, startTransition] = useTransition();

  // 참석 상태 변경 핸들러
  const handleStatusChange = (status: AttendanceStatus) => {
    startTransition(async () => {
      const result = await respondToEvent(eventId, status);

      if (result.success) {
        setCurrentStatus(status);
        toast.success("응답 완료", {
          description: getStatusMessage(status),
        });
      } else {
        toast.error("응답 실패", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">나의 참석 응답</CardTitle>
      </CardHeader>
      <CardContent>
        <AttendanceButtons
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
          disabled={isPending}
        />
        {currentStatus && (
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {getStatusMessage(currentStatus)}
          </p>
        )}
        {isPending && (
          <p className="text-sm text-muted-foreground mt-3 text-center">
            응답 처리 중...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// 상태별 메시지
function getStatusMessage(status: AttendanceStatus): string {
  switch (status) {
    case "attending":
      return "참석으로 응답했습니다";
    case "not_attending":
      return "불참으로 응답했습니다";
    case "maybe":
      return "미정으로 응답했습니다";
  }
}
