import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtPayload } from '../auth/jwt-payload';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() req: { user: JwtPayload }) {
    return this.orders.listForUser(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: { user: JwtPayload }, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.sub, dto);
  }
}
