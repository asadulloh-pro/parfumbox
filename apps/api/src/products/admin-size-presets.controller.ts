import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { ProductSizePreset } from "@prisma/client";
import { JwtAdminGuard } from "../admin-auth/guards/jwt-admin.guard";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import type { PaginatedResult } from "../common/pagination";
import type { CreateSizePresetDto, UpdateSizePresetDto } from "./size-presets.service";
import { SizePresetsService } from "./size-presets.service";

@ApiTags("admin-size-presets")
@ApiBearerAuth("admin-jwt")
@UseGuards(JwtAdminGuard)
@Controller("admin/size-presets")
export class AdminSizePresetsController {
  constructor(private readonly presets: SizePresetsService) {}

  @Get()
  @ApiOperation({ summary: "List reusable volume presets (hajm), paginated" })
  @ApiOkResponse({ description: "Presets ordered by sortOrder, grams" })
  async list(@Query() query: PaginationQueryDto): Promise<PaginatedResult<ProductSizePreset>> {
    return this.presets.findAllPaginated(query);
  }

  @Post()
  @ApiOperation({ summary: "Create preset" })
  @ApiOkResponse({ description: "Created preset" })
  async create(@Body() body: CreateSizePresetDto): Promise<ProductSizePreset> {
    return this.presets.create(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update preset" })
  @ApiOkResponse({ description: "Updated preset" })
  async update(@Param("id") id: string, @Body() body: UpdateSizePresetDto): Promise<ProductSizePreset> {
    return this.presets.update(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete preset" })
  @ApiOkResponse({ description: "Deleted" })
  async remove(@Param("id") id: string): Promise<{ ok: true }> {
    await this.presets.remove(id);
    return { ok: true };
  }
}
