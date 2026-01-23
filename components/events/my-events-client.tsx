"use client";

// 내 이벤트 클라이언트 컴포넌트
// 필터링, 뷰 토글, 캘린더 뷰 등 인터랙티브 기능

import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import type { EventWithGroup } from "@/types";
import { ViewToggle, type ViewMode } from "@/components/common/view-toggle";
import { EventCard } from "@/components/common/event-card";
import { SimpleCalendar } from "@/components/events/simple-calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 필터 타입
type FilterType = "all" | "upcoming" | "past";

// 참석 현황 카운트 타입
interface ParticipantCounts {
  attending: number;
  not_attending: number;
  maybe: number;
}

interface MyEventsClientProps {
  events: (EventWithGroup & { participantCounts: ParticipantCounts })[];
}

export function MyEventsClient({ events }: MyEventsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<FilterType>("all");
  // 클라이언트에서만 현재 시간을 설정하여 hydration 불일치 방지
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // 필터링된 이벤트 목록
  const filteredEvents = useMemo(() => {
    // 클라이언트에서 now가 설정되기 전에는 전체 이벤트 반환
    if (!now) return events;

    switch (filter) {
      case "upcoming":
        return events.filter((event) => new Date(event.event_date) >= now);
      case "past":
        return events.filter((event) => new Date(event.event_date) < now);
      default:
        return events;
    }
  }, [events, filter, now]);

  // 캘린더용 이벤트 날짜 데이터
  const eventDates = useMemo(() => {
    const dateMap = new Map<string, number>();

    filteredEvents.forEach((event) => {
      const dateKey = new Date(event.event_date).toDateString();
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

    return Array.from(dateMap.entries()).map(([dateStr, count]) => ({
      date: new Date(dateStr),
      count,
    }));
  }, [filteredEvents]);

  // 날짜 클릭 핸들러 (캘린더)
  const handleDateClick = (date: Date) => {
    console.log("날짜 클릭:", date);
    // TODO: 해당 날짜의 이벤트 목록 표시
  };

  // 카운트 계산
  const upcomingCount = now
    ? events.filter((e) => new Date(e.event_date) >= now).length
    : 0;
  const pastCount = now
    ? events.filter((e) => new Date(e.event_date) < now).length
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">내 이벤트</h1>
          <p className="text-muted-foreground mt-1">
            참여 중인 이벤트 {events.length}개
          </p>
        </div>

        {/* 뷰 토글 */}
        <ViewToggle
          value={viewMode}
          onValueChange={setViewMode}
          className="w-full sm:w-auto sm:min-w-[200px]"
        />
      </div>

      {/* 필터 탭 */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as FilterType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체 ({events.length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            예정 ({now ? upcomingCount : "-"})
          </TabsTrigger>
          <TabsTrigger value="past">지난 ({now ? pastCount : "-"})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 이벤트 목록 또는 캘린더 */}
      {viewMode === "list" ? (
        // 리스트 뷰
        filteredEvents.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                participantCounts={event.participantCounts}
              />
            ))}
          </div>
        )
      ) : (
        // 캘린더 뷰
        <div className="space-y-6">
          <SimpleCalendar
            eventDates={eventDates}
            onDateClick={handleDateClick}
            className="max-w-md mx-auto"
          />

          {/* 선택한 날짜의 이벤트 목록 (향후 구현) */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">이벤트 목록</h3>
            {filteredEvents.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    participantCounts={event.participantCounts}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 빈 상태 컴포넌트
function EmptyState({ filter }: { filter: FilterType }) {
  const messages: Record<FilterType, { title: string; description: string }> = {
    all: {
      title: "참여 중인 이벤트가 없습니다",
      description: "모임에 가입하고 이벤트에 참여해보세요!",
    },
    upcoming: {
      title: "예정된 이벤트가 없습니다",
      description: "새로운 이벤트가 등록되면 알려드릴게요!",
    },
    past: {
      title: "지난 이벤트가 없습니다",
      description: "앞으로 참여하는 이벤트가 여기에 기록됩니다",
    },
  };

  const { title, description } = messages[filter];

  return (
    <div className="text-center py-12">
      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
