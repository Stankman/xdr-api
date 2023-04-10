import { Injectable } from "@nestjs/common";
import { FindOptionsWhere } from 'typeorm';
import { CustomResponseService } from 'nestjs-custom-response';
import { IPaginationMeta, IPaginationOptions, Pagination } from "nestjs-typeorm-paginate";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../entities/user.entity";
import { UsersRepository } from "../users.repository";

@Injectable()
export class UsersService {
  constructor(
      private readonly repository : UsersRepository
  ) {}

  public async paginateUsers(options : IPaginationOptions) : Promise<Pagination<User, IPaginationMeta>> {
    return this.repository.paginate(options);
  }

  public async findUser(identification : string) : Promise<User> {
            
    let whereOptions : FindOptionsWhere<User> | FindOptionsWhere<User>[] = [{ username: identification }, {email: identification}];

    return this.repository.findOne({where: whereOptions});
  }

  // public async updateUser(userId : number, partialEntity: QueryDeepPartialEntity<User>) : Promise<User> {
  //   return this.repository.update(userId, partialEntity).then((entity : User)=> {
  //     return entity;
  //   });
  // }
}