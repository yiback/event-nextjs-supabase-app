// 클라이언트 측 이미지 리사이징 유틸리티
// Canvas API를 사용하여 브라우저에서 이미지를 리사이징합니다

/**
 * 이미지를 지정된 최대 너비로 리사이징합니다
 * 비율을 유지하면서 JPEG 형식으로 변환합니다
 *
 * @param file - 원본 이미지 파일
 * @param maxWidth - 최대 너비 (기본값: 1200px)
 * @param quality - JPEG 품질 (0-1, 기본값: 0.85)
 * @returns 리사이징된 이미지 File 객체
 *
 * @example
 * const resizedFile = await resizeImage(originalFile);
 * // 또는 커스텀 설정
 * const resizedFile = await resizeImage(originalFile, 800, 0.9);
 */
export async function resizeImage(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 이미지가 아닌 파일은 그대로 반환
    if (!file.type.startsWith("image/")) {
      reject(new Error("이미지 파일이 아닙니다"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // 이미지가 maxWidth보다 작으면 원본 그대로 반환
        if (img.width <= maxWidth) {
          resolve(file);
          return;
        }

        // 새 크기 계산 (비율 유지)
        const ratio = maxWidth / img.width;
        const newWidth = maxWidth;
        const newHeight = Math.round(img.height * ratio);

        // Canvas에 그리기
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context를 생성할 수 없습니다"));
          return;
        }

        // 고품질 리사이징 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Canvas를 Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("이미지 변환에 실패했습니다"));
              return;
            }

            // 새 File 객체 생성
            // 원본 파일명에서 확장자를 jpeg로 변경
            const newFileName = file.name.replace(/\.[^/.]+$/, ".jpg");
            const resizedFile = new File([blob], newFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("이미지 로드에 실패했습니다"));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("파일 읽기에 실패했습니다"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일의 미리보기 URL을 생성합니다
 * 사용 후 반드시 revokePreviewUrl을 호출하여 메모리를 해제해야 합니다
 *
 * @param file - 이미지 파일
 * @returns 미리보기 URL (blob URL)
 *
 * @example
 * const previewUrl = await createImagePreview(file);
 * // 컴포넌트에서 사용
 * <img src={previewUrl} alt="미리보기" />
 * // 사용 후 정리
 * revokePreviewUrl(previewUrl);
 */
export async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("이미지 파일이 아닙니다"));
      return;
    }

    // Blob URL 생성 (FileReader보다 빠름)
    const url = URL.createObjectURL(file);
    resolve(url);
  });
}

/**
 * 미리보기 URL의 메모리를 해제합니다
 * createImagePreview로 생성한 URL은 반드시 이 함수로 정리해야 합니다
 *
 * @param url - 해제할 미리보기 URL
 *
 * @example
 * // 컴포넌트 언마운트 시 또는 이미지 제거 시
 * revokePreviewUrl(previewUrl);
 */
export function revokePreviewUrl(url: string): void {
  // blob: URL만 해제 (외부 URL은 무시)
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환합니다
 *
 * @param bytes - 바이트 크기
 * @returns 포맷된 문자열 (예: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 이미지 파일 유효성 검사
 *
 * @param file - 검사할 파일
 * @param options - 검사 옵션
 * @returns 유효성 검사 결과
 */
export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): ImageValidationResult {
  const { maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] } =
    options;

  // 파일 타입 검사
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `지원하지 않는 이미지 형식입니다. ${allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}만 가능합니다.`,
    };
  }

  // 파일 크기 검사
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `이미지 크기는 ${maxSizeMB}MB 이하여야 합니다. (현재: ${formatFileSize(file.size)})`,
    };
  }

  return { valid: true };
}
