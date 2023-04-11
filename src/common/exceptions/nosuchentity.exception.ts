import { HttpStatus } from '@nestjs/common';
import { ModelException } from './model.exception';

export class NoSuchEntityException extends ModelException {
  constructor() {
    super('response.message.entityNotFound.any', HttpStatus.NOT_FOUND);
  }
}
