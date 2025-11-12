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
          create: order.items.map((item) => ({
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
      updated.description,
      updated.totalPrice,
      updated.status,
      items,
      updated.createdAt,
      updated.updatedAt
    );
  }
}

