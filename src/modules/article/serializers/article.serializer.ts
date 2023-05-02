import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IArticle } from "../interfaces/article.interface";
import { Expose } from "class-transformer";

export class ArticleSerializer extends ModelEntitySerializer implements IArticle {
    id : number;
    
    title: string;
    
    slug: string;
    
    description: string;
    
    content: string;
    
    image: string;
    
    thumbnail: string;
    
    author_id: number;
    
    hidden: number;
    
    pinned: number;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date;
}