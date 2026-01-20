// 공개 페이지용 헤더 컴포넌트
// 로고와 로그인/회원가입 버튼 포함

import Link from "next/link";
import { PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PartyPopper className="h-5 w-5 text-primary" />
          <span>모임 이벤트</span>
        </Link>

        {/* 로그인/회원가입 버튼 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">로그인</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/sign-up">회원가입</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
