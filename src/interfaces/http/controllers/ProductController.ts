import { Request, Response } from 'express';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { createProduct } from '../../../application/use-cases/products/createProduct';
import { updateProduct } from '../../../application/use-cases/products/updateProduct';
import { listProducts } from '../../../application/use-cases/products/listProducts';
import { searchProducts } from '../../../application/use-cases/products/searchProducts';
import { getProduct } from '../../../application/use-cases/products/getProduct';
import { deleteProduct } from '../../../application/use-cases/products/deleteProduct';
import { AuthRequest } from '../middlewares/authMiddleware';
import { RedisCacheService } from '../../../infrastructure/services/redisCacheService';
import { sendSuccess, sendError, sendPaginated } from '../utils/responseHelper';

export class ProductController {
  constructor(
    private productRepo: ProductRepository,
    private cacheService: RedisCacheService
  ) {}

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', null, 401);
      }

      const result = await createProduct(this.productRepo, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        userId: req.user.userId,
      });

      // Invalidate cache
      await this.cacheService.del('cache:/api/products');

      sendSuccess(res, result, 'Product created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await updateProduct(this.productRepo, {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
      });

      // Invalidate cache
      await this.cacheService.del('cache:/api/products');
      await this.cacheService.del(`cache:/api/products/${req.params.id}`);

      sendSuccess(res, result, 'Product updated successfully');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 50;
      const offset = (pageNumber - 1) * pageSize;

      const [products, totalSize] = await Promise.all([
        this.productRepo.findAll(pageSize, offset),
        this.productRepo.count(),
      ]);

      const productData = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        userId: p.userId,
      }));

      sendPaginated(res, productData, pageNumber, pageSize, totalSize, 'Products retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message, null, 500);
    }
  }

  async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return sendError(res, 'Search query is required');
      }

      const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 50;
      const offset = (pageNumber - 1) * pageSize;

      const [products, totalSize] = await Promise.all([
        this.productRepo.search(query, pageSize, offset),
        this.productRepo.searchCount(query),
      ]);

      const productData = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        userId: p.userId,
      }));

      sendPaginated(res, productData, pageNumber, pageSize, totalSize, 'Search completed successfully');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  async get(req: Request, res: Response) {
    try {
      const result = await getProduct(this.productRepo, {
        id: req.params.id,
      });

      sendSuccess(res, result, 'Product retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message, null, 404);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await deleteProduct(this.productRepo, {
        id: req.params.id,
      });

      // Invalidate cache
      await this.cacheService.del('cache:/api/products');
      await this.cacheService.del(`cache:/api/products/${req.params.id}`);

      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error: any) {
      sendError(res, error.message);
    }
  }
}

