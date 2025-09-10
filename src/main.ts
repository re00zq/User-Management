import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global validation pipe
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

  // Enable Cross-Origin Resource Sharing
  app.enableCors();

  // --- Swagger (OpenAPI) Documentation Setup ---
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription(
      'API documentation for the User Authentication and Management service',
    )
    .setVersion('1.0')
    .addBearerAuth() // This is for JWT authentication (Authorization: Bearer <token>)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // The setup() method takes the application instance, a path for the API documentation, and the document object.
  SwaggerModule.setup('api', app, document); // Your API docs will be available at http://localhost:3000/api

  await app.listen(3000);
}
bootstrap();
