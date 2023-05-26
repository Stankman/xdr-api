import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { Avatar } from "../entities/avatar.entity";
import { AvatarSerializer } from "../serializers/avatar.serializer";
import { plainToInstance, instanceToPlain } from "class-transformer";

@Injectable()
export class AvatarsRepository extends ModelRepository<Avatar, AvatarSerializer> {
    constructor(private dataSource : DataSource) {
        super(Avatar, dataSource.createEntityManager());
    }

    public async getAvatar(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<AvatarSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }

    public transform(model: Avatar, transformOptions : any = {}): AvatarSerializer {
        return plainToInstance(AvatarSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Avatar[], transformOptions : any = {}): AvatarSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}