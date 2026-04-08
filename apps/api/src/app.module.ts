import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { HealthController } from './health.controller';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Nest emits to dist/src/*.js — __dirname is .../apps/api/dist/src (not .../dist).
      // Load monorepo root .env first, then apps/api/.env (later overrides duplicate keys).
      envFilePath: [
        join(__dirname, '..', '..', '..', '..', '.env'),
        join(__dirname, '..', '..', '.env'),
      ],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
