import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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
