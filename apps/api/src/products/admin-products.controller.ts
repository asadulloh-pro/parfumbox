import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Product } from "@prisma/client";
import { JwtAdminGuard } from "../admin-auth/guards/jwt-admin.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiTags("admin-products")
@ApiBearerAuth("admin-jwt")
@UseGuards(JwtAdminGuard)
@Controller("admin/products")
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create product" })
  @ApiOkResponse({ description: "Created product" })
  async create(@Body() body: CreateProductDto): Promise<Product> {
    return this.products.create(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product" })
  @ApiOkResponse({ description: "Updated product" })
  async update(@Param("id") id: string, @Body() body: UpdateProductDto): Promise<Product> {
    return this.products.update(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete product" })
  @ApiOkResponse({ description: "Deleted" })
  async remove(@Param("id") id: string): Promise<{ ok: true }> {
    await this.products.remove(id);
    return { ok: true };
  }
}
