import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Order, OrderItem } from "@prisma/client";
import { JwtAdminGuard } from "../admin-auth/guards/jwt-admin.guard";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@ApiTags("admin-orders")
@ApiBearerAuth("admin-jwt")
@UseGuards(JwtAdminGuard)
@Controller("admin/orders")
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiOperation({ summary: "List all orders (admin)" })
  @ApiOkResponse({ description: "Orders with items and user profile data" })
  async list(): Promise<
    (Order & {
      items: OrderItem[];
      user: {
        id: string;
        telegramId: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        birthDate: Date | null;
      };
    })[]
  > {
    return this.orders.listAll();
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update order status" })
  @ApiOkResponse({ description: "Updated order" })
  async updateStatus(@Param("id") id: string, @Body() body: UpdateOrderStatusDto): Promise<Order> {
    return this.orders.updateStatus(id, body.status);
  }
}
