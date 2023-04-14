import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IBan } from "../interfaces/ban.interface";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'bans' })
export class Ban implements IBan {
    @ApiProperty({ example: 1, description: 'The ban ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 1, description: 'The user ID of the banned user'})
    @Column()
    user_id: number;

    @ApiProperty({ example: '127.0.0.1', description: 'The user IP of the banned user' })
    @Column()
    ip: string;

    @ApiProperty({ example: '', description: 'No description yet' })
    @Column()
    machine_id: string;
    
    @ApiProperty({ example: 1, description: 'The staff user ID who banned the user'})
    @Column()
    user_staff_id: number;
    
    @ApiProperty({ description: 'UNIX Timestamp when the ban was created'})
    @Column()
    timestamp: number;
    
    @ApiProperty({ description: 'UNIX Timestamp when the ban expires'})
    @Column()
    ban_expire: number;
    
    @ApiProperty({ description: 'The reason why the ban was created'})
    @Column()
    ban_reason: string;
    
    @ApiProperty({ examples: ['account', 'ip', 'machine', 'super'], description: 'The ban type: `account` type bans only one user ID, `ip` type bans all accounts using that IP Address value, `machine` type is unknown, `super` type bans all three previous types'})
    @Column()
    type: string;
    
    @ApiProperty({ description: 'No description yet'})
    @Column()
    cfh_topic: string;
}