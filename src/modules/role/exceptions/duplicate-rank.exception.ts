import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class DuplicateRankException extends ModelException {
    constructor() {
        super('response.message.roles.duplicate_rank', HttpStatus.FORBIDDEN);
    }
}