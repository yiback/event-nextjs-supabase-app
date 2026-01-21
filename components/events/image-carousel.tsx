"use client";

// 이벤트 이미지 캐러셀 컴포넌트
// embla-carousel를 사용한 이미지 슬라이더

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageCarousel({
  images,
  alt = "이벤트 이미지",
  className,
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
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

  // 이미지가 없을 경우 placeholder 표시
  if (images.length === 0) {
    return (
      <div
        className={cn(
          "aspect-video bg-muted rounded-lg flex flex-col items-center justify-center",
          className
        )}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">이미지 없음</p>
      </div>
    );
  }

  // 이미지가 1개인 경우 캐러셀 없이 단일 이미지 표시
  if (images.length === 1) {
    return (
      <div className={cn("relative aspect-video rounded-lg overflow-hidden", className)}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* 캐러셀 컨테이너 */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="relative aspect-video">
                <Image
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
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
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white h-8 w-8"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white h-8 w-8"
          onClick={scrollNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 도트 네비게이션 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === selectedIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/70"
            )}
            onClick={() => scrollTo(index)}
            aria-label={`이미지 ${index + 1}로 이동`}
          />
        ))}
      </div>

      {/* 이미지 카운터 */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
}
