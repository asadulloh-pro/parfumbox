import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    let total = new Prisma.Decimal(0);

    for (const line of dto.items) {
      const p = byId.get(line.productId);
      if (!p) {
        throw new NotFoundException('Product not found');
      }
      if (p.stock != null && p.stock < line.quantity) {
        throw new BadRequestException(`Insufficient stock for ${p.name}`);
      }
      const lineTotal = p.price.mul(line.quantity);
      total = total.add(lineTotal);
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: 'pending',
          paymentMethod: dto.paymentMethod,
          total,
          deliveryPhone: dto.deliveryPhone,
          deliveryAddress: dto.deliveryAddress,
          deliveryComment: dto.deliveryComment ?? null,
          items: {
            create: dto.items.map((line) => {
              const p = byId.get(line.productId)!;
              return {
                productId: p.id,
                quantity: line.quantity,
                priceSnapshot: p.price,
              };
            }),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const line of dto.items) {
        const p = byId.get(line.productId)!;
        if (p.stock != null) {
          await tx.product.update({
            where: { id: p.id },
            data: { stock: { decrement: line.quantity } },
          });
        }
      }

      return created;
    });

    return this.serializeOrder(order);
  }

  async listForUser(userId: string) {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
    return rows.map((o) => this.serializeOrder(o));
  }

  private serializeOrder(order: {
    id: string;
    userId: string;
    status: string;
    paymentMethod: string;
    total: Prisma.Decimal;
    deliveryPhone: string;
    deliveryAddress: string;
    deliveryComment: string | null;
    createdAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      priceSnapshot: Prisma.Decimal;
      product: { id: string; name: string; slug: string; imageUrl: string | null };
    }>;
  }) {
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: order.total.toString(),
      deliveryPhone: order.deliveryPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryComment: order.deliveryComment,
      createdAt: order.createdAt.toISOString(),
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
