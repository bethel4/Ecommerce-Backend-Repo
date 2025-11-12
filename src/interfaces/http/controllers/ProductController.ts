import { Request, Response } from 'express';
import { ProductFilters, ProductRepository } from '../../../domain/repositories/ProductRepository';
import { createProduct } from '../../../application/use-cases/products/createProduct';
import { updateProduct } from '../../../application/use-cases/products/updateProduct';
import { listProducts } from '../../../application/use-cases/products/listProducts';
import { searchProducts } from '../../../application/use-cases/products/searchProducts';
import { getProduct } from '../../../application/use-cases/products/getProduct';
import { deleteProduct } from '../../../application/use-cases/products/deleteProduct';
import { AuthRequest } from '../middlewares/authMiddleware';
import { RedisCacheService } from '../../../infrastructure/services/redisCacheService';
import { sendSuccess, sendError } from '../utils/responseHelper';

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

  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'Image file is required');
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      const updated = await this.productRepo.update(req.params.id, { imageUrl } as any);
      sendSuccess(
        res,
        {
          id: updated.id,
          imageUrl: updated.imageUrl ?? imageUrl,
        },
        'Image uploaded successfully'
      );
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  private async respondWithProductList(res: Response, filters: ProductFilters, currentPage: number, pageSize: number) {
    const safePage = Math.max(currentPage, 1);
    const safePageSize = Math.max(pageSize, 1);
    const offset = (safePage - 1) * safePageSize;

    const [products, totalProducts] = await Promise.all([
      this.productRepo.findFiltered(filters, safePageSize, offset),
      this.productRepo.countFiltered(filters),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalProducts / safePageSize));

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      imageUrl: p.imageUrl ?? null,
    }));

    res.status(200).json({
      currentPage: safePage,
      pageSize: safePageSize,
      totalPages,
      totalProducts,
      products: items,
    });
  }

  async list(req: Request, res: Response) {
    try {
      const currentPage = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

      const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
      const minStock = req.query.minStock !== undefined ? Number(req.query.minStock) : undefined;

      if (Number.isNaN(currentPage) || Number.isNaN(pageSize)) {
        return sendError(res, 'Invalid pagination parameters');
      }
      if (
        (minPrice !== undefined && Number.isNaN(minPrice)) ||
        (maxPrice !== undefined && Number.isNaN(maxPrice)) ||
        (minStock !== undefined && Number.isNaN(minStock))
      ) {
        return sendError(res, 'Invalid numeric filter parameter');
      }
      if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        return sendError(res, 'minPrice cannot be greater than maxPrice');
      }
      if (minStock !== undefined && minStock < 0) {
        return sendError(res, 'minStock must be non-negative');
      }

      const filters: ProductFilters = {
        search: req.query.search ? String(req.query.search) : undefined,
        category: req.query.category ? String(req.query.category) : undefined,
        minPrice,
        maxPrice,
        minStock,
      };

      await this.respondWithProductList(res, filters, currentPage, pageSize);
    } catch (error: any) {
      sendError(res, error.message, null, 500);
    }
  }

  async search(req: Request, res: Response) {
    try {
      const qRaw = req.query.q ? String(req.query.q) : '';
      const currentPage = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

      if (Number.isNaN(currentPage) || Number.isNaN(pageSize)) {
        return sendError(res, 'Invalid pagination parameters');
      }

      const filters: ProductFilters = {};
      if (qRaw.trim().length > 0) {
        filters.search = qRaw.trim();
      }

      await this.respondWithProductList(res, filters, currentPage, pageSize);
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

