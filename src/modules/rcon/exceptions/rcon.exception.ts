import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class RconException extends ModelException {
    constructor() {
        super('response.message.forbidden.duplicate_password', HttpStatus.FORBIDDEN);
    }
}