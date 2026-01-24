"use client";

// 공통 이미지 업로드 컴포넌트
// 드래그 앤 드롭 업로드, 미리보기, 순서 변경 지원
// @dnd-kit 동적 임포트로 번들 크기 최적화

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Upload, X, Loader2, AlertCircle, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// @dnd-kit을 사용하는 SortableImageGrid 동적 임포트
const SortableImageGrid = dynamic(
  () =>
    import("./sortable-image-grid").then((mod) => mod.SortableImageGrid),
  {
    ssr: false,
    loading: () => <ImageGridSkeleton />,
  }
);

// 이미지 그리드 로딩 스켈레톤
function ImageGridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}

// 간단한 이미지 그리드 (단일 이미지 또는 정렬 비활성화 시)
function SimpleImageGrid({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {images.map((src, index) => (
        <div
          key={`image-${index}`}
          className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
        >
          <Image
            src={src}
            alt={`이미지 ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 메인 ImageUpload 컴포넌트 Props
export interface ImageUploadProps {
  mode: "single" | "multiple";
  maxFiles?: number;
  maxSizeMB?: number;
  value?: string[]; // 기존 이미지 URL (서버에 저장된)
  previews?: string[]; // 로컬 프리뷰 URL (아직 업로드 안됨)
  onChange: (files: File[]) => void;
  onRemove?: (index: number, isExisting: boolean) => void;
  onReorder?: (from: number, to: number) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * 이미지 업로드 컴포넌트
 * 드래그 앤 드롭, 파일 선택, 미리보기, 순서 변경 지원
 *
 * @example
 * // 단일 이미지 업로드
 * <ImageUpload
 *   mode="single"
 *   value={currentImage ? [currentImage] : []}
 *   onChange={(files) => handleUpload(files[0])}
 *   onRemove={() => handleRemove()}
 * />
 *
 * // 다중 이미지 업로드
 * <ImageUpload
 *   mode="multiple"
 *   maxFiles={5}
 *   value={existingImages}
 *   previews={newPreviews}
 *   onChange={handleAddFiles}
 *   onRemove={handleRemove}
 *   onReorder={handleReorder}
 * />
 */
export function ImageUpload({
  mode,
  maxFiles = 5,
  maxSizeMB = 5,
  value = [],
  previews = [],
  onChange,
  onRemove,
  onReorder,
  disabled = false,
  isProcessing = false,
  error,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // 전체 이미지 목록 (기존 + 새로운)
  const allImages = [...value, ...previews];
  const totalCount = allImages.length;
  const canAddMore = mode === "single" ? totalCount === 0 : totalCount < maxFiles;

  // 단일 모드 여부
  const isSingleMode = mode === "single";

  // 정렬 기능 사용 가능 여부 (다중 모드 + 2개 이상 + reorder 핸들러 존재)
  const canReorder = !isSingleMode && totalCount > 1 && !!onReorder;

  // 파일 선택 다이얼로그 열기
  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing && canAddMore) {
      fileInputRef.current?.click();
    }
  }, [disabled, isProcessing, canAddMore]);

  // 파일 선택 핸들러
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        onChange(Array.from(files));
      }
      // input 초기화 (같은 파일 다시 선택 가능하게)
      event.target.value = "";
    },
    [onChange]
  );

  // 드래그 오버 핸들러
  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled && !isProcessing && canAddMore) {
        setIsDragOver(true);
      }
    },
    [disabled, isProcessing, canAddMore]
  );

  // 드래그 리브 핸들러
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled || isProcessing || !canAddMore) return;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        // 이미지 파일만 필터링
        const imageFiles = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (imageFiles.length > 0) {
          onChange(imageFiles);
        }
      }
    },
    [disabled, isProcessing, canAddMore, onChange]
  );

  // 이미지 삭제 핸들러
  const handleRemove = useCallback(
    (index: number) => {
      if (onRemove) {
        const isExisting = index < value.length;
        onRemove(index, isExisting);
      }
    },
    [value.length, onRemove]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* 이미지 그리드 */}
      {allImages.length > 0 && (
        canReorder ? (
          // 정렬 가능한 그리드 (동적 임포트)
          <SortableImageGrid
            images={allImages}
            onRemove={handleRemove}
            onReorder={onReorder}
            disabled={disabled}
            isSingleMode={isSingleMode}
          />
        ) : (
          // 간단한 그리드 (정적)
          <SimpleImageGrid
            images={allImages}
            onRemove={handleRemove}
          />
        )
      )}

      {/* 업로드 영역 (추가 가능할 때만 표시) */}
      {canAddMore && (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            (disabled || isProcessing) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={mode === "multiple"}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isProcessing}
          />

          <div className="flex flex-col items-center gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  이미지 처리 중...
                </p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3">
                  {allImages.length > 0 ? (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {isDragOver ? "여기에 놓으세요" : "클릭하거나 드래그하여 업로드"}
                  </span>
                  <br />
                  <span className="text-xs">
                    PNG, JPG, WebP, GIF (최대 {maxSizeMB}MB)
                  </span>
                </div>
                {mode === "multiple" && (
                  <p className="text-xs text-muted-foreground">
                    {totalCount}/{maxFiles}개 이미지
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 도움말 (다중 모드) */}
      {mode === "multiple" && allImages.length > 1 && !disabled && (
        <p className="text-xs text-muted-foreground">
          💡 이미지를 드래그하여 순서를 변경할 수 있습니다. 첫 번째 이미지가 대표 이미지로 사용됩니다.
        </p>
      )}
    </div>
  );
}
