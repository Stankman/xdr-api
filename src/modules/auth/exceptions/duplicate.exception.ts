import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class DuplicateException extends ModelException {
    constructor() {
        super('response.message.forbidden.duplicate', HttpStatus.UNAUTHORIZED);
    }
}