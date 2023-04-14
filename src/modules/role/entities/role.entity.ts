import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IRole } from "../interfaces/role.interface";

@Entity({ name: 'roles' })
export class Role implements IRole {
    @ApiProperty({ example: 1, description: 'The role ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 1, description: 'The name of the role'})
    @Column()
    name: string;

    @ApiProperty({ example: 1, description: 'The description of the role'})
    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;
}