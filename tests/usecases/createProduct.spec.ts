import { createProduct } from '../../src/application/use-cases/products/createProduct';

class MockProductRepo {
  async create(data: any) { return { id: 'p1', ...data, description: data.description ?? null, category: data.category ?? null, createdAt: new Date(), updatedAt: new Date() }; }
  async findById() { return null; }
  async findAll() { return []; }
  async search() { return []; }
  async update() { return null as any; }
  async delete() { return; }
  async count() { return 0; }
  async searchCount() { return 0; }
  async findByUserId() { return []; }
  async findFiltered() { return []; }
  async countFiltered() { return 0; }
}

describe('createProduct', () => {
  it('creates a product when inputs are valid', async () => {
    const repo = new MockProductRepo() as any;

    const res = await createProduct(repo, {
      name: 'Mouse',
      description: 'Ergonomic Mouse',
      price: 10,
      stock: 5,
      category: 'Electronics',
      userId: 'u1'
    });

    expect(res.name).toBe('Mouse');
    expect(res.price).toBe(10);
  });

  it('rejects non-positive price', async () => {
    const repo = new MockProductRepo() as any;

    await expect(createProduct(repo, {
      name: 'Mouse',
      description: 'Ergonomic Mouse',
      price: 0,
      stock: 5,
      category: 'Electronics',
      userId: 'u1'
    })).rejects.toThrow('Price must be greater than 0');
  });
});

