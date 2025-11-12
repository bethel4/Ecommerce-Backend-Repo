import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { ProductEntity } from '../../../domain/entities/ProductEntity';
import { prismaClient } from './prismaClient';

export class PrismaProductRepository implements ProductRepository {
  async create(product: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity> {
    const created = await prismaClient.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        userId: product.userId,
      },
    });

    return new ProductEntity(
      created.id,
      created.name,
      created.description,
      created.price,
      created.stock,
      created.category,
      created.userId,
      created.createdAt,
      created.updatedAt
    );
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await prismaClient.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return new ProductEntity(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.category,
      product.userId,
      product.createdAt,
      product.updatedAt
    );
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<ProductEntity[]> {
    const products = await prismaClient.product.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map(
      (p) =>
        new ProductEntity(
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.category,
          p.userId,
          p.createdAt,
          p.updatedAt
        )
    );
  }

  async count(): Promise<number> {
    return prismaClient.product.count();
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<ProductEntity[]> {
    const products = await prismaClient.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map(
      (p) =>
        new ProductEntity(
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.category,
          p.userId,
          p.createdAt,
          p.updatedAt
        )
    );
  }

  async searchCount(query: string): Promise<number> {
    return prismaClient.product.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
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
      },
    });

    return new ProductEntity(
      updated.id,
      updated.name,
      updated.description,
      updated.price,
      updated.stock,
      updated.category,
      updated.userId,
      updated.createdAt,
      updated.updatedAt
    );
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

    return products.map(
      (p) =>
        new ProductEntity(
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.category,
          p.userId,
          p.createdAt,
          p.updatedAt
        )
    );
  }
}

