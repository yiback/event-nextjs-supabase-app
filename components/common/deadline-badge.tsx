"use client";

// 마감일 기준 D-N 표시 뱃지
// 마감일까지 남은 일수에 따라 variant 자동 결정

import { Badge } from "@/components/ui/badge";
import { differenceInDays, isToday, isPast, startOfDay } from "date-fns";

interface DeadlineBadgeProps {
  deadline: Date;
  className?: string;
}

export function DeadlineBadge({ deadline, className }: DeadlineBadgeProps) {
  const today = startOfDay(new Date());
  const deadlineDate = startOfDay(deadline);
  const daysLeft = differenceInDays(deadlineDate, today);

  // 마감됨 (오늘 이전)
  if (isPast(deadlineDate) && !isToday(deadline)) {
    return (
      <Badge variant="deadlineClosed" className={className}>
        마감됨
      </Badge>
    );
  }

  // 오늘 마감
  if (isToday(deadline)) {
    return (
      <Badge variant="deadlineToday" className={className}>
        오늘 마감
      </Badge>
    );
  }

  // D-1 (내일 마감)
  if (daysLeft === 1) {
    return (
      <Badge variant="deadlineSoon" className={className}>
        D-1
      </Badge>
    );
  }

  // D-N (2일 이상)
  return (
    <Badge variant="deadline" className={className}>
      D-{daysLeft}
    </Badge>
  );
}
