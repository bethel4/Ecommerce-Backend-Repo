import { Response } from 'express';
import { BaseResponse, PaginatedResponse } from '../types/responseTypes';

/**
 * Send a successful base response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  const response: BaseResponse<T> = {
    success: true,
    message,
    object: data,
    errors: null,
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  message: string,
  errors: string[] | null = null,
  statusCode: number = 400
): void {
  const response: BaseResponse = {
    success: false,
    message,
    object: null,
    errors: errors || [message],
  };
  res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pageNumber: number,
  pageSize: number,
  totalSize: number,
  message: string = 'Success'
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    object: data,
    pageNumber,
    pageSize,
    totalSize,
    errors: null,
  };
  res.status(200).json(response);
}

