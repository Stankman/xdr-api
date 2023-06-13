import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class CircularReferenceException extends ModelException {
    constructor() {
        super('response.message.roles.circular_reference', HttpStatus.FORBIDDEN);
    }
}