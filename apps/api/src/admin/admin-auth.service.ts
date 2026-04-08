import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/jwt-payload';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  login(apiKey: string) {
    const trimmed = apiKey.trim();
    const expected = this.config.get<string>('ADMIN_API_KEY')?.trim();
    if (!expected || expected.length < 8) {
      throw new BadRequestException('ADMIN_API_KEY is not configured on the server');
    }
    if (trimmed !== expected) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: 'admin',
      role: 'admin',
    };
    const accessToken = this.jwt.sign(payload);
    return { accessToken };
  }
}
