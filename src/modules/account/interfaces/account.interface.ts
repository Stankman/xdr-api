export interface IAccount {
    id: number;
    email: string;
    password: string;
    created_at?: Date;
    updated_at: Date;
}