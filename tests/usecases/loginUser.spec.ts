import { loginUser } from '../../src/application/use-cases/auth/loginUser';
import { HashService } from '../../src/infrastructure/services/hashService';
import { JwtService } from '../../src/infrastructure/services/jwtService';

class MockUserRepo {
  private user: any;
  constructor(user: any) { this.user = user; }
  async findByEmail(email: string) { return this.user && this.user.email === email ? this.user : null; }
  async findByUsername() { return null; }
  async findById() { return null; }
  async create() { throw new Error('not implemented'); }
  async update() { throw new Error('not implemented'); }
}

describe('loginUser', () => {
  it('returns tokens when credentials are valid', async () => {
    const user = { id: 'u1', username: 'john', email: 'john@example.com', password: await new HashService().hash('Pass123!'), roleId: 'role-user' };
    const repo = new MockUserRepo(user) as any;
    const hash = new HashService();
    const jwt = new JwtService();

    const res = await loginUser(repo, hash, jwt, { email: 'john@example.com', password: 'Pass123!' });
    expect(res.accessToken).toBeTruthy();
    expect(res.user.email).toBe('john@example.com');
  });

  it('throws on invalid password', async () => {
    const user = { id: 'u1', username: 'john', email: 'john@example.com', password: await new HashService().hash('Pass123!'), roleId: 'role-user' };
    const repo = new MockUserRepo(user) as any;
    const hash = new HashService();
    const jwt = new JwtService();

    await expect(loginUser(repo, hash, jwt, { email: 'john@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
  });
});

