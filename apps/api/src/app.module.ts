import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminStatsModule } from "./admin-stats/admin-stats.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AdminAuthModule } from "./admin-auth/admin-auth.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Always load apps/api/.env (Nest default only reads cwd/.env; pnpm may run with repo root cwd).
      envFilePath: join(__dirname, "..", ".env"),
    }),
    PrismaModule,
    AuthModule,
    AdminAuthModule,
    AdminUsersModule,
    AdminStatsModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    StorageModule,
    HealthModule,
  ],
})
export class AppModule {}
