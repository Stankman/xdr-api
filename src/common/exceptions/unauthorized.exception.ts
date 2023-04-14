import { HttpException, HttpStatus } from '@nestjs/common';
import { ModelException } from './model.exception';

export class UnauthorizedException extends ModelException {
  constructor() {
    super('response.message.unauthorized.jwt', HttpStatus.UNAUTHORIZED);
  }
}
