// 참석 상태 뱃지
// status 값에 따라 적절한 variant와 텍스트 표시

import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/types";

interface AttendanceBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

const statusConfig: Record<AttendanceStatus, { variant: "attending" | "notAttending" | "maybe"; label: string }> = {
  attending: { variant: "attending", label: "참석" },
  not_attending: { variant: "notAttending", label: "불참" },
  maybe: { variant: "maybe", label: "미정" },
};

export function AttendanceBadge({ status, className }: AttendanceBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
