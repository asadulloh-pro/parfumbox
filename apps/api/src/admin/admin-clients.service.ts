import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { skip: number; take: number }) {
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return {
      items: rows.map((u) => ({
        id: u.id,
        telegramId: u.telegramId,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        createdAt: u.createdAt.toISOString(),
        orderCount: u._count.orders,
      })),
      total,
    };
  }

  async findOne(id: string) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        _count: { select: { orders: true } },
      },
    });
    if (!u) {
      throw new NotFoundException('Client not found');
    }
    return {
      id: u.id,
      telegramId: u.telegramId,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      createdAt: u.createdAt.toISOString(),
      orderCount: u._count.orders,
      recentOrders: u.orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total.toString(),
        createdAt: o.createdAt.toISOString(),
      })),
    };
  }
}
