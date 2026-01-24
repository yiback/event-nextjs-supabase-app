"use client";

// 초대 가입 버튼 클라이언트 컴포넌트
// 로그인 상태에 따라 다른 동작 수행

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, LogIn, Users } from "lucide-react";
import { joinGroupByCode } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InviteJoinButtonProps {
  inviteCode: string;
  groupId: string;
  groupName: string;
  isLoggedIn: boolean;
  isMember: boolean;
}

export function InviteJoinButton({
  inviteCode,
  groupId,
  groupName,
  isLoggedIn,
  isMember,
}: InviteJoinButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  // 이미 멤버인 경우
  if (isMember) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">이미 가입된 모임입니다</span>
        </div>
        <Button size="lg" className="w-full" asChild>
          <Link href={`/groups/${groupId}`}>
            <Users className="h-5 w-5 mr-2" />
            모임으로 이동
          </Link>
        </Button>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    // 현재 URL을 저장하여 로그인 후 돌아올 수 있도록 함
    const currentPath = `/invite/${inviteCode}`;

    return (
      <div className="space-y-3">
        <p className="text-sm text-center text-muted-foreground">
          모임에 가입하려면 로그인이 필요합니다
        </p>
        <Button size="lg" className="w-full" asChild>
          <Link href={`/auth/login?redirect=${encodeURIComponent(currentPath)}`}>
            <LogIn className="h-5 w-5 mr-2" />
            로그인하고 가입하기
          </Link>
        </Button>
      </div>
    );
  }

  // 가입하기 처리
  const handleJoinGroup = async () => {
    setIsJoining(true);

    try {
      const result = await joinGroupByCode(inviteCode);

      if (result.success) {
        toast.success("모임에 가입되었습니다", {
          description: `"${groupName}" 모임에 성공적으로 가입되었습니다`,
        });
        router.push(`/groups/${groupId}`);
      } else {
        toast.error("모임 가입 실패", {
          description: result.error,
        });
        setIsJoining(false);
      }
    } catch (error) {
      console.error("모임 가입 오류:", error);
      toast.error("오류가 발생했습니다", {
        description: "다시 시도해주세요",
      });
      setIsJoining(false);
    }
  };

  // 로그인한 사용자 - 가입 버튼 표시
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleJoinGroup}
      disabled={isJoining}
    >
      {isJoining ? (
        <>
          <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          가입 중...
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5 mr-2" />
          모임 가입하기
        </>
      )}
    </Button>
  );
}
