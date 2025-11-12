import { Request, Response, NextFunction } from 'express';
import { CsrfService } from '../../../infrastructure/services/csrfService';

export function csrfMiddleware(csrfService: CsrfService) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const token = req.headers['x-csrf-token'] as string;
    const cookieToken = req.cookies['csrf-token'];

    if (!token || !cookieToken) {
      return res.status(403).json({ error: 'CSRF token missing' });
    }

    if (!csrfService.verifyToken(token, cookieToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  };
}

