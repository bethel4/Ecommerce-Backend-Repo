import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { loadEnv } from '../config/env';
import { PrismaUserRepository } from '../database/prisma/PrismaUserRepository';
import { PrismaProductRepository } from '../database/prisma/PrismaProductRepository';
import { PrismaOrderRepository } from '../database/prisma/PrismaOrderRepository';
import { HashService } from '../services/hashService';
import { JwtService } from '../services/jwtService';
import { RedisCacheService } from '../services/redisCacheService';
import { CsrfService } from '../services/csrfService';
import { AuthController } from '../../interfaces/http/controllers/AuthController';
import { ProductController } from '../../interfaces/http/controllers/ProductController';
import { OrderController } from '../../interfaces/http/controllers/OrderController';
import { createAuthRoutes } from '../../interfaces/http/routes/authRoutes';
import { createProductRoutes } from '../../interfaces/http/routes/productRoutes';
import { createOrderRoutes } from '../../interfaces/http/routes/orderRoutes';
import { errorMiddleware } from '../../interfaces/http/middlewares/errorMiddleware';
import { cacheMiddleware } from '../../interfaces/http/middlewares/cacheMiddleware';
import { csrfMiddleware } from '../../interfaces/http/middlewares/csrfMiddleware';
import { getSwaggerDocument } from './swagger';

export function createServer(): Express {
  // Load environment variables
  loadEnv();

  const app = express();

  // Initialize services
  const hashService = new HashService();
  const jwtService = new JwtService();
  const cacheService = new RedisCacheService();
  const csrfService = new CsrfService();

  // Initialize repositories
  const userRepo = new PrismaUserRepository();
  const productRepo = new PrismaProductRepository();
  const orderRepo = new PrismaOrderRepository();

  // Initialize controllers
  const authController = new AuthController(userRepo, hashService, jwtService);
  const productController = new ProductController(productRepo, cacheService);
  const orderController = new OrderController(orderRepo, productRepo);

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // CSRF token endpoint (must be before CSRF middleware)
  app.get('/api/csrf-token', (req, res) => {
    const token = csrfService.generateToken();
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ csrfToken: token });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger/OpenAPI placeholder
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'Clean Architecture E-commerce Backend API',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    paths: {},
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Routes
  app.use('/api/auth', createAuthRoutes(authController, jwtService));
  app.use('/api/products', createProductRoutes(productController, jwtService, cacheService));
  app.use('/api/orders', csrfMiddleware(csrfService), createOrderRoutes(orderController, jwtService));

  // Error middleware (must be last)
  app.use(errorMiddleware);

  return app;
}

