import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IArticle } from "../interfaces/article.interface";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { BooleanEnum } from "src/common/models/boolean.model";
import { BooleanTransformer } from "src/common/transformers/boolean.transformer";

@Entity({ name: 'xdr_articles'})
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
    
    @ManyToOne(() => Avatar, avatar => avatar.articles)
    @JoinColumn({name: 'author_id'})
    author: Avatar;

    @Column({
        type: 'enum',
        enum: BooleanEnum,
        transformer: new BooleanTransformer()
    })
    hidden: boolean;

    @Column({
        type: 'enum',
        enum: BooleanEnum,
        transformer: new BooleanTransformer()
    })
    pinned: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}