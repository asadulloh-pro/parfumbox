import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { User } from "@prisma/client";
import { JwtAdminGuard } from "../admin-auth/guards/jwt-admin.guard";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import type { PaginatedResult } from "../common/pagination";
import { AdminUsersService } from "./admin-users.service";

@ApiTags("admin-users")
@ApiBearerAuth("admin-jwt")
@UseGuards(JwtAdminGuard)
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: "List Telegram users (admin, paginated)" })
  @ApiOkResponse({ description: "Paginated users" })
  async list(@Query() query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    return this.adminUsers.findAllPaginated(query);
  }
}
