import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramWebAppUser } from '../auth/telegram-init-data';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromTelegram(tg: TelegramWebAppUser): Promise<User> {
    const telegramId = String(tg.id);
    return this.prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        username: tg.username ?? null,
        firstName: tg.first_name ?? null,
        lastName: tg.last_name ?? null,
      },
      update: {
        username: tg.username ?? null,
        firstName: tg.first_name ?? null,
        lastName: tg.last_name ?? null,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /** Dev bypass: ensure a user row exists for this Telegram id string */
  async upsertByTelegramId(telegramId: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        username: 'dev',
        firstName: 'Dev',
        lastName: 'User',
      },
      update: {},
    });
  }
}
