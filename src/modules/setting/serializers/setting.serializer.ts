import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { ISetting } from "../interfaces/setting";

export class SettingSerializer extends ModelEntitySerializer implements ISetting {
    key: string;
    value: string;
}