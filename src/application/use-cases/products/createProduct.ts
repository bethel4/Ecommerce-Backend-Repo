import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  userId: string;
}

export interface CreateProductOutput {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  userId: string;
  imageUrl: string | null;
}

export async function createProduct(
  productRepo: ProductRepository,
  input: CreateProductInput
): Promise<CreateProductOutput> {
  if (input.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  if (input.stock < 0) {
    throw new Error('Stock cannot be negative');
  }

  const product = await productRepo.create({
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    category: input.category || null,
    userId: input.userId,
  });

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    userId: product.userId,
    imageUrl: product.imageUrl ?? null,
  };
}

