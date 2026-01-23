// 최근 공지사항 섹션 (서버 컴포넌트)
// 최대 5개의 최신 공지사항을 리스트로 표시

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { getRecentAnnouncements } from "@/app/actions/announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function RecentAnnouncements() {
  const announcements = await getRecentAnnouncements(5);

  return (
    <section className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          최근 공지사항
        </h2>
        {announcements.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups">모임 보기</Link>
          </Button>
        )}
      </div>

      {/* 공지사항 리스트 */}
      {announcements.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/groups/${announcement.group_id}/announcements`}
                  className="block p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* 제목 */}
                      <h3 className="font-medium line-clamp-1 mb-1">
                        {announcement.title}
                      </h3>
                      {/* 모임명 + 작성일 */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {announcement.groupName && (
                          <>
                            <span>{announcement.groupName}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>
                          {formatDistanceToNow(
                            new Date(announcement.created_at),
                            {
                              addSuffix: true,
                              locale: ko,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // 빈 상태 UI
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">공지사항이 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">
            모임에서 공지사항을 확인해보세요
          </p>
        </div>
      )}
    </section>
  );
}
