import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminJwtGuard } from './admin-jwt.guard';
import { UploadService } from '../upload/upload.service';

@Controller('admin')
export class AdminUploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: memoryStorage(),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file');
    }
    const url = await this.uploadService.saveUploadedFile(file);
    return { url };
  }
}
