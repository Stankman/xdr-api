import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { ICommand } from "../interfaces/command.interface";

export class CommandSerializer extends ModelEntitySerializer implements ICommand {
    name: string;
    description: string;
    keys: string;
}