import { HttpStatus } from "@nestjs/common";
import { ModelException } from "./model.exception";

export class NoSuchPermissionException extends ModelException {
    constructor() {
      super('response.message.entityNotFound.permission', HttpStatus.NOT_FOUND);
    }
  }