import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { ICommand } from "../interfaces/command.interface";
import { Rank } from "../entities/rank.entity";

export class CommandSerializer extends ModelEntitySerializer implements ICommand {
    name: string;
    description: string;
    keys: string;
    ranks: Rank[];
}