import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Order, OrderItem, OrderStatus, Product } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(userId: string, dto: CreateOrderDto): Promise<Order & { items: OrderItem[] }> {
    const merged = new Map<string, number>();
    for (const line of dto.items) {
      merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);
    }
    const lines = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
    const productIds = lines.map((l) => l.productId);

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length) {
        throw new NotFoundException("One or more products were not found");
      }

      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotalCents = 0;
      for (const line of lines) {
        const p = byId.get(line.productId)!;
        subtotalCents += p.priceCents * line.quantity;
      }

      const birthDate =
        dto.birthDate !== undefined ? new Date(`${dto.birthDate}T00:00:00.000Z`) : undefined;

      await tx.user.update({
        where: { id: userId },
        data: {
          phone: dto.deliveryPhone ?? undefined,
          firstName: dto.deliveryFirstName ?? undefined,
          lastName: dto.deliveryLastName ?? undefined,
          ...(birthDate !== undefined ? { birthDate } : {}),
        },
      });

      const order = await tx.order.create({
        data: {
          userId,
          subtotalCents,
          totalCents: subtotalCents,
          deliveryPhone: dto.deliveryPhone ?? null,
          deliveryFirstName: dto.deliveryFirstName ?? null,
          deliveryLastName: dto.deliveryLastName ?? null,
        },
      });

      const items: OrderItem[] = [];
      for (const line of lines) {
        const product: Product = byId.get(line.productId)!;
        if (product.stock !== null && product.stock !== undefined) {
          if (product.stock < line.quantity) {
            throw new BadRequestException(`Insufficient stock for ${product.title}`);
          }
          const updated = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (updated.count !== 1) {
            throw new BadRequestException(`Insufficient stock for ${product.title}`);
          }
        }

        const item = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: line.quantity,
            unitPriceCents: product.priceCents,
            titleSnapshot: product.title,
          },
        });
        items.push(item);
      }

      return { ...order, items };
    });
  }

  async listForUser(userId: string): Promise<(Order & { items: OrderItem[] })[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async getForUser(userId: string, orderId: string): Promise<Order & { items: OrderItem[] }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    if (order.userId !== userId) {
      throw new ForbiddenException();
    }
    return order;
  }

  async listAll(): Promise<
    (Order & {
      items: OrderItem[];
      user: {
        id: string;
        telegramId: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        birthDate: Date | null;
      };
    })[]
  > {
    return this.prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            telegramId: true,
            firstName: true,
            lastName: true,
            phone: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    await this.getById(orderId);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  private async getById(orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }
}
