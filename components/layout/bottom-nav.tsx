"use client";

// 모바일용 하단 네비게이션 바
// 홈, 모임, 이벤트, 마이페이지 4개 탭

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

// 네비게이션 탭 정의
const navTabs = [
  {
    href: "/dashboard",
    label: "홈",
    icon: Home,
  },
  {
    href: "/groups",
    label: "내모임",
    icon: Users,
  },
  {
    href: "/events",
    label: "이벤트",
    icon: Calendar,
  },
  {
    href: "/settings",
    label: "마이페이지",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // 현재 경로가 해당 탭의 경로로 시작하는지 확인
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] border-t bg-background">
      <div className="flex items-center justify-around h-16 px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  active && "fill-primary stroke-primary"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active && "font-semibold"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* 하단 안전 영역 (iPhone 노치 대응) */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
