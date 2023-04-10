export interface ICustomResponse {
    status: string;
    code: number;
    exception?: string;
    errors?: any;
    data?: any;

    getJSON(): string;
    getSuccessResponse(): any;
    getErrorResponse(): any;
    setStatus(status: string): void;
    setCode(code: number): void;
    setException(exception: string): void;
    setErrors(errors: any): void;
    setData(data: any): void;
}