import { Injectable } from "@nestjs/common";
import { FindOptionsWhere } from 'typeorm';
import { CustomResponseService } from 'nestjs-custom-response';
import { IPaginationOptions } from "nestjs-typeorm-paginate";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../entities/user.entity";
import { UsersRepository } from "../users.repository";

@Injectable()
export class UsersService {
  constructor(
      private readonly repository : UsersRepository
  ) {}

  public async getUser(customResponse : CustomResponseService, id : number | string): Promise<CustomResponseService> {
    let whereOptions : FindOptionsWhere<User> | FindOptionsWhere<User>[] = [{ username: String(id) }, { id: Number(id) }];
    
    return this.repository.getOneBy(customResponse, whereOptions);
  }

  public async paginateUsers(customResponse : CustomResponseService, options : IPaginationOptions) : Promise<CustomResponseService> {
    return this.repository.paginate(customResponse, options);
  }

  public async findUser(identification : string) : Promise<User> {
            
    let whereOptions : FindOptionsWhere<User> | FindOptionsWhere<User>[] = [{ username: identification }, {email: identification}];

    return this.repository.findOne({where: whereOptions});
  }

  public async updateUser(customResponse : CustomResponseService, userId : number, partialEntity: QueryDeepPartialEntity<User>) : Promise<CustomResponseService> {
    return this.repository.updateEntity(customResponse, userId, partialEntity);
  }
}