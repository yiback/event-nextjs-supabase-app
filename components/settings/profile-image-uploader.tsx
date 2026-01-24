"use client";

// 프로필 이미지 업로더 컴포넌트
// 원형 아바타 형태의 이미지 업로드

import { useState, useCallback } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  uploadProfileImage,
  deleteProfileImage,
} from "@/app/actions/profile-images";

interface ProfileImageUploaderProps {
  currentAvatarUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * 프로필 이미지 업로더 컴포넌트
 * 원형 아바타, 클릭하여 변경, 삭제 버튼 제공
 *
 * @example
 * <ProfileImageUploader
 *   currentAvatarUrl={profile?.avatar_url}
 *   userName={profile?.full_name}
 *   userEmail={user?.email}
 * />
 */
export function ProfileImageUploader({
  currentAvatarUrl,
  userName,
  userEmail,
}: ProfileImageUploaderProps) {
  // 현재 아바타 URL
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentAvatarUrl || null
  );

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
    maxSizeMB: 2, // 프로필은 2MB로 제한
  });

  // 표시할 이미지
  const hasNewImage = newPreviews.length > 0;
  const displayImage = hasNewImage ? newPreviews[0] : avatarUrl;

  // 아바타 폴백 텍스트
  const fallbackText =
    userName?.charAt(0) || userEmail?.charAt(0)?.toUpperCase() || "U";

  // Supabase Storage 이미지인지 확인 (삭제 가능 여부)
  const isCustomAvatar = avatarUrl?.includes("supabase.co/storage") || false;

  // 파일 입력 핸들러
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        resetNewFiles();
        await addFiles(Array.from(files));
      }
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

      const result = await uploadProfileImage(formData);

      if (result.success && result.data) {
        setAvatarUrl(result.data);
        resetNewFiles();
        toast.success("프로필 이미지가 변경되었습니다");
      } else if (!result.success) {
        toast.error("업로드 실패", { description: result.error });
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      toast.error("업로드 중 오류가 발생했습니다");
    } finally {
      setIsUploading(false);
    }
  }, [newFiles, resetNewFiles]);

  // 이미지 삭제
  const handleDelete = useCallback(async () => {
    try {
      const result = await deleteProfileImage();

      if (result.success) {
        setAvatarUrl(null);
        setShowDeleteDialog(false);
        toast.success("프로필 이미지가 삭제되었습니다");
      } else {
        toast.error("삭제 실패", { description: result.error });
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      toast.error("삭제 중 오류가 발생했습니다");
    }
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* 아바타 이미지 */}
        <div className="relative group">
          <Avatar className="h-24 w-24 ring-4 ring-background">
            <AvatarImage src={displayImage || undefined} alt={userName || "프로필"} />
            <AvatarFallback className="text-2xl">{fallbackText}</AvatarFallback>
          </Avatar>

          {/* 변경 버튼 (호버 시 표시) */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || isProcessing}
            />
            {isProcessing ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </label>
        </div>

        {/* 에러 메시지 */}
        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-2">
          {hasNewImage ? (
            // 새 이미지 선택됨 - 저장/취소 버튼
            <>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading || isProcessing}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetNewFiles}
                disabled={isUploading}
              >
                취소
              </Button>
            </>
          ) : (
            // 기존 상태 - 변경/삭제 버튼
            <>
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading || isProcessing}
                />
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  disabled={isUploading || isProcessing}
                >
                  <span className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    사진 변경
                  </span>
                </Button>
              </label>
              {isCustomAvatar && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isUploading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* 도움말 */}
        <p className="text-xs text-muted-foreground text-center">
          클릭하여 프로필 사진을 변경하세요<br />
          PNG, JPG, WebP, GIF (최대 2MB)
        </p>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로필 사진을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제하면 기본 아바타로 표시됩니다.
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
