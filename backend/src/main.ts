// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',  // Next.js が動作しているポート
  });
  await app.listen(3300);  // NestJS サーバーのポート
}
bootstrap();
