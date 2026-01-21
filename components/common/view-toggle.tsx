"use client";

// 리스트/캘린더 뷰 전환 토글
// Radix UI Tabs 기반으로 구현

import { Calendar, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "calendar";

interface ViewToggleProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onValueChange, className }: ViewToggleProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as ViewMode)}
      className={className}
    >
      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
        <TabsTrigger
          value="list"
          className={cn(
            "flex items-center gap-2",
            "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
            "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600"
          )}
        >
          <List className="h-4 w-4" />
          <span>리스트</span>
        </TabsTrigger>
        <TabsTrigger
          value="calendar"
          className={cn(
            "flex items-center gap-2",
            "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
            "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>캘린더</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
