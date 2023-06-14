import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { RankCommand } from "../entities/rank-command.entity";
import { RankRight } from "../entities/rank-right.entity";
import { IRank } from "../interfaces/rank.interface";
import { Exclude, Expose, Type } from "class-transformer";
import { AvatarSerializer } from "src/modules/avatar/serializers/avatar.serializer";

export const extendedRankSerializing: string[] = [
    'extended.rank'
];

export class RankSerializer extends ModelEntitySerializer implements IRank {
    @Expose()
    id: number;
    
    @Expose()
    name: string;
    
    @Expose()
    description: string;
    
    @Expose()
    badge: string;
    
    @Expose({groups: ['rank.extended']})
    level: number;

    @Expose({groups: ['rank.extended']})
    prefix: string;
    
    @Expose({groups: ['rank.extended']})
    prefixColor: string;
    
    @Expose({groups: ['rank.extended']})
    roomEffect: number;
    
    @Expose({groups: ['rank.extended'] })
    logEnabled: boolean;
    
    commands: RankCommand[];
    
    rights: RankRight[];
    
    @Type(() => AvatarSerializer)
    avatars: Avatar[];
    
    role: Role;
}