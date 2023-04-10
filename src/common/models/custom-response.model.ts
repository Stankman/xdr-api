import { ICustomResponse } from "../interfaces/custom-response.interface";

export class CustomResponse implements ICustomResponse {
    status: string = 'ok';
    code: number = 0;
    exception?: string;
    errors?: any;
    data?: any;

    public getJSON() : string {
        if(this.exception || this.errors) {
            return this.getErrorResponse();   
        } else {
            return this.getSuccessResponse();
        }
    }

    public getSuccessResponse() : any {
        return {
            'status': this.status,
            'code': this.code,
            'data': this.data
        };
    }

    public getErrorResponse() : any {
        return {
            'status': this.status,
            'code': this.code,
            'exception': this.exception,
            'errors': this.errors
        };
    }

    public setStatus(status: string): CustomResponse {
        this.status = status;
        return this;
    }

    public setCode(code: number): CustomResponse {
        this.code = code;
        return this;
    }

    public setException(exception: string): CustomResponse {
        this.exception = exception;
        return this;
    }

    public setErrors(errors: any): CustomResponse {
        this.errors = errors;
        return this;
    }

    public setData(data: any): CustomResponse {
        this.data = data;
        return this;
    }
}