"use client";

// 공통 푸터 컴포넌트
// 저작권 정보 및 링크 포함

import Link from "next/link";
import { PartyPopper } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* 로고 및 설명 */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <PartyPopper className="h-4 w-4 text-primary" />
              <span className="text-sm">모임 이벤트</span>
            </Link>
            <p className="text-xs text-muted-foreground text-center md:text-left">
              소규모 모임의 이벤트 참석 관리와 공지를 효율적으로
            </p>
          </div>

          {/* 링크 */}
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              개인정보처리방침
            </Link>
          </nav>
        </div>

        {/* 저작권 */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} 모임 이벤트. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
