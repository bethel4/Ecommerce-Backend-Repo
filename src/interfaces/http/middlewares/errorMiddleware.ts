import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal server error';

  sendError(res, message, null, statusCode);
}

