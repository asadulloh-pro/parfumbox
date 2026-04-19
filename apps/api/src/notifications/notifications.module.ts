import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { AdminNotificationsController } from "./admin-notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
