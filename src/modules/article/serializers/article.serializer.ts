import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IArticle } from "../interfaces/article.interface";
import { Exclude, Expose, Type } from "class-transformer";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { AvatarSerializer } from "src/modules/avatar/serializers/avatar.serializer";

export class ArticleSerializer extends ModelEntitySerializer implements IArticle {
    id : number;
    
    title: string;
    
    @Exclude()
    slug: string;
    
    description: string;
    
    content: string;
    
    image: string;
    
    thumbnail: string;
    
    @Type(() => AvatarSerializer)
    author: Avatar;

    hidden: boolean;
    
    pinned: boolean;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}