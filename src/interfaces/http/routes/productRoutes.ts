import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from '../controllers/ProductController';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';
import { RedisCacheService } from '../../../infrastructure/services/redisCacheService';
import { JwtService } from '../../../infrastructure/services/jwtService';
import multer from 'multer';
import path from 'path';

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must not exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    price: z.number().positive('Price must be a positive number greater than 0'),
    stock: z.number().int('Stock must be an integer').nonnegative('Stock must be a non-negative integer (0 or more)'),
    category: z.string().optional(),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    category: z.string().optional(),
  }),
});

const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

export function createProductRoutes(
  productController: ProductController,
  jwtService: JwtService,
  cacheService: RedisCacheService
) {
  const router = Router();

  // Public routes
  router.get(
    '/',
    cacheMiddleware(cacheService, 300),
    productController.list.bind(productController)
  );
  router.get('/search', productController.search.bind(productController));
  router.get(
    '/:id',
    validateMiddleware(getProductSchema),
    cacheMiddleware(cacheService, 300),
    productController.get.bind(productController)
  );

  // Protected routes - Admin only
  router.post(
    '/',
    authMiddleware(jwtService),
    roleMiddleware(['ADMIN']),
    validateMiddleware(createProductSchema),
    productController.create.bind(productController)
  );

  router.put(
    '/:id',
    authMiddleware(jwtService),
    roleMiddleware(['ADMIN']),
    validateMiddleware(updateProductSchema),
    productController.update.bind(productController)
  );

  // Image upload (Admin only)
  router.post(
    '/:id/image',
    authMiddleware(jwtService),
    roleMiddleware(['ADMIN']),
    upload.single('image'),
    productController.uploadImage.bind(productController)
  );

  router.delete(
    '/:id',
    authMiddleware(jwtService),
    roleMiddleware(['ADMIN']),
    validateMiddleware(deleteProductSchema),
    productController.delete.bind(productController)
  );

  return router;
}

