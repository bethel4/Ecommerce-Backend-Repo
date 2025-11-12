import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../../infrastructure/services/jwtService';
import { sendError } from '../utils/responseHelper';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: string;
  };
}

export function authMiddleware(jwtService: JwtService) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'No token provided', null, 401);
      }

      const token = authHeader.substring(7);
      const payload = jwtService.verifyAccessToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
        roleId: payload.roleId,
      };

      next();
    } catch (error) {
      return sendError(res, 'Invalid or expired token', null, 401);
    }
  };
}

