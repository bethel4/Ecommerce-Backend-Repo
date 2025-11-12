import { UserRepository } from '../../../domain/repositories/UserRepository';
import { HashService } from '../../../infrastructure/services/hashService';
import { JwtService } from '../../../infrastructure/services/jwtService';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: {
    id: string;
    username: string;
    email: string;
    roleId: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(
  userRepo: UserRepository,
  hashService: HashService,
  jwtService: JwtService,
  input: LoginUserInput
): Promise<LoginUserOutput> {
  // Find user
  const user = await userRepo.findByEmail(input.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await hashService.compare(input.password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
  };

  const accessToken = jwtService.signAccessToken(tokenPayload);
  const refreshToken = jwtService.signRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    },
    accessToken,
    refreshToken,
  };
}

