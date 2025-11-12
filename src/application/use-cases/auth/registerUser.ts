import { UserRepository } from '../../../domain/repositories/UserRepository';
import { HashService } from '../../../infrastructure/services/hashService';
import { prismaClient } from '../../../infrastructure/database/prisma/prismaClient';

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  id: string;
  username: string;
  email: string;
  roleId: string;
}

export async function registerUser(
  userRepo: UserRepository,
  hashService: HashService,
  input: RegisterUserInput
): Promise<RegisterUserOutput> {
  // Check if user already exists
  const existingUser = await userRepo.findByEmail(input.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const existingUsername = await userRepo.findByUsername(input.username);
  if (existingUsername) {
    throw new Error('Username already taken');
  }

  // Get USER role
  const userRole = await prismaClient.role.findUnique({
    where: { name: 'USER' },
  });

  if (!userRole) {
    throw new Error('USER role not found. Please run seed script.');
  }

  // Hash password
  const hashedPassword = await hashService.hash(input.password);

  // Create user
  const user = await userRepo.create({
    username: input.username,
    email: input.email,
    password: hashedPassword,
    roleId: userRole.id,
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
  };
}

