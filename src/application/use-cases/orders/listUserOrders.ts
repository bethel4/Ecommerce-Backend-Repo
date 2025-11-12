import { OrderRepository } from '../../../domain/repositories/OrderRepository';

export interface ListUserOrdersInput {
  userId: string;
}

export interface ListUserOrdersOutput {
  orders: Array<{
    id: string;
    userId: string;
    totalPrice: number;
    status: string;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    createdAt: Date;
  }>;
}

export async function listUserOrders(
  orderRepo: OrderRepository,
  input: ListUserOrdersInput
): Promise<ListUserOrdersOutput> {
  const orders = await orderRepo.findByUserId(input.userId);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      totalPrice: order.totalPrice,
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      createdAt: order.createdAt,
    })),
  };
}

