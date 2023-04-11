import { HttpException } from '@nestjs/common';

export class ModelException extends HttpException {
  private _customCode: number;

  constructor(response: string | Record<string, any>, httpCode: number, customCode? : number) {
    super(response, httpCode);

    this.customCode = customCode ?? httpCode;
  }

  public get customCode(): number {
    return this._customCode;
  }

  public set customCode(value: number) {
    this._customCode = value;
  }
}
