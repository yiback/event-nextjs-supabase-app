"use client";

// 초대 코드 섹션 컴포넌트
// 초대 코드 표시 및 복사 기능

import { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InviteCodeSectionProps {
  inviteCode: string;
}

export function InviteCodeSection({ inviteCode }: InviteCodeSectionProps) {
  const [copied, setCopied] = useState(false);

  // 초대 코드 복사 핸들러
  const handleCopy = async () => {
    try {
      // 초대 링크 URL 생성
      const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);

      // 성공 토스트 표시
      toast.success("클립보드에 복사되었습니다", {
        description: "초대 링크를 친구들과 공유하세요",
      });

      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      toast.error("복사 실패", {
        description: "클립보드 복사 중 오류가 발생했습니다",
      });
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <LinkIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">초대 코드</p>
              <p className="text-lg font-mono font-bold tracking-wider">
                {inviteCode}
              </p>
            </div>
          </div>

          <Button
            variant={copied ? "default" : "outline"}
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                링크 복사
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
