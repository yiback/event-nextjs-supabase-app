"use client";

// 그룹 이미지 업로더 컴포넌트
// 단일 이미지 업로드 및 변경 기능

import { useState, useCallback } from "react";
import Image from "next/image";
import { Camera, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { uploadGroupImage, deleteGroupImage } from "@/app/actions/group-images";

interface GroupImageUploaderProps {
  groupId: string;
  currentImageUrl?: string | null;
  canManage: boolean;
  className?: string;
}

/**
 * 그룹 이미지 업로더 컴포넌트
 * 단일 이미지 업로드, 변경, 삭제 기능
 *
 * @example
 * <GroupImageUploader
 *   groupId={group.id}
 *   currentImageUrl={group.image_url}
 *   canManage={isAdmin}
 * />
 */
export function GroupImageUploader({
  groupId,
  currentImageUrl,
  canManage,
  className,
}: GroupImageUploaderProps) {
  // 현재 이미지 URL (서버에 저장된 이미지)
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);

  // 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  // 삭제 확인 다이얼로그
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 새 이미지 관리 훅
  const {
    files: newFiles,
    previews: newPreviews,
    isProcessing,
    error: uploadError,
    addFiles,
    reset: resetNewFiles,
  } = useImageUpload({
    maxFiles: 1,
    maxSizeMB: 5,
  });

  // 새 이미지가 있는지 확인
  const hasNewImage = newPreviews.length > 0;
  const displayImage = hasNewImage ? newPreviews[0] : imageUrl;

  // 파일 입력 핸들러
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        resetNewFiles(); // 기존 선택 초기화
        await addFiles(Array.from(files));
      }
      // 같은 파일 다시 선택 가능하게 input 초기화
      event.target.value = "";
    },
    [addFiles, resetNewFiles]
  );

  // 이미지 업로드
  const handleUpload = useCallback(async () => {
    if (newFiles.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", newFiles[0]);

      const result = await uploadGroupImage(groupId, formData);

      if (result.success && result.data) {
        setImageUrl(result.data);
        resetNewFiles();
        toast.success("그룹 이미지가 변경되었습니다");
      } else if (!result.success) {
        toast.error("업로드 실패", { description: result.error });
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      toast.error("업로드 중 오류가 발생했습니다");
    } finally {
      setIsUploading(false);
    }
  }, [groupId, newFiles, resetNewFiles]);

  // 이미지 삭제
  const handleDelete = useCallback(async () => {
    try {
      const result = await deleteGroupImage(groupId);

      if (result.success) {
        setImageUrl(null);
        setShowDeleteDialog(false);
        toast.success("그룹 이미지가 삭제되었습니다");
      } else {
        toast.error("삭제 실패", { description: result.error });
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      toast.error("삭제 중 오류가 발생했습니다");
    }
  }, [groupId]);

  // 관리 권한이 없으면 이미지만 표시
  if (!canManage) {
    return displayImage ? (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <Image
          src={displayImage}
          alt="그룹 이미지"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    ) : null;
  }

  return (
    <>
      <div className={className}>
        {/* 이미지 표시 영역 */}
        {displayImage ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
            <Image
              src={displayImage}
              alt="그룹 이미지"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* 호버 시 오버레이 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
              {/* 삭제 버튼 */}
              {!hasNewImage && (
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* 변경 버튼 */}
              <label className="absolute bottom-2 right-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading || isProcessing}
                />
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white text-sm opacity-0 group-hover:opacity-100 transition-all">
                  <Camera className="h-4 w-4" />
                  변경
                </span>
              </label>
            </div>
          </div>
        ) : (
          // 이미지 없을 때 업로드 영역
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || isProcessing}
            />
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">이미지 처리 중...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-muted p-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      클릭하여 그룹 이미지 업로드
                    </span>
                    <br />
                    PNG, JPG, WebP, GIF (최대 5MB)
                  </div>
                </div>
              )}
            </div>
          </label>
        )}

        {/* 에러 메시지 */}
        {uploadError && (
          <p className="text-sm text-destructive mt-2">{uploadError}</p>
        )}

        {/* 새 이미지 업로드 버튼 */}
        {hasNewImage && (
          <div className="flex gap-2 mt-3">
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
                "이미지 저장"
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
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>그룹 이미지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 그룹 이미지가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
