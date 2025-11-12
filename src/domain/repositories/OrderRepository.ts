import { OrderEntity } from '../entities/OrderEntity';

export abstract class OrderRepository {
  abstract create(order: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity>;
  abstract findById(id: string): Promise<OrderEntity | null>;
  abstract findByUserId(userId: string): Promise<OrderEntity[]>;
  abstract update(id: string, order: Partial<OrderEntity>): Promise<OrderEntity>;
  // Place order atomically with stock checks and updates
  abstract placeOrderTransactional(input: {
    userId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<OrderEntity>;
}

