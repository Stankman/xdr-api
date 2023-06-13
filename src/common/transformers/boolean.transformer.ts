import { ValueTransformer } from "typeorm";
import { BooleanEnum } from "../models/boolean.model";

export class BooleanTransformer implements ValueTransformer {
    public to(value: BooleanEnum) : boolean {
        return value === BooleanEnum.True;
    }

    public from(value: boolean) {
        return value ? BooleanEnum.True : BooleanEnum.False;
    }
}