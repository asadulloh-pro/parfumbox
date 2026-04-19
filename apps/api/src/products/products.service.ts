import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type Product, type ProductSizePreset } from "@prisma/client";
import type { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { paginationParams, toPaginatedResult, type PaginatedResult } from "../common/pagination";
import { PrismaService } from "../prisma/prisma.service";
import { OrderEventsService } from "../realtime/order-events.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import {
  expandSizesForResponse,
  listingPriceFromSizeLines,
  normalizeSizeLines,
  parseStoredSizeLines,
  type PublicSizeLine,
} from "./product-sizes.util";

export type PublicProduct = {
  id: string;
  title: string;
  description: string;
  priceUzs: number;
  sizes: PublicSizeLine[] | null;
  images: string[];
  stock: number | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderEvents: OrderEventsService,
  ) {}

  private async presetMap(): Promise<Map<string, ProductSizePreset>> {
    const rows = await this.prisma.productSizePreset.findMany();
    return new Map(rows.map((r) => [r.id, r]));
  }

  private toPublicProduct(p: Product, map: Map<string, ProductSizePreset>): PublicProduct {
    const stored = parseStoredSizeLines(p.sizes);
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      priceUzs: p.priceUzs,
      sizes: expandSizesForResponse(stored, map),
      images: p.images,
      stock: p.stock,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<PublicProduct>> {
    const { page, pageSize, skip } = paginationParams(query);
    const map = await this.presetMap();
    const where = {};
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    const items = rows.map((p) => this.toPublicProduct(p, map));
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<PublicProduct> {
    const map = await this.presetMap();
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return this.toPublicProduct(product, map);
  }

  async create(dto: CreateProductDto): Promise<PublicProduct> {
    const presetById = await this.presetMap();
    if (dto.sizes && dto.sizes.length > 0) {
      const normalized = normalizeSizeLines(dto.sizes, presetById);
      const listing = listingPriceFromSizeLines(normalized, presetById);
      const created = await this.prisma.product.create({
        data: {
          title: dto.title,
          description: dto.description ?? "",
          priceUzs: listing,
          sizes: normalized as unknown as Prisma.InputJsonValue,
          images: dto.images ?? [],
          stock: dto.stock ?? null,
        },
      });
      const map = await this.presetMap();
      await this.orderEvents.notifyProductStockChanged(created.id, created.stock);
      return this.toPublicProduct(created, map);
    }
    const created = await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description ?? "",
        priceUzs: dto.priceUzs,
        images: dto.images ?? [],
        stock: dto.stock ?? null,
      },
    });
    const map = await this.presetMap();
    await this.orderEvents.notifyProductStockChanged(created.id, created.stock);
    return this.toPublicProduct(created, map);
  }

  async update(id: string, dto: UpdateProductDto): Promise<PublicProduct> {
    await this.findRaw(id);
    const presetById = await this.presetMap();
    const data: Prisma.ProductUpdateInput = {};
    if (dto.title !== undefined) {
      data.title = dto.title;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.images !== undefined) {
      data.images = dto.images;
    }
    if (dto.stock !== undefined) {
      data.stock = dto.stock;
    }
    if (dto.sizes !== undefined) {
      if (dto.sizes.length === 0) {
        data.sizes = Prisma.DbNull;
        if (dto.priceUzs !== undefined) {
          data.priceUzs = dto.priceUzs;
        }
      } else {
        const normalized = normalizeSizeLines(dto.sizes, presetById);
        data.sizes = normalized as unknown as Prisma.InputJsonValue;
        data.priceUzs = listingPriceFromSizeLines(normalized, presetById);
      }
    } else if (dto.priceUzs !== undefined) {
      data.priceUzs = dto.priceUzs;
    }
    const updated = await this.prisma.product.update({
      where: { id },
      data,
    });
    const map = await this.presetMap();
    if (dto.stock !== undefined) {
      await this.orderEvents.notifyProductStockChanged(updated.id, updated.stock);
    }
    return this.toPublicProduct(updated, map);
  }

  async remove(id: string): Promise<void> {
    await this.findRaw(id);
    await this.prisma.product.delete({ where: { id } });
  }

  /** Raw Prisma row (e.g. for internal use). */
  async findRaw(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }
}
