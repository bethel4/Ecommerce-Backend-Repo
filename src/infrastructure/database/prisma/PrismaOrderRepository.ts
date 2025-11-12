import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { OrderEntity } from '../../../domain/entities/OrderEntity';
import { OrderItemEntity } from '../../../domain/entities/OrderItemEntity';
import { prismaClient } from './prismaClient';

export class PrismaOrderRepository implements OrderRepository {
  async create(order: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity> {
  const created = await prismaClient.order.create({
    data: {
      userId: order.userId,
      description: order.description,
      totalPrice: order.totalPrice,
      status: order.status,
      items: {
        create: order.items.map((item: OrderItemEntity) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const items = created.items.map(
    (item) =>
      new OrderItemEntity(
        item.id,
        item.orderId,
        item.productId,
        item.quantity,
        item.unitPrice,
        item.createdAt,
        item.updatedAt
      )
  );

  return new OrderEntity(
    created.id,
    created.userId,
    created.description,
    created.totalPrice,
    created.status,
    items,
    created.createdAt,
    created.updatedAt
  );
}


  async findById(id: string): Promise<OrderEntity | null> {
    const order = await prismaClient.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) return null;

    const items = order.items.map(
      (item) =>
        new OrderItemEntity(
          item.id,
          item.orderId,
          item.productId,
          item.quantity,
          item.unitPrice,
          item.createdAt,
          item.updatedAt
        )
    );

    return new OrderEntity(
      order.id,
      order.userId,
      order.description,
      order.totalPrice,
      order.status,
      items,
      order.createdAt,
      order.updatedAt
    );
  }

  async placeOrderTransactional(input: {
    userId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<OrderEntity> {
    const result = await prismaClient.$transaction(async (tx) => {
      // Fetch products
      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      // Validate and compute totals
      let totalPrice = 0;
      const orderItemsData: { productId: string; quantity: number; unitPrice: number }[] = [];

      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for product ${product.name}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        totalPrice += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      // Create order with items
      const createdOrder = await tx.order.create({
        data: {
          userId: input.userId,
          totalPrice,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Update stock
      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId)!;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });
      }

      return createdOrder;
    });

    const items = result.items.map(
      (i) =>
        new OrderItemEntity(i.id, i.orderId, i.productId, i.quantity, i.unitPrice, i.createdAt, i.updatedAt)
    );

    return new OrderEntity(
      result.id,
      result.userId,
      result.description ?? null,
      result.totalPrice,
      result.status,
      items,
      result.createdAt,
      result.updatedAt
    );
  }
  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await prismaClient.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
      const items = order.items.map(
        (item) =>
          new OrderItemEntity(
            item.id,
            item.orderId,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.createdAt,
            item.updatedAt
          )
      );

      return new OrderEntity(
        order.id,
        order.userId,
        order.description,
        order.totalPrice,
        order.status,
        items,
        order.createdAt,
        order.updatedAt
      );
    });
  }

  async update(id: string, order: Partial<OrderEntity>): Promise<OrderEntity> {
    const updated = await prismaClient.order.update({
      where: { id },
      data: {
        ...(order.description !== undefined && { description: order.description }),
        ...(order.status && { status: order.status }),
        ...(order.totalPrice && { totalPrice: order.totalPrice }),
      },
      include: {
        items: true,
      },
    });

    const items = updated.items.map(
      (item) =>
        new OrderItemEntity(
          item.id,
          item.orderId,
          item.productId,
          item.quantity,
          item.unitPrice,
          item.createdAt,
          item.updatedAt
        )
    );

    return new OrderEntity(
      updated.id,
      updated.userId,
      updated.description ?? null,
      updated.totalPrice,
      updated.status,
      items,
      updated.createdAt,
      updated.updatedAt
    );
  }
}

