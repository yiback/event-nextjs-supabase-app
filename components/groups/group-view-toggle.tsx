"use client";

// 그리드/리스트 뷰 전환 토글
// 모임 목록 페이지에서 사용

import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type GroupViewMode = "grid" | "list";

interface GroupViewToggleProps {
  value: GroupViewMode;
  onValueChange: (value: GroupViewMode) => void;
  className?: string;
}

export function GroupViewToggle({
  value,
  onValueChange,
  className,
}: GroupViewToggleProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as GroupViewMode)}
      className={className}
    >
      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
        <TabsTrigger
          value="grid"
          className={cn(
            "flex items-center gap-2",
            "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
            "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>그리드</span>
        </TabsTrigger>
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
      </TabsList>
    </Tabs>
  );
}
