import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface GetProductInput {
  id: string;
}

export interface GetProductOutput {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  userId: string;
}

export async function getProduct(
  productRepo: ProductRepository,
  input: GetProductInput
): Promise<GetProductOutput> {
  const product = await productRepo.findById(input.id);
  if (!product) {
    throw new Error('Product not found');
  }

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

