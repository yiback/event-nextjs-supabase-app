import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /** 표시할 아이콘 (lucide-react 아이콘 컴포넌트) */
  icon: LucideIcon;
  /** 메인 타이틀 */
  title: string;
  /** 설명 텍스트 */
  description: string;
  /** 선택적 액션 버튼 */
  action?: {
    /** 버튼 라벨 */
    label: string;
    /** 버튼 링크 경로 */
    href: string;
  };
  /** 추가 className (선택) */
  className?: string;
}

/**
 * EmptyState 공통 컴포넌트
 *
 * 데이터가 없을 때 표시하는 빈 상태 UI
 * 일관된 디자인과 레이아웃을 제공
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Users}
 *   title="모임이 없습니다"
 *   description="새로운 모임을 만들어보세요"
 *   action={{
 *     label: "모임 만들기",
 *     href: "/groups/new"
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
    >
      {/* 아이콘 */}
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* 타이틀 */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* 설명 */}
      <p className="text-muted-foreground mb-4">{description}</p>

      {/* 액션 버튼 (선택) */}
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
