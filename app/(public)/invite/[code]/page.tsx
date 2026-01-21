"use client";

// 초대 링크 페이지
// 모임 초대 코드로 접근하는 공개 페이지

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Users, CheckCircle, XCircle, Home } from "lucide-react";
import { getGroupByInviteCode, getMembersForGroup } from "@/lib/mock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function InviteContent() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  // 초대 코드로 모임 조회
  const group = getGroupByInviteCode(code);
  const members = group ? getMembersForGroup(group.id) : [];

  // 모임 가입하기 처리 (UI만, 실제 로직은 Phase 3)
  const handleJoinGroup = () => {
    toast.success(`"${group?.name}" 모임에 가입되었습니다!`);
    // Phase 3에서 실제 가입 로직 구현 후 모임 상세로 이동
    // router.push(`/groups/${group?.id}`);
  };

  // 유효한 초대 코드인 경우
  if (group) {
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
            <CardDescription>
              {group.name} 모임에 초대되었습니다
            </CardDescription>
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
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  멤버 수
                </h3>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {members.length}명
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  초대 코드
                </h3>
                <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                  {code}
                </code>
              </div>
            </div>

            {/* 가입 버튼 */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleJoinGroup}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              모임 가입하기
            </Button>

            {/* 안내 메시지 */}
            <p className="text-xs text-center text-muted-foreground">
              가입하시면 모임의 이벤트와 공지사항을 확인할 수 있습니다
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 유효하지 않은 초대 코드인 경우
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

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => router.push("/")}
          >
            <Home className="h-5 w-5 mr-2" />
            홈으로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
