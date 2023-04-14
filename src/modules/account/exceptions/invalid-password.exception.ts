/*
https://docs.nestjs.com/exception-filters#custom-exceptions
*/

import { HttpException, HttpStatus } from '@nestjs/common';
import { ModelException } from 'src/common/exceptions/model.exception';

export class InvalidPasswordException extends ModelException {
  constructor() {
      super('response.message.unauthorized.password', HttpStatus.UNAUTHORIZED);
  }
}
