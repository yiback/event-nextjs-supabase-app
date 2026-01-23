// 초대 링크 페이지 (서버 컴포넌트)
// 모임 초대 코드로 접근하는 공개 페이지

import Image from "next/image";
import Link from "next/link";
import { Users, XCircle, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getGroupByInviteCode,
  checkIfUserIsMember,
} from "@/app/actions/groups";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InviteJoinButton } from "./invite-join-button";

interface InvitePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // 1. 초대 코드로 모임 조회
  const result = await getGroupByInviteCode(code);

  // 2. 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. 이미 멤버인지 확인
  let isMember = false;
  if (result.success && user) {
    isMember = await checkIfUserIsMember(result.data.group.id);
  }

  // 유효하지 않은 초대 코드인 경우
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">유효하지 않은 초대 코드</CardTitle>
            <CardDescription>
              입력하신 초대 코드를 찾을 수 없습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-center">
                초대 코드: <code className="font-mono font-semibold">{code}</code>
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>다음 사항을 확인해주세요:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>초대 코드가 정확한지 확인</li>
                <li>초대 코드가 만료되지 않았는지 확인</li>
                <li>모임 주최자에게 새 초대 링크 요청</li>
              </ul>
            </div>

            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                홈으로 이동
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { group, memberCount } = result.data;

  // 유효한 초대 코드인 경우
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {group.image_url ? (
                <Image
                  src={group.image_url}
                  alt={group.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <Users className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">모임 초대</CardTitle>
          <CardDescription>{group.name} 모임에 초대되었습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 모임 정보 */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                모임 이름
              </h3>
              <p className="text-lg font-semibold">{group.name}</p>
            </div>

            {group.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  모임 소개
                </h3>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                멤버 수
              </h3>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                {memberCount}명
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                초대 코드
              </h3>
              <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                {code.toUpperCase()}
              </code>
            </div>
          </div>

          {/* 가입 버튼 또는 상태 표시 */}
          <InviteJoinButton
            inviteCode={code}
            groupId={group.id}
            groupName={group.name}
            isLoggedIn={!!user}
            isMember={isMember}
          />

          {/* 안내 메시지 */}
          <p className="text-xs text-center text-muted-foreground">
            가입하시면 모임의 이벤트와 공지사항을 확인할 수 있습니다
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
