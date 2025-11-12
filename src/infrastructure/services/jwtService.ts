import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { getEnv } from "../config/env";

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: string;
}

export class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;
  private accessExpiresIn: string | number;
  private refreshExpiresIn: string | number;

  constructor() {
    const env = getEnv();

    this.accessSecret = env.JWT_SECRET as Secret;
    this.refreshSecret = env.JWT_REFRESH_SECRET as Secret;
    this.accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN || "15m";
    this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN || "7d";
  }

  signAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, this.accessSecret, { 
      expiresIn: this.accessExpiresIn as string | number 
    } as SignOptions);
  }

  signRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, this.refreshSecret, { 
      expiresIn: this.refreshExpiresIn as string | number 
    } as SignOptions);
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, this.accessSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, this.refreshSecret) as TokenPayload;
  }
}
