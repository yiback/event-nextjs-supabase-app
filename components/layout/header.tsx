"use client";

// 대시보드용 데스크톱 헤더 컴포넌트
// 로고, 모임 선택, 검색, 알림, 프로필 드롭다운 포함

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  PartyPopper,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 네비게이션 링크 정의
const navLinks = [
  { href: "/groups", label: "내 모임", icon: Users },
];

interface HeaderProps {
  // 추후 프로필 데이터, 알림 개수 등 props 추가 예정
  unreadNotifications?: number;
}

export function Header({ unreadNotifications = 0 }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* 좌측: 로고 */}
        <div className="mr-4 flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <PartyPopper className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline-block">모임 이벤트</span>
          </Link>
        </div>

        {/* 중앙: 모임 선택 드롭다운 + 네비게이션 */}
        <div className="flex flex-1 items-center gap-4">
          {/* 모임 선택 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">모임 선택</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>가입한 모임</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* TODO: 실제 모임 목록 데이터로 교체 */}
              <DropdownMenuItem asChild>
                <Link href="/groups/example-1">
                  <Users className="mr-2 h-4 w-4" />
                  주간 수영 모임
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/groups/example-2">
                  <Users className="mr-2 h-4 w-4" />
                  독서 클럽
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/groups/new" className="text-primary">
                  + 새 모임 만들기
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 네비게이션 링크 */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 우측: 검색, 알림, 프로필 */}
        <div className="flex items-center gap-1">
          {/* 검색 버튼 */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
            <span className="sr-only">검색</span>
          </Button>

          {/* 알림 버튼 */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative" asChild>
            <Link href="/notifications">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
              <span className="sr-only">알림</span>
            </Link>
          </Button>

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="프로필" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">프로필 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">사용자 이름</p>
                  <p className="text-xs text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
