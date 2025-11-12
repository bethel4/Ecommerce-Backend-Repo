/**
 * Base Response Type
 * Used for all API responses
 */
export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  object: T | null;
  errors: string[] | null;
}

/**
 * Paginated Response Type
 * Used for paginated list endpoints
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  object: T[];
  pageNumber: number;
  pageSize: number;
  totalSize: number;
  errors: string[] | null;
}

