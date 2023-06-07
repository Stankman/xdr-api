import { HttpStatus } from "@nestjs/common";
import { ModelException } from "src/common/exceptions/model.exception";

export class DuplicatePaymentException extends ModelException {
    constructor() {
        super('response.message.invalid.shop.payment.duplicate', HttpStatus.UNAUTHORIZED);
    }
}