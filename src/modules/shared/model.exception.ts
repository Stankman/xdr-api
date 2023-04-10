import { HttpException } from "@nestjs/common";
import { CustomResponseService } from "nestjs-custom-response";

export class ModelException extends HttpException {
    private _customCode: number;

    private _errors: any[];
    
    constructor(code : number = 200, customResponse? : CustomResponseService, message : string = '', customCode : number = 1) {
        if(customResponse) {
            super(customResponse.message, code)
        } else {
            super(message, code);
        }
    }

    public get customCode(): number {
        return this._customCode;
    }

    public set customCode(value: number) {
        this._customCode = value;
    }

    public get errors(): any[] {
        return this._errors;
    }

    public set errors(value: any[]) {
        this._errors = value;
    }
}