import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Product } from "@prisma/client";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "List catalog products" })
  @ApiOkResponse({ description: "Array of products" })
  async list(): Promise<Product[]> {
    return this.products.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Product detail" })
  @ApiOkResponse({ description: "Product" })
  async get(@Param("id") id: string): Promise<Product> {
    return this.products.findOne(id);
  }
}
