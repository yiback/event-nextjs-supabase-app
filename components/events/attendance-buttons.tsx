"use client";

// 참석 응답 버튼 컴포넌트
// 참석/불참/미정 3개 버튼으로 참석 상태 선택

import { Check, X, HelpCircle } from "lucide-react";
import type { AttendanceStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttendanceButtonsProps {
  currentStatus: AttendanceStatus | null;
  onStatusChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  className?: string;
}

// 상태별 설정
const statusConfig: Record<
  AttendanceStatus,
  {
    label: string;
    icon: typeof Check;
    activeClass: string;
    inactiveClass: string;
  }
> = {
  attending: {
    label: "참석",
    icon: Check,
    activeClass: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500",
    inactiveClass: "border-emerald-300 text-emerald-600 hover:bg-emerald-50",
  },
  not_attending: {
    label: "불참",
    icon: X,
    activeClass: "bg-red-500 hover:bg-red-600 text-white border-red-500",
    inactiveClass: "border-red-300 text-red-600 hover:bg-red-50",
  },
  maybe: {
    label: "미정",
    icon: HelpCircle,
    activeClass: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
    inactiveClass: "border-amber-300 text-amber-600 hover:bg-amber-50",
  },
};

const statusOrder: AttendanceStatus[] = ["attending", "not_attending", "maybe"];

export function AttendanceButtons({
  currentStatus,
  onStatusChange,
  disabled = false,
  className,
}: AttendanceButtonsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {statusOrder.map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isActive = currentStatus === status;

        return (
          <Button
            key={status}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onStatusChange(status)}
            className={cn(
              "flex-1 gap-2 transition-all",
              isActive ? config.activeClass : config.inactiveClass
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
