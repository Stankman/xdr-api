import { HttpStatus } from "@nestjs/common";
import { ModelException } from "./model.exception";

export class InsufficientPermissionsException extends ModelException {
    constructor() {
        super('response.message.unauthorized.permission', HttpStatus.FORBIDDEN);
    }
}