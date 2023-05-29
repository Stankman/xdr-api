import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class NewAvatarException extends ModelException {
    constructor() {
        super('response.message.invalid.avatar.creation', HttpStatus.BAD_REQUEST);
    }
  }