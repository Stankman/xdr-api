import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IBan } from "../interfaces/ban.interface";

@Entity({ name: 'bans' })
export class Ban implements IBan {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    user_id: number;

    @Column()
    ip: string;

    @Column()
    machine_id: string;
    
    @Column()
    user_staff_id: number;
    
    @Column()
    timestamp: number;
    
    @Column()
    ban_expire: number;
    
    @Column()
    ban_reason: string;
    
    @Column()
    type: string;
    
    @Column()
    cfh_topic: string;
}