import { OrderRepository } from '../../../domain/repositories/OrderRepository';

export interface PlaceOrderItemInput {
  productId: string;
  quantity: number;
}

export interface PlaceOrderInput {
  userId: string;
  description?: string;
  items: PlaceOrderItemInput[];
}

export interface PlaceOrderOutput {
  id: string;
  userId: string;
  description: string | null;
  totalPrice: number;
  status: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export async function placeOrder(
  orderRepo: OrderRepository,
  input: PlaceOrderInput
): Promise<PlaceOrderOutput> {
  if (!input.items || input.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const order = await orderRepo.placeOrderTransactional({
    userId: input.userId,
    items: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });

  return {
    id: order.id,
    userId: order.userId,
    description: order.description,
    totalPrice: order.totalPrice,
    status: order.status,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

