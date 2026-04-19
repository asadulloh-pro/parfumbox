import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { PaginatedResult } from "../common/pagination";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { ProductsService, type PublicProduct } from "./products.service";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "List catalog products (paginated)" })
  @ApiOkResponse({ description: "Paginated products" })
  async list(@Query() query: PaginationQueryDto): Promise<PaginatedResult<PublicProduct>> {
    return this.products.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Product detail" })
  @ApiOkResponse({ description: "Product" })
  async get(@Param("id") id: string): Promise<PublicProduct> {
    return this.products.findOne(id);
  }
}
