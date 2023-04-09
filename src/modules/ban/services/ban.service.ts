import { Injectable } from "@nestjs/common";
import { CustomResponseService } from "nestjs-custom-response";
import { IPaginationOptions } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, LessThan } from "typeorm";
import { BanRepository } from "../ban.repository";
import { Ban } from "../entities/ban.entity";

@Injectable()
export class BanService {
    constructor(private readonly repository : BanRepository) {}


    public async paginateBans(customResponse : CustomResponseService, options : IPaginationOptions) : Promise<CustomResponseService> {
        return this.repository.paginate(customResponse, options);
    }

    public async getBan(value : string | number) : Promise<Ban | null> {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const whereOptions: FindOptionsWhere<Ban>[] = [
            { 
              timestamp: LessThan(currentTimestamp),
              user_id: !isNaN(Number(value)) ? Number(value) : 0,
            },
            { 
              timestamp: LessThan(currentTimestamp),
              ip: String(value),
            },
            { 
              timestamp: LessThan(currentTimestamp),
              machine_id: String(value),
            }
        ];

        return this.repository.findOne({
            where: whereOptions
        }).then(entity => {
            return entity ?? null;
        });
    }
}
