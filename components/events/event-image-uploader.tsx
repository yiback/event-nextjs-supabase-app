"use client";

// 이벤트 이미지 업로더 컴포넌트
// 이미지 업로드, 삭제, 순서 변경 기능 제공

import { useState, useCallback } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/common/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useImageUpload } from "@/hooks/use-image-upload";
import {
  uploadEventImages,
  deleteEventImage,
  reorderEventImages,
} from "@/app/actions/event-images";
import type { Tables } from "@/types/supabase";

interface EventImageUploaderProps {
  eventId: string;
  groupId: string;
  existingImages: Tables<"event_images">[];
  canManage: boolean;
}

const MAX_IMAGES = 5;

/**
 * 이벤트 이미지 업로더 컴포넌트
 * 기존 이미지 표시, 새 이미지 업로드, 순서 변경, 삭제 기능
 *
 * @example
 * <EventImageUploader
 *   eventId={event.id}
 *   groupId={group.id}
 *   existingImages={eventImages}
 *   canManage={canManage}
 * />
 */
export function EventImageUploader({
  eventId,
  groupId,
  existingImages: initialImages,
  canManage,
}: EventImageUploaderProps) {
  // 기존 이미지 상태 (서버에 저장된 이미지)
  const [existingImages, setExistingImages] = useState(initialImages);

  // 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  // 삭제 확인 다이얼로그
  const [deleteTarget, setDeleteTarget] = useState<{
    index: number;
    isExisting: boolean;
    imageId?: string;
  } | null>(null);

  // 새 이미지 관리 훅
  const {
    files: newFiles,
    previews: newPreviews,
    isProcessing,
    error: uploadError,
    addFiles,
    removeFile: removeNewFile,
    reorderFiles: reorderNewFiles,
    reset: resetNewFiles,
  } = useImageUpload({
    maxFiles: MAX_IMAGES - existingImages.length,
    maxSizeMB: 5,
  });

  // 전체 이미지 개수
  const totalImages = existingImages.length + newPreviews.length;

  // 기존 이미지 URL 목록
  const existingUrls = existingImages.map((img) => img.image_url);

  // 새 이미지 추가 핸들러
  const handleAddFiles = useCallback(
    async (files: File[]) => {
      const remainingSlots = MAX_IMAGES - existingImages.length - newFiles.length;
      if (files.length > remainingSlots) {
        toast.error("이미지 개수 초과", {
          description: `최대 ${MAX_IMAGES}개까지 업로드할 수 있습니다`,
        });
        return;
      }
      await addFiles(files);
    },
    [existingImages.length, newFiles.length, addFiles]
  );

  // 이미지 삭제 핸들러
  const handleRemove = useCallback(
    (index: number, isExisting: boolean) => {
      if (isExisting) {
        // 기존 이미지 삭제 - 확인 다이얼로그 표시
        const image = existingImages[index];
        setDeleteTarget({ index, isExisting: true, imageId: image.id });
      } else {
        // 새 이미지 삭제 (아직 업로드 안됨) - 바로 삭제
        const newIndex = index - existingImages.length;
        removeNewFile(newIndex);
      }
    },
    [existingImages, removeNewFile]
  );

  // 기존 이미지 삭제 확정
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || !deleteTarget.imageId) return;

    try {
      const result = await deleteEventImage(deleteTarget.imageId);
      if (result.success) {
        setExistingImages((prev) =>
          prev.filter((_, i) => i !== deleteTarget.index)
        );
        toast.success("이미지가 삭제되었습니다");
      } else {
        toast.error("삭제 실패", { description: result.error });
      }
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
      toast.error("삭제 중 오류가 발생했습니다");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  // 이미지 순서 변경 핸들러
  const handleReorder = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const totalExisting = existingImages.length;

      // 새 이미지끼리 순서 변경
      if (fromIndex >= totalExisting && toIndex >= totalExisting) {
        const newFromIndex = fromIndex - totalExisting;
        const newToIndex = toIndex - totalExisting;
        reorderNewFiles(newFromIndex, newToIndex);
        return;
      }

      // 기존 이미지 순서 변경 (서버 업데이트 필요)
      if (fromIndex < totalExisting && toIndex < totalExisting) {
        // 로컬 상태 먼저 업데이트 (Optimistic UI)
        const newOrder = [...existingImages];
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        setExistingImages(newOrder);

        // 서버에 순서 저장
        try {
          const imageIds = newOrder.map((img) => img.id);
          const result = await reorderEventImages(eventId, imageIds);
          if (!result.success) {
            // 실패 시 롤백
            setExistingImages(existingImages);
            toast.error("순서 변경 실패", { description: result.error });
          }
        } catch (error) {
          console.error("순서 변경 오류:", error);
          setExistingImages(existingImages);
          toast.error("순서 변경 중 오류가 발생했습니다");
        }
      }
    },
    [existingImages, eventId, reorderNewFiles]
  );

  // 새 이미지 업로드
  const handleUpload = useCallback(async () => {
    if (newFiles.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await uploadEventImages(eventId, formData);

      if (result.success && result.data) {
        // 기존 이미지 목록에 추가
        setExistingImages((prev) => [...prev, ...result.data]);
        resetNewFiles();
        toast.success("이미지가 업로드되었습니다", {
          description: `${result.data.length}개의 이미지가 추가되었습니다`,
        });
      } else if (!result.success) {
        toast.error("업로드 실패", { description: result.error });
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      toast.error("업로드 중 오류가 발생했습니다");
    } finally {
      setIsUploading(false);
    }
  }, [eventId, newFiles, resetNewFiles]);

  // 관리 권한이 없으면 렌더링하지 않음
  if (!canManage) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            이미지 관리
          </CardTitle>
          <CardDescription>
            이벤트 이미지를 추가하거나 순서를 변경할 수 있습니다 ({totalImages}/{MAX_IMAGES})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            mode="multiple"
            maxFiles={MAX_IMAGES}
            maxSizeMB={5}
            value={existingUrls}
            previews={newPreviews}
            onChange={handleAddFiles}
            onRemove={handleRemove}
            onReorder={handleReorder}
            disabled={isUploading}
            isProcessing={isProcessing}
            error={uploadError}
          />

          {/* 업로드 버튼 (새 이미지가 있을 때만 표시) */}
          {newFiles.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || isProcessing}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  `${newFiles.length}개 이미지 업로드`
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetNewFiles}
                disabled={isUploading}
              >
                취소
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이미지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이미지가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
