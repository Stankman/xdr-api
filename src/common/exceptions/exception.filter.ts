/*
https://docs.nestjs.com/exception-filters#exception-filters-1
*/

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CustomResponse } from '../models/custom-response.model';
import { ModelException } from './model.exception';
import { I18nService } from 'nestjs-i18n';

@Catch(ModelException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n : I18nService) {}

  catch(exception: ModelException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const customResponse = new CustomResponse()
      .setStatus(this.i18n.translate(exception.message))
      .setException(exception.name)
      .setCode(this.i18n.translate(exception.message, { lang: "_code" }));

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json(customResponse.getJSON());
  }
}
