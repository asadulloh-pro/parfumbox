import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminOrdersService } from './admin-orders.service';
import { OrdersListQueryDto } from './dto/pagination-query.dto';
import { PatchOrderDto } from './dto/patch-order.dto';

@Controller('admin/orders')
@UseGuards(AdminJwtGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrders: AdminOrdersService) {}

  @Get()
  list(@Query() query: OrdersListQueryDto) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 20;
    return this.adminOrders.listAll({ skip, take, status: query.status });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.adminOrders.findOne(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() body: PatchOrderDto) {
    return this.adminOrders.updateStatus(id, body.status);
  }
}
