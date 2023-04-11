/*
https://docs.nestjs.com/exception-filters#exception-filters-1
*/

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomResponse } from '../models/custom-response.model';
import { ModelException } from './model.exception';

@Catch(ModelException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: ModelException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const customResponse = new CustomResponse()
      .setStatus(exception.message)
      .setException(exception.name)
      .setCode(exception.customCode);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json(customResponse.getJSON());
  }
}
