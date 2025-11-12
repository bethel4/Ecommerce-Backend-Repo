import { OrderItemEntity } from './OrderItemEntity';

export class OrderEntity {
  constructor(
    public id: string,
    public userId: string,
    public description: string | null,
    public totalPrice: number,
    public status: string,
    public items: OrderItemEntity[],
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

