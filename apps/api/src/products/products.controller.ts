import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.findAllActive();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }
}
