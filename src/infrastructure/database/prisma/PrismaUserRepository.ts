import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserEntity } from '../../../domain/entities/UserEntity';
import { prismaClient } from './prismaClient';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new UserEntity(
      user.id,
      user.username,
      user.email,
      user.password,
      user.roleId,
      user.createdAt,
      user.updatedAt
    );
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await prismaClient.user.findUnique({
      where: { username },
    });

    if (!user) return null;

    return new UserEntity(
      user.id,
      user.username,
      user.email,
      user.password,
      user.roleId,
      user.createdAt,
      user.updatedAt
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prismaClient.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new UserEntity(
      user.id,
      user.username,
      user.email,
      user.password,
      user.roleId,
      user.createdAt,
      user.updatedAt
    );
  }

  async create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const created = await prismaClient.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
        roleId: user.roleId,
      },
    });

    return new UserEntity(
      created.id,
      created.username,
      created.email,
      created.password,
      created.roleId,
      created.createdAt,
      created.updatedAt
    );
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    const updated = await prismaClient.user.update({
      where: { id },
      data: {
        ...(user.username && { username: user.username }),
        ...(user.email && { email: user.email }),
        ...(user.password && { password: user.password }),
        ...(user.roleId && { roleId: user.roleId }),
      },
    });

    return new UserEntity(
      updated.id,
      updated.username,
      updated.email,
      updated.password,
      updated.roleId,
      updated.createdAt,
      updated.updatedAt
    );
  }
}

