import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/AuthController';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import { authMiddleware, AuthRequest } from '../middlewares/authMiddleware';
import { JwtService } from '../../../infrastructure/services/jwtService';

const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export function createAuthRoutes(authController: AuthController, jwtService: JwtService) {
  const router = Router();

  router.post(
    '/register',
    validateMiddleware(registerSchema),
    authController.register.bind(authController)
  );

  router.post(
    '/login',
    validateMiddleware(loginSchema),
    authController.login.bind(authController)
  );

  router.post('/refresh', authController.refresh.bind(authController));

  router.post('/logout', authController.logout.bind(authController));

  router.get('/me', authMiddleware(jwtService), authController.me.bind(authController));

  return router;
}

