// API 응답 및 요청 관련 타입 정의

/**
 * API 응답 기본 타입
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

/**
 * API 에러 타입
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  error: ApiError | null;
  success: boolean;
}

/**
 * 페이지네이션 메타데이터
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 정렬 파라미터
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 검색 파라미터 기본 타입
 */
export interface SearchParams extends PaginationParams, SortParams {
  query?: string;
}

// ============================================
// 액션 응답 타입 (Server Actions용)
// ============================================

/**
 * Server Action 기본 응답
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 폼 상태 타입 (useFormState용)
 */
export interface FormState {
  message: string | null;
  errors: Record<string, string[]>;
  success: boolean;
}

/**
 * 초기 폼 상태
 */
export const initialFormState: FormState = {
  message: null,
  errors: {},
  success: false,
};
