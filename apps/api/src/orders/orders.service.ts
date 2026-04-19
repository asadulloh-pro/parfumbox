import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Order, OrderItem, OrderStatus, Prisma, Product } from "@prisma/client";
import type { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { paginationParams, toPaginatedResult, type PaginatedResult } from "../common/pagination";
import {
  orderItemTitleSnapshot,
  resolveProductUnitPrice,
} from "../products/product-sizes.util";
import { PrismaService } from "../prisma/prisma.service";
import { OrderEventsService } from "../realtime/order-events.service";
import { TelegramNotifyService } from "../telegram/telegram-notify.service";
import { AdminOrdersQueryDto } from "./dto/admin-orders-query.dto";
import { CreateOrderDto } from "./dto/create-order.dto";

export type AdminOrderRow = Order & {
  items: OrderItem[];
  user: {
    id: string;
    telegramId: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    birthDate: Date | null;
  };
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderEvents: OrderEventsService,
    private readonly telegramNotify: TelegramNotifyService,
  ) {}

  async createForUser(userId: string, dto: CreateOrderDto): Promise<Order & { items: OrderItem[] }> {
    const merged = new Map<string, { productId: string; sizeId: string | undefined; quantity: number }>();
    for (const line of dto.items) {
      const sizeKey = line.sizeId ?? "default";
      const key = `${line.productId}::${sizeKey}`;
      const prev = merged.get(key);
      merged.set(key, {
        productId: line.productId,
        sizeId: line.sizeId,
        quantity: (prev?.quantity ?? 0) + line.quantity,
      });
    }
    const lines = [...merged.values()];
    const productIds = [...new Set(lines.map((l) => l.productId))];

    const created = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length) {
        throw new NotFoundException("One or more products were not found");
      }

      const presets = await tx.productSizePreset.findMany();
      const presetById = new Map(presets.map((p) => [p.id, p]));

      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotalUzs = 0;
      for (const line of lines) {
        const p = byId.get(line.productId)!;
        const resolved = resolveProductUnitPrice(p.priceUzs, p.sizes, presetById, line.sizeId);
        subtotalUzs += resolved.unitPriceUzs * line.quantity;
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
          subtotalUzs,
          totalUzs: subtotalUzs,
          deliveryPhone: dto.deliveryPhone ?? null,
          deliveryFirstName: dto.deliveryFirstName ?? null,
          deliveryLastName: dto.deliveryLastName ?? null,
        },
      });

      const items: OrderItem[] = [];
      for (const line of lines) {
        const product: Product = byId.get(line.productId)!;
        const resolved = resolveProductUnitPrice(product.priceUzs, product.sizes, presetById, line.sizeId);
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
            unitPriceUzs: resolved.unitPriceUzs,
            titleSnapshot: orderItemTitleSnapshot(product.title, resolved.sizeLabelSnapshot),
            sizeId: resolved.sizeIdForDb,
            sizeLabelSnapshot: resolved.sizeLabelSnapshot,
            gramsSnapshot: resolved.gramsSnapshot,
          },
        });
        items.push(item);
      }

      return { ...order, items };
    });
    await this.orderEvents.notifyOrdersChanged({
      reason: "created",
      orderId: created.id,
      userId,
      status: created.status,
      updatedAt: created.updatedAt.toISOString(),
    });

    const touchedProductIds = [
      ...new Set(created.items.map((i) => i.productId).filter((x): x is string => Boolean(x))),
    ];
    if (touchedProductIds.length > 0) {
      const stockRows = await this.prisma.product.findMany({
        where: { id: { in: touchedProductIds } },
        select: { id: true, stock: true },
      });
      for (const row of stockRows) {
        await this.orderEvents.notifyProductStockChanged(row.id, row.stock);
      }
    }

    return created;
  }

  async listForUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Order & { items: OrderItem[] }>> {
    const { page, pageSize, skip } = paginationParams(query);
    const where: Prisma.OrderWhereInput = { userId };
    const [total, rows] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: { items: true },
      }),
    ]);
    return toPaginatedResult(rows, total, page, pageSize);
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

  async listAllPaginated(query: AdminOrdersQueryDto): Promise<PaginatedResult<AdminOrderRow>> {
    const { page, pageSize, skip } = paginationParams(query);
    const where: Prisma.OrderWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.createdFrom || query.createdTo) {
      where.createdAt = {};
      if (query.createdFrom) {
        where.createdAt.gte = new Date(`${query.createdFrom}T00:00:00.000Z`);
      }
      if (query.createdTo) {
        where.createdAt.lte = new Date(`${query.createdTo}T23:59:59.999Z`);
      }
    }

    const include = {
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
    } as const;

    const [total, rows] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include,
      }),
    ]);
    return toPaginatedResult(rows as AdminOrderRow[], total, page, pageSize);
  }

  async getByIdForAdmin(orderId: string): Promise<AdminOrderRow | null> {
    return this.prisma.order.findUnique({
      where: { id: orderId },
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
    const prev = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { telegramId: true, locale: true } },
        items: {
          orderBy: { id: "asc" },
          include: { product: { select: { images: true } } },
        },
      },
    });
    if (!prev) {
      throw new NotFoundException("Order not found");
    }
    if (prev.status === status) {
      const { user: _u, items: _items, ...order } = prev;
      return order as Order;
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    await this.orderEvents.notifyOrdersChanged({
      reason: "updated",
      orderId: updated.id,
      userId: updated.userId,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });

    const productImageRaw = firstOrderLineProductImage(prev.items);

    await this.telegramNotify.notifyOrderStatusChanged(
      prev.user.telegramId,
      updated.id,
      updated.status,
      prev.user.locale,
      productImageRaw,
    );

    return updated;
  }

  private async getById(orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }
}

function firstOrderLineProductImage(
  items: Array<{ product: { images: string[] } | null }>,
): string | undefined {
  for (const item of items) {
    const raw = item.product?.images?.[0];
    if (raw) {
      return raw;
    }
  }
  return undefined;
}
