"use client";

// 이미지 업로드 상태 관리 훅
// 파일 추가/삭제/순서 변경 및 미리보기 URL 관리

import { useState, useCallback, useEffect } from "react";
import {
  resizeImage,
  createImagePreview,
  revokePreviewUrl,
  validateImageFile,
  type ImageValidationOptions,
} from "@/lib/utils/image-resize";

interface UseImageUploadOptions extends ImageValidationOptions {
  maxFiles?: number; // 최대 파일 수
  autoResize?: boolean; // 자동 리사이징 여부
  maxWidth?: number; // 리사이징 최대 너비
  quality?: number; // 리사이징 품질
}

interface UseImageUploadReturn {
  files: File[]; // 업로드할 파일 목록
  previews: string[]; // 미리보기 URL 목록
  isProcessing: boolean; // 리사이징 처리 중 여부
  error: string | null; // 에러 메시지
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeFile: (index: number) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
}

/**
 * 이미지 업로드 상태를 관리하는 훅
 *
 * @param options - 업로드 옵션
 * @returns 이미지 업로드 상태 및 핸들러
 *
 * @example
 * const {
 *   files,
 *   previews,
 *   isProcessing,
 *   addFiles,
 *   removeFile,
 *   reorderFiles,
 *   reset,
 * } = useImageUpload({ maxFiles: 5, maxSizeMB: 5 });
 */
export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const {
    maxFiles = 5,
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    autoResize = true,
    maxWidth = 1200,
    quality = 0.85,
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      previews.forEach(revokePreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 파일 추가
  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // 최대 파일 수 확인
      if (files.length + fileArray.length > maxFiles) {
        setError(`이미지는 최대 ${maxFiles}개까지 업로드할 수 있습니다`);
        return;
      }

      setError(null);
      setIsProcessing(true);

      try {
        const processedFiles: File[] = [];
        const newPreviews: string[] = [];

        for (const file of fileArray) {
          // 유효성 검사
          const validation = validateImageFile(file, { maxSizeMB, allowedTypes });
          if (!validation.valid) {
            setError(validation.error || "유효하지 않은 파일입니다");
            continue;
          }

          // 리사이징 (옵션에 따라)
          let processedFile: File;
          if (autoResize) {
            try {
              processedFile = await resizeImage(file, maxWidth, quality);
            } catch {
              // 리사이징 실패 시 원본 사용
              processedFile = file;
            }
          } else {
            processedFile = file;
          }

          // 미리보기 URL 생성
          const previewUrl = await createImagePreview(processedFile);

          processedFiles.push(processedFile);
          newPreviews.push(previewUrl);
        }

        if (processedFiles.length > 0) {
          setFiles((prev) => [...prev, ...processedFiles]);
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      } catch (err) {
        console.error("이미지 처리 오류:", err);
        setError("이미지 처리 중 오류가 발생했습니다");
      } finally {
        setIsProcessing(false);
      }
    },
    [files.length, maxFiles, maxSizeMB, allowedTypes, autoResize, maxWidth, quality]
  );

  // 파일 제거
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const urlToRevoke = prev[index];
      if (urlToRevoke) {
        revokePreviewUrl(urlToRevoke);
      }
      return prev.filter((_, i) => i !== index);
    });
    setError(null);
  }, []);

  // 파일 순서 변경
  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });

    setPreviews((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  // 초기화
  const reset = useCallback(() => {
    previews.forEach(revokePreviewUrl);
    setFiles([]);
    setPreviews([]);
    setError(null);
  }, [previews]);

  return {
    files,
    previews,
    isProcessing,
    error,
    addFiles,
    removeFile,
    reorderFiles,
    reset,
  };
}
