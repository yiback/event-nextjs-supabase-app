"use client";

// 다가오는 이벤트 섹션
// 최대 4개의 예정된 이벤트를 그리드로 표시

import Link from "next/link";
import { Calendar } from "lucide-react";
import { getUpcomingEvents } from "@/lib/mock";
import { EventCard } from "@/components/common/event-card";
import { Button } from "@/components/ui/button";

export function UpcomingEvents() {
  const upcomingEvents = getUpcomingEvents().slice(0, 4);

  return (
    <section className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          다가오는 이벤트
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events">전체보기</Link>
        </Button>
      </div>

      {/* 이벤트 그리드 */}
      {upcomingEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        // 빈 상태 UI
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">예정된 이벤트가 없습니다</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/events/new">새 이벤트 만들기</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
