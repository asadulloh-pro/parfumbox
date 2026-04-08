import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

function serializeProduct(p: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: Prisma.Decimal;
  currency: string;
  imageUrl: string | null;
  volumeMl: number | null;
  stock: number | null;
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    ...p,
    price: p.price.toString(),
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    const rows = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(serializeProduct);
  }

  async findBySlug(slug: string) {
    const p = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
    });
    if (!p) {
      throw new NotFoundException('Product not found');
    }
    return serializeProduct(p);
  }
}
