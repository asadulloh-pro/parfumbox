import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(params: {
    skip: number;
    take: number;
    status?: string;
  }) {
    const where = params.status ? { status: params.status } : {};
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      items: rows.map((o) => this.serialize(o)),
      total,
    };
  }

  async findOne(id: string) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
    if (!o) {
      throw new NotFoundException('Order not found');
    }
    return this.serialize(o);
  }

  async updateStatus(id: string, status: string) {
    try {
      const o = await this.prisma.order.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      });
      return this.serialize(o);
    } catch {
      throw new NotFoundException('Order not found');
    }
  }

  private serialize(order: {
    id: string;
    userId: string;
    status: string;
    paymentMethod: string;
    total: Prisma.Decimal;
    deliveryPhone: string;
    deliveryAddress: string;
    deliveryComment: string | null;
    createdAt: Date;
    user: {
      id: string;
      telegramId: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
    };
    items: Array<{
      id: string;
      quantity: number;
      priceSnapshot: Prisma.Decimal;
      product: { id: string; name: string; slug: string; imageUrl: string | null };
    }>;
  }) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: order.total.toString(),
      deliveryPhone: order.deliveryPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryComment: order.deliveryComment,
      createdAt: order.createdAt.toISOString(),
      user: {
        id: order.user.id,
        telegramId: order.user.telegramId,
        username: order.user.username,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
      },
      items: order.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        priceSnapshot: i.priceSnapshot.toString(),
        product: {
          id: i.product.id,
          name: i.product.name,
          slug: i.product.slug,
          imageUrl: i.product.imageUrl,
        },
      })),
    };
  }
}
