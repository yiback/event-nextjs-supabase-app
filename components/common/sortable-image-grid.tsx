"use client";

// 정렬 가능한 이미지 그리드 컴포넌트
// @dnd-kit을 사용한 드래그 앤 드롭 정렬 기능
// 동적 임포트용으로 분리됨

import Image from "next/image";
import { GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// 정렬 가능한 이미지 아이템 컴포넌트
interface SortableImageItemProps {
  id: string;
  src: string;
  index: number;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

function SortableImageItem({
  id,
  src,
  index,
  onRemove,
  disabled,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden bg-muted group",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      {/* 이미지 */}
      <Image
        src={src}
        alt={`이미지 ${index + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 20vw"
      />

      {/* 오버레이 (호버 시 표시) */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
        {/* 드래그 핸들 */}
        {!disabled && (
          <button
            type="button"
            className="absolute top-2 left-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* 삭제 버튼 */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>

        {/* 순서 번호 */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {index + 1}
        </div>
      </div>
    </div>
  );
}

// SortableImageGrid Props
export interface SortableImageGridProps {
  images: string[];
  onRemove: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  disabled?: boolean;
  isSingleMode?: boolean;
}

/**
 * 정렬 가능한 이미지 그리드 컴포넌트
 * @dnd-kit을 사용하여 드래그 앤 드롭 정렬 지원
 */
export function SortableImageGrid({
  images,
  onRemove,
  onReorder,
  disabled = false,
  isSingleMode = false,
}: SortableImageGridProps) {
  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 앤 드롭 순서 변경 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((_, i) => `image-${i}`)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((src, index) => (
            <SortableImageItem
              key={`image-${index}`}
              id={`image-${index}`}
              src={src}
              index={index}
              onRemove={onRemove}
              disabled={disabled || isSingleMode}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
