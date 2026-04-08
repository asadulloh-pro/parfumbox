import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminClientsService } from './admin-clients.service';
import { AdminClientsController } from './admin-clients.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminUploadController } from './admin-upload.controller';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminAuthController,
    AdminOrdersController,
    AdminClientsController,
    AdminProductsController,
    AdminUploadController,
  ],
  providers: [
    AdminAuthService,
    AdminJwtGuard,
    AdminOrdersService,
    AdminClientsService,
    AdminProductsService,
    UploadService,
  ],
})
export class AdminModule {}
