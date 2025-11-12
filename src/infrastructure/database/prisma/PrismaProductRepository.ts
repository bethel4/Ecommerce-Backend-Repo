import { Prisma } from '@prisma/client';
import { ProductFilters, ProductRepository } from '../../../domain/repositories/ProductRepository';
import { ProductEntity } from '../../../domain/entities/ProductEntity';
import { prismaClient } from './prismaClient';

export class PrismaProductRepository implements ProductRepository {
  private toEntity(product: any): ProductEntity {
    return new ProductEntity(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.category,
      product.userId,
      product.createdAt,
      product.updatedAt,
      product.imageUrl ?? null
    );
  }

  private buildFilterWhere(filters: ProductFilters): Prisma.ProductWhereInput {
    const conditions: Prisma.ProductWhereInput[] = [];

    if (filters.search) {
      conditions.push({
        name: { contains: filters.search, mode: 'insensitive' },
      });
    }

    if (filters.category) {
      conditions.push({
        category: filters.category,
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      conditions.push({
        price: {
          ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
          ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
        },
      });
    }

    if (filters.minStock !== undefined) {
      conditions.push({
        stock: { gte: filters.minStock },
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    return { AND: conditions };
  }

  async create(product: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity> {
    const created = await prismaClient.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        userId: product.userId,
        imageUrl: product.imageUrl ?? null,
      },
    });

    return this.toEntity(created);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await prismaClient.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return this.toEntity(product);
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<ProductEntity[]> {
    return this.findFiltered({}, limit, offset);
  }

  async count(): Promise<number> {
    return prismaClient.product.count();
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<ProductEntity[]> {
    return this.findFiltered({ search: query }, limit, offset);
  }

  async searchCount(query: string): Promise<number> {
    return this.countFiltered({ search: query });
  }

  async findFiltered(filters: ProductFilters, limit: number = 50, offset: number = 0): Promise<ProductEntity[]> {
    const products = await prismaClient.product.findMany({
      where: this.buildFilterWhere(filters),
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.toEntity(p));
  }

  async countFiltered(filters: ProductFilters): Promise<number> {
    return prismaClient.product.count({
      where: this.buildFilterWhere(filters),
    });
  }

  async update(id: string, product: Partial<ProductEntity>): Promise<ProductEntity> {
    const updated = await prismaClient.product.update({
      where: { id },
      data: {
        ...(product.name && { name: product.name }),
        ...(product.description !== undefined && { description: product.description }),
        ...(product.price && { price: product.price }),
        ...(product.stock !== undefined && { stock: product.stock }),
        ...(product.category !== undefined && { category: product.category }),
        ...(product.imageUrl !== undefined && { imageUrl: product.imageUrl }),
      },
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prismaClient.product.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<ProductEntity[]> {
    const products = await prismaClient.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.toEntity(p));
  }
}

