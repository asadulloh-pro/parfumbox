import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";
import type { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { paginationParams, toPaginatedResult, type PaginatedResult } from "../common/pagination";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const { page, pageSize, skip } = paginationParams(query);
    const [total, items] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }
}
