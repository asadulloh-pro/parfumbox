import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { AdminProductsController } from "./admin-products.controller";
import { AdminSizePresetsController } from "./admin-size-presets.controller";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { SizePresetsService } from "./size-presets.service";

@Module({
  imports: [AdminAuthModule, RealtimeModule],
  controllers: [ProductsController, AdminProductsController, AdminSizePresetsController],
  providers: [ProductsService, SizePresetsService],
  exports: [ProductsService, SizePresetsService],
})
export class ProductsModule {}
