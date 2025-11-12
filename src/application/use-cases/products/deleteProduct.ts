import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface DeleteProductInput {
  id: string;
}

export async function deleteProduct(
  productRepo: ProductRepository,
  input: DeleteProductInput
): Promise<void> {
  const product = await productRepo.findById(input.id);
  if (!product) {
    throw new Error('Product not found');
  }

  await productRepo.delete(input.id);
}

