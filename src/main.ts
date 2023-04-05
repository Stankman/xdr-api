import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { i18nValidationErrorFactory } from 'nestjs-i18n-2';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: i18nValidationErrorFactory,
      transform: true,
    })
  );

  const appConfig : AppConfigService = app.get<AppConfigService>(AppConfigService);

  const swaggerOptions = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription(appConfig.name + ' developed by Stankman')
    .setVersion('1.0.0')
    .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  app.enableCors();

  await app.listen(appConfig.port);
}
bootstrap();
