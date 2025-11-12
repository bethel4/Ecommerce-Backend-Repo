import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/AuthController';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import { authMiddleware, AuthRequest } from '../middlewares/authMiddleware';
import { JwtService } from '../../../infrastructure/services/jwtService';

const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(
        /^[a-zA-Z0-9]+$/,
        'Username must be alphanumeric only (letters and numbers, no special characters or spaces)'
      ),
    email: z.string().email('Must be a valid email address format (e.g., user@example.com)'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Password must include at least one number (0-9)')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must include at least one special character (e.g., !@#$%^&*)'),
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

