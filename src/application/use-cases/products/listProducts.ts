import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface ListProductsInput {
  limit?: number;
  offset?: number;
}

export interface ListProductsOutput {
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category: string | null;
    userId: string;
  }>;
}

export async function listProducts(
  productRepo: ProductRepository,
  input: ListProductsInput = {}
): Promise<ListProductsOutput> {
  const limit = input.limit || 50;
  const offset = input.offset || 0;

  const products = await productRepo.findAll(limit, offset);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      userId: p.userId,
    })),
  };
}

