export class OrderItemEntity {
  constructor(
    public id: string,
    public orderId: string,
    public productId: string,
    public quantity: number,
    public unitPrice: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

