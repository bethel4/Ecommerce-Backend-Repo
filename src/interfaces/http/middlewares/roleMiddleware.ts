import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { prismaClient } from '../../../infrastructure/database/prisma/prismaClient';
import { sendError } from '../utils/responseHelper';

export function roleMiddleware(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', null, 401);
      }

      const user = await prismaClient.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      });

      if (!user || !allowedRoles.includes(user.role.name)) {
        return sendError(res, 'Forbidden: Insufficient permissions', null, 403);
      }

      next();
    } catch (error) {
      return sendError(res, 'Internal server error', null, 500);
    }
  };
}

