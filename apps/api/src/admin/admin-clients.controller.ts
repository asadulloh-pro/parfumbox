import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminClientsService } from './admin-clients.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('admin/clients')
@UseGuards(AdminJwtGuard)
export class AdminClientsController {
  constructor(private readonly adminClients: AdminClientsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 20;
    return this.adminClients.list({ skip, take });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.adminClients.findOne(id);
  }
}
