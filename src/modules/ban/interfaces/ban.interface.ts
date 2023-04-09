export interface IBan {
    id : number;
    user_id : number;
    ip : string;
    machine_id : string;
    user_staff_id : number;
    timestamp : number;
    ban_expire : number;
    ban_reason : string;
    type : string;
    cfh_topic : string;
}