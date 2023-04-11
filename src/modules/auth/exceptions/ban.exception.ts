import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class BanException extends ModelException {
    constructor() {
        super('response.message.unauthorized.ban', HttpStatus.UNAUTHORIZED);
    }
}