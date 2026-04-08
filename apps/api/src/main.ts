import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getUploadsDir } from './storage/upload-path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Local disk uploads only when MinIO is not configured
  if (!config.get<string>('MINIO_ENDPOINT')?.trim()) {
    app.useStaticAssets(getUploadsDir(), { prefix: '/uploads/' });
  }

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const origin = config.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: origin ? origin.split(',').map((s) => s.trim()) : true,
    credentials: true,
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}
bootstrap();
