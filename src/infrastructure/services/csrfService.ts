import crypto from 'crypto';
import { getEnv } from '../config/env';

export class CsrfService {
  private secret: string;

  constructor() {
    const env = getEnv();
    this.secret = env.CSRF_SECRET;
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyToken(token: string, cookieToken: string): boolean {
    return token === cookieToken;
  }

  hashToken(token: string): string {
    return crypto.createHmac('sha256', this.secret).update(token).digest('hex');
  }
}

