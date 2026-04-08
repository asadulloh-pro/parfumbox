import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('telegram')
  async telegram(@Body() body: TelegramLoginDto) {
    return this.auth.loginWithTelegram(body.initData);
  }

  /** Dev-only: exchange X-Dev-Telegram-Id for JWT when AUTH_DEV_BYPASS=true */
  @Post('dev')
  async dev(@Headers('x-dev-telegram-id') telegramId?: string) {
    return this.auth.devLogin(telegramId ?? '123456789');
  }
}
