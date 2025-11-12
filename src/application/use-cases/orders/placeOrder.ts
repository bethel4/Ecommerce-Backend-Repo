import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { OrderItemEntity } from '../../../domain/entities/OrderItemEntity';

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
  productRepo: ProductRepository,
  input: PlaceOrderInput
): Promise<PlaceOrderOutput> {
  if (!input.items || input.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // Validate products and calculate total
  const orderItems: Omit<OrderItemEntity, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>[] = [];
  let totalPrice = 0;

  for (const item of input.items) {
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for product ${item.productId}`);
    }

    const product = await productRepo.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    const itemPrice = product.price * item.quantity;
    totalPrice += itemPrice;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  // Create order with items
  const order = await orderRepo.create({
    userId: input.userId,
    description: input.description || null,
    totalPrice,
    status: 'PENDING',
    items: orderItems as OrderItemEntity[],
  });

  // Update product stock
  for (const item of input.items) {
    const product = await productRepo.findById(item.productId);
    if (product) {
      await productRepo.update(item.productId, {
        stock: product.stock - item.quantity,
      });
    }
  }

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

