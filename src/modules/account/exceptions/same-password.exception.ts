/*
https://docs.nestjs.com/exception-filters#custom-exceptions
*/

import { HttpException, HttpStatus } from '@nestjs/common';
import { ModelException } from 'src/common/exceptions/model.exception';

export class SamePasswordException extends ModelException {
  constructor() {
      super('response.message.forbidden.duplicate_password', HttpStatus.FORBIDDEN);
  }
}
