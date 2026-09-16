import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
  });

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  logger.log(`Social Music Listening API running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Socket.IO Realtime Gateway running on namespace: /realtime`);
}

bootstrap();
