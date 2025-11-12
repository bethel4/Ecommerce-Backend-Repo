import { ProductEntity } from '../entities/ProductEntity';

export abstract class ProductRepository {
  abstract create(product: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity>;
  abstract findById(id: string): Promise<ProductEntity | null>;
  abstract findAll(limit?: number, offset?: number): Promise<ProductEntity[]>;
  abstract count(): Promise<number>;
  abstract search(query: string, limit?: number, offset?: number): Promise<ProductEntity[]>;
  abstract searchCount(query: string): Promise<number>;
  abstract update(id: string, product: Partial<ProductEntity>): Promise<ProductEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findByUserId(userId: string): Promise<ProductEntity[]>;
}

