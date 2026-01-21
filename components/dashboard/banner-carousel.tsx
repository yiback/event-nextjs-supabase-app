"use client";

// 배너 캐러셀 컴포넌트
// embla-carousel를 사용한 자동 슬라이드 배너

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const bannerData = [
  {
    id: 1,
    title: "모임 이벤트를 쉽게 관리하세요",
    description: "참석 응답부터 공지까지 한 번에",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "실시간 알림으로 놓치지 마세요",
    description: "중요한 이벤트와 공지를 즉시 확인",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "간편한 참석 관리",
    description: "클릭 한 번으로 참석 의사 표현",
    gradient: "from-orange-500 to-red-500",
  },
];

export function BannerCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 이전 슬라이드로 이동
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // 다음 슬라이드로 이동
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // 특정 슬라이드로 이동
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // 현재 슬라이드 인덱스 업데이트
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* 캐러셀 컨테이너 */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {bannerData.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0"
            >
              <div
                className={cn(
                  "h-40 md:h-56 flex flex-col items-center justify-center text-white p-6",
                  "bg-gradient-to-r",
                  banner.gradient
                )}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                  {banner.title}
                </h2>
                <p className="text-sm md:text-base text-center opacity-90">
                  {banner.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 좌우 화살표 버튼 (데스크톱에서만 표시) */}
      <div className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
          onClick={scrollNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* 도트 네비게이션 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerData.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === selectedIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/70"
            )}
            onClick={() => scrollTo(index)}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
