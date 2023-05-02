import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IArticle } from "../interfaces/article.interface";

@Entity({ name: 'articles'})
export class Article implements IArticle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column()
    description: string;

    @Column()
    content: string;

    @Column()
    image: string;

    @Column()
    thumbnail: string;

    @Column()
    author_id: number;

    @Column()
    hidden: number;

    @Column()
    pinned: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}