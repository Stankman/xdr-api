import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class LoginException extends ModelException {
    constructor() {
        super('response.message.unauthorized.login', HttpStatus.UNAUTHORIZED);
    }
}