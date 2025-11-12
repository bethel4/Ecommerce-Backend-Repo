import { Request, Response, NextFunction } from 'express';
import { RedisCacheService } from '../../../infrastructure/services/redisCacheService';

export function cacheMiddleware(cacheService: RedisCacheService, ttlSeconds: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json to cache the response
      res.json = function (body: any) {
        cacheService.set(cacheKey, body, ttlSeconds).catch(console.error);
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

