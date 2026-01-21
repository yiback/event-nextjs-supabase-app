"use client";

// 공지사항 카드 컴포넌트
// 공지사항 목록에서 개별 항목을 표시

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { AnnouncementWithAuthor } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewBadge } from "@/components/common/new-badge";

interface AnnouncementCardProps {
  announcement: AnnouncementWithAuthor;
  showGroup?: boolean;
  groupName?: string;
}

export function AnnouncementCard({
  announcement,
  showGroup = false,
  groupName,
}: AnnouncementCardProps) {
  // 24시간 이내 작성 여부 확인
  const isNew = () => {
    const createdAt = new Date(announcement.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  // 공지사항 상세 링크 (Phase 3에서 구현 예정)
  const href = `/announcements/${announcement.id}`;

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          {/* 헤더: 아이콘 + 작성자 정보 + NEW 뱃지 */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={announcement.author.avatar_url || undefined}
                    alt={announcement.author.full_name}
                  />
                  <AvatarFallback className="text-xs">
                    {announcement.author.full_name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {announcement.author.full_name}
                </span>
              </div>
            </div>
            {isNew() && <NewBadge createdAt={new Date(announcement.created_at)} />}
          </div>

          {/* 제목 */}
          <h3 className="font-semibold line-clamp-1 mb-2">
            {announcement.title}
          </h3>

          {/* 내용 미리보기 */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {announcement.content}
          </p>

          {/* 푸터: 모임명 + 작성 시간 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {showGroup && groupName && (
              <>
                <span className="font-medium">{groupName}</span>
                <span>•</span>
              </>
            )}
            <span>
              {formatDistanceToNow(new Date(announcement.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
