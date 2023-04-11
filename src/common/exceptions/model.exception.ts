import { HttpException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n-2';

export class ModelException extends HttpException {
  private _customCode: number;

  private _i18n: I18nContext;

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

  public get i18n(): I18nContext {
    return this._i18n;
  }

  public set i18n(value: I18nContext) {
    this._i18n = value;
  }
}
