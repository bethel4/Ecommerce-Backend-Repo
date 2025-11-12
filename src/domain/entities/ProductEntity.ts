export class ProductEntity {
  constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public price: number,
    public stock: number,
    public category: string | null,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

