"use client";

// NEW 뱃지
// 이벤트 생성일이 7일 이내인 경우 표시

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";

interface NewBadgeProps {
  createdAt: Date;
  className?: string;
}

export function NewBadge({ createdAt, className }: NewBadgeProps) {
  // 클라이언트에서만 날짜 계산을 수행하여 hydration 불일치 방지
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const daysSinceCreation = differenceInDays(new Date(), createdAt);
    setIsNew(daysSinceCreation <= 7);
  }, [createdAt]);

  // 클라이언트에서 계산되기 전이거나 7일이 지난 경우 표시하지 않음
  if (!isNew) {
    return null;
  }

  return (
    <Badge variant="new" className={className}>
      NEW
    </Badge>
  );
}
