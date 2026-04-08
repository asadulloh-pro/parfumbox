import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { validateTelegramInitData } from './telegram-init-data';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginWithTelegram(initData: string) {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const maxAge = parseInt(
      this.config.get<string>('TELEGRAM_AUTH_MAX_AGE_SECONDS', '86400'),
      10,
    );
    if (!botToken || botToken.includes('placeholder')) {
      throw new BadRequestException('Server is not configured with TELEGRAM_BOT_TOKEN');
    }

    const result = validateTelegramInitData(initData, botToken, maxAge);
    if (!result.valid) {
      throw new UnauthorizedException('Invalid or expired Telegram init data');
    }

    const user = await this.users.upsertFromTelegram(result.user);
    return this.issueTokens(user.id, user.telegramId);
  }

  async devLogin(telegramId: string) {
    const bypass = this.config.get<string>('AUTH_DEV_BYPASS') === 'true';
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    if (!bypass || nodeEnv === 'production') {
      throw new ForbiddenException();
    }

    const user = await this.users.upsertByTelegramId(telegramId);
    return this.issueTokens(user.id, user.telegramId);
  }

  private issueTokens(userId: string, telegramId: string) {
    const payload: JwtPayload = {
      sub: userId,
      telegramId,
      role: 'user',
    };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: { id: userId, telegramId } };
  }
}
