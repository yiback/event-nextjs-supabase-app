"use client";

// 마감일 기준 D-N 표시 뱃지
// 마감일까지 남은 일수에 따라 variant 자동 결정

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, isToday, isPast, startOfDay } from "date-fns";

interface DeadlineBadgeProps {
  deadline: Date;
  className?: string;
}

type BadgeState = {
  type: "loading" | "closed" | "today" | "soon" | "days";
  daysLeft?: number;
};

export function DeadlineBadge({ deadline, className }: DeadlineBadgeProps) {
  // 클라이언트에서만 날짜 계산을 수행하여 hydration 불일치 방지
  const [badgeState, setBadgeState] = useState<BadgeState>({ type: "loading" });

  useEffect(() => {
    const today = startOfDay(new Date());
    const deadlineDate = startOfDay(deadline);
    const daysLeft = differenceInDays(deadlineDate, today);

    // 마감됨 (오늘 이전)
    if (isPast(deadlineDate) && !isToday(deadline)) {
      setBadgeState({ type: "closed" });
      return;
    }

    // 오늘 마감
    if (isToday(deadline)) {
      setBadgeState({ type: "today" });
      return;
    }

    // D-1 (내일 마감)
    if (daysLeft === 1) {
      setBadgeState({ type: "soon" });
      return;
    }

    // D-N (2일 이상)
    setBadgeState({ type: "days", daysLeft });
  }, [deadline]);

  // 로딩 중에는 표시하지 않음
  if (badgeState.type === "loading") {
    return null;
  }

  // 마감됨
  if (badgeState.type === "closed") {
    return (
      <Badge variant="deadlineClosed" className={className}>
        마감됨
      </Badge>
    );
  }

  // 오늘 마감
  if (badgeState.type === "today") {
    return (
      <Badge variant="deadlineToday" className={className}>
        오늘 마감
      </Badge>
    );
  }

  // D-1 (내일 마감)
  if (badgeState.type === "soon") {
    return (
      <Badge variant="deadlineSoon" className={className}>
        D-1
      </Badge>
    );
  }

  // D-N (2일 이상)
  return (
    <Badge variant="deadline" className={className}>
      D-{badgeState.daysLeft}
    </Badge>
  );
}
