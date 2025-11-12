import { Request, Response } from 'express';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { HashService } from '../../../infrastructure/services/hashService';
import { JwtService } from '../../../infrastructure/services/jwtService';
import { registerUser } from '../../../application/use-cases/auth/registerUser';
import { loginUser } from '../../../application/use-cases/auth/loginUser';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError } from '../utils/responseHelper';

export class AuthController {
  constructor(
    private userRepo: UserRepository,
    private hashService: HashService,
    private jwtService: JwtService
  ) {}

  async register(req: Request, res: Response) {
    try {
      const result = await registerUser(this.userRepo, this.hashService, {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await loginUser(this.userRepo, this.hashService, this.jwtService, {
        email: req.body.email,
        password: req.body.password,
      });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Login successful'
      );
    } catch (error: any) {
      sendError(res, error.message, null, 401);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'Refresh token not provided', null, 401);
      }

      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      const newAccessToken = this.jwtService.signAccessToken({
        userId: payload.userId,
        email: payload.email,
        roleId: payload.roleId,
      });

      sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
    } catch (error: any) {
      sendError(res, error.message, null, 401);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logout successful');
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', null, 401);
      }

      const user = await this.userRepo.findById(req.user.userId);
      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      sendSuccess(
        res,
        {
          id: user.id,
          username: user.username,
          email: user.email,
          roleId: user.roleId,
        },
        'User retrieved successfully'
      );
    } catch (error: any) {
      sendError(res, error.message, null, 500);
    }
  }
}

