import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(AdminJwtGuard)
export class AdminProductsController {
  constructor(private readonly adminProducts: AdminProductsService) {}

  @Get()
  list() {
    return this.adminProducts.listAll();
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.adminProducts.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.adminProducts.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminProducts.softDelete(id);
  }
}
