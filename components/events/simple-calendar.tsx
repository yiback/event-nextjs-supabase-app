"use client";

// 간단한 월간 캘린더 컴포넌트
// 이벤트 날짜에 dot 표시

import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventDate {
  date: Date;
  count: number;
}

interface SimpleCalendarProps {
  eventDates: EventDate[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function SimpleCalendar({
  eventDates,
  onDateClick,
  className,
}: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 이전 달로 이동
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // 오늘로 이동
  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  // 달력에 표시할 날짜 배열 계산
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // 특정 날짜에 이벤트가 있는지 확인
  const getEventCountForDate = (date: Date): number => {
    const eventDate = eventDates.find((ed) => isSameDay(ed.date, date));
    return eventDate?.count ?? 0;
  };

  const today = new Date();

  return (
    <div className={cn("w-full", className)}>
      {/* 헤더: 월 표시 및 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs"
          >
            오늘
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-medium py-2",
              index === 0 && "text-red-500",
              index === 6 && "text-blue-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const eventCount = getEventCountForDate(day);
          const dayOfWeek = day.getDay();

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "aspect-square p-1 flex flex-col items-center justify-center rounded-lg transition-colors",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                !isCurrentMonth && "text-muted-foreground/30",
                isCurrentMonth && dayOfWeek === 0 && "text-red-500",
                isCurrentMonth && dayOfWeek === 6 && "text-blue-500",
                isToday && "bg-blue-100 font-bold"
              )}
            >
              <span className="text-sm">{format(day, "d")}</span>

              {/* 이벤트 dot */}
              {eventCount > 0 && isCurrentMonth && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(eventCount, 3) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                      />
                    )
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
