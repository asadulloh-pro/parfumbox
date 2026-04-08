import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
    createdAt: p.createdAt.toISOString(),
  };
}

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    const rows = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(serializeProduct);
  }

  async create(dto: CreateProductDto) {
    const p = await this.prisma.product.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description ?? null,
        price: new Prisma.Decimal(dto.price),
        currency: dto.currency ?? 'USD',
        imageUrl: dto.imageUrl ?? null,
        volumeMl: dto.volumeMl ?? null,
        stock: dto.stock ?? null,
        isActive: dto.isActive ?? true,
      },
    });
    return serializeProduct(p);
  }

  async update(id: string, dto: UpdateProductDto) {
    try {
      const p = await this.prisma.product.update({
        where: { id },
        data: {
          ...(dto.slug != null && { slug: dto.slug }),
          ...(dto.name != null && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.price != null && { price: new Prisma.Decimal(dto.price) }),
          ...(dto.currency != null && { currency: dto.currency }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
          ...(dto.volumeMl !== undefined && { volumeMl: dto.volumeMl }),
          ...(dto.stock !== undefined && { stock: dto.stock }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
      return serializeProduct(p);
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async softDelete(id: string) {
    try {
      const p = await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return serializeProduct(p);
    } catch {
      throw new NotFoundException('Product not found');
    }
  }
}
