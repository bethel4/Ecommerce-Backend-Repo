import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}

export interface UpdateProductOutput {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  userId: string;
}

export async function updateProduct(
  productRepo: ProductRepository,
  input: UpdateProductInput
): Promise<UpdateProductOutput> {
  const existingProduct = await productRepo.findById(input.id);
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  if (input.price !== undefined && input.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  if (input.stock !== undefined && input.stock < 0) {
    throw new Error('Stock cannot be negative');
  }

  const product = await productRepo.update(input.id, {
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    category: input.category,
  });

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    userId: product.userId,
  };
}

