export interface IArticle {
    id : number;
    title : string;
    slug : string;
    description : string;
    content : string;
    image : string;
    thumbnail : string;
    author_id : number;
    hidden : number;
    pinned : number;
    created_at : Date;
    updated_at : Date;
}