// NEW 뱃지
// 이벤트 생성일이 7일 이내인 경우 표시

import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";

interface NewBadgeProps {
  createdAt: Date;
  className?: string;
}

export function NewBadge({ createdAt, className }: NewBadgeProps) {
  const daysSinceCreation = differenceInDays(new Date(), createdAt);

  // 7일 이내 생성된 경우에만 표시
  if (daysSinceCreation > 7) {
    return null;
  }

  return (
    <Badge variant="new" className={className}>
      NEW
    </Badge>
  );
}
