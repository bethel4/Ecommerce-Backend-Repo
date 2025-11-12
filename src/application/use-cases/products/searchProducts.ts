import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface SearchProductsInput {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchProductsOutput {
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

export async function searchProducts(
  productRepo: ProductRepository,
  input: SearchProductsInput
): Promise<SearchProductsOutput> {
  if (!input.query || input.query.trim().length === 0) {
    throw new Error('Search query cannot be empty');
  }

  const limit = input.limit || 50;
  const offset = input.offset || 0;

  const products = await productRepo.search(input.query.trim(), limit, offset);

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

