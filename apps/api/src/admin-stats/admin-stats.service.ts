import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type DashboardSeriesPoint = {
  date: string;
  orders: number;
  newUsers: number;
};

export type DashboardStatsResult = {
  totals: {
    productCount: number;
    ordersInRange: number;
    newUsersInRange: number;
  };
  series: DashboardSeriesPoint[];
};

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(fromIso: string, toIso: string): Promise<DashboardStatsResult> {
    const from = this.startOfUtcDay(new Date(fromIso));
    const to = this.endOfUtcDay(new Date(toIso));
    if (from > to) {
      throw new BadRequestException("`from` must be before or equal to `to`");
    }

    const [productCount, ordersInRange, newUsersInRange, orderDates, userDates] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
    ]);

    const ordersByDay = this.countByUtcDay(orderDates.map((o) => o.createdAt));
    const usersByDay = this.countByUtcDay(userDates.map((u) => u.createdAt));

    const series: DashboardSeriesPoint[] = [];
    for (const d of this.eachUtcDay(from, to)) {
      series.push({
        date: d,
        orders: ordersByDay.get(d) ?? 0,
        newUsers: usersByDay.get(d) ?? 0,
      });
    }

    return {
      totals: {
        productCount,
        ordersInRange,
        newUsersInRange,
      },
      series,
    };
  }

  private countByUtcDay(dates: Date[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const d of dates) {
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }

  private startOfUtcDay(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  }

  private endOfUtcDay(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
  }

  private eachUtcDay(from: Date, to: Date): string[] {
    const days: string[] = [];
    const cursor = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 12, 0, 0, 0),
    );
    const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 12, 0, 0, 0));
    while (cursor <= end) {
      days.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }
}
