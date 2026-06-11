import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Đọc cookie (access_token / refresh_token) vào req.cookies
  app.use(cookieParser());

  // Gắn các HTTP security header (chống clickjacking, MIME sniffing, ...).
  // API trả JSON + dùng CORS riêng, nên cho phép tài nguyên cross-origin.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Cho phép frontend (Next.js) gọi API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  });

  // Validate toàn cục dựa trên các DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
