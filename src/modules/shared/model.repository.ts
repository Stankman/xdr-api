import { plainToClass } from "class-transformer";
import { FindOptionsWhere, ObjectID, Repository, UpdateResult } from "typeorm";
import { IPaginationMeta, IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { BanException } from "../auth/exceptions/ban.exception";
import { NoSuchEntityException } from "src/common/exceptions/nosuchentity.exception";

export class ModelRepository<T, K extends ModelEntitySerializer> extends Repository<T> {
    
  public async getOneBy(whereOptions: FindOptionsWhere<T> | FindOptionsWhere<T>[], relations : string[] = [], throwsException : boolean = true): Promise<T|K> {
    return this.findOne({
      where: whereOptions,
      relations: relations
    }).then(entity => {
      if(!entity && throwsException) {
        throw new NoSuchEntityException();
      }

      return entity ? this.transform(entity) : null;
    });
  }

  public async updateEntity(criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>, throwsException : boolean = true) : Promise<T|K|UpdateResult> {
    return this.update(criteria, partialEntity).then(
      entity => {
        if(!entity && throwsException) {
          throw new NoSuchEntityException();
        }
  
        return entity ?? null
      }
    )
  }

  public async paginate(options : IPaginationOptions) : Promise<Pagination<T, IPaginationMeta>> {
    return paginate<T>(this, options).then(pagination => {
      return pagination;
    });
  }

  public transform(model : T, transformOptions : any = {}) : K {
    return plainToClass(ModelEntitySerializer, model, transformOptions) as K;
  }

  public transformMany(models : T[], transformOptions : any = {}) : K[] {
    return models.map(model => this.transform(model, transformOptions));
  }
}