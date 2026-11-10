import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Bukuverse API')
    .setDescription('Backend API untuk katalog buku Bukuverse')
    .setVersion('1.0')
    .addTag('Books')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  const server = await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://localhost:${port}`);
  console.log('Server address:', server.address());
  
  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await app.close();
    process.exit(0);
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });
  
  // Keep the process alive
  await new Promise(() => {});
}
await bootstrap();
