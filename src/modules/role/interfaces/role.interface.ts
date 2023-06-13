import { Rank } from "src/modules/rank/entities/rank.entity";
import { Permission } from "../entities/permission.entity";
import { Role } from "../entities/role.entity";

export interface IRole {
    id : number;
    name : string;
    description : string;
    hidden : boolean;
    created_at : Date;
    updated_at : Date;
    parent: Role;
    children: Role[];
    rank: Rank;
    permissions : Permission[];
}