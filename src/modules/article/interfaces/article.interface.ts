import { Avatar } from "src/modules/avatar/entities/avatar.entity";

export interface IArticle {
    id : number;
    title : string;
    slug : string;
    description : string;
    content : string;
    image : string;
    thumbnail : string;
    author: Avatar;
    hidden : boolean;
    pinned : boolean;
    created_at : Date;
    updated_at : Date;
}