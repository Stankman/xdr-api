import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { CustomResponse } from '../models/custom-response.model';
import { ModelException } from './model.exception';
import { I18nService, I18nValidationException } from 'nestjs-i18n';

@Catch(ModelException, I18nValidationException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n : I18nService) {}

  catch(exception: ModelException | I18nValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const customResponse = new CustomResponse();

    if(exception instanceof I18nValidationException) {
      customResponse
      .setStatus(this.i18n.translate('response.message.inputInvalid'))
      .setCode(this.i18n.translate('response.message.inputInvalid', { lang: "_code" }))
      .setErrors(exception.errors)
    } else {
      customResponse
      .setStatus(this.i18n.translate(exception.message))
      .setException(exception.name)
      .setCode(this.i18n.translate(exception.message, { lang: "_code" }));
    }

    response.status(exception.getStatus()).json(customResponse.getJSON());
  }
}
