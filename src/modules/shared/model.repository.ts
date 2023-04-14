import { plainToInstance } from "class-transformer";
import { FindManyOptions, FindOptionsWhere, ObjectID, Repository, UpdateResult } from "typeorm";
import { IPaginationMeta, IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { NoSuchEntityException } from "src/common/exceptions/nosuchentity.exception";

export class ModelRepository<T, K extends ModelEntitySerializer> extends Repository<T> {
    
  public async getOneBy(whereOptions: FindOptionsWhere<T> | FindOptionsWhere<T>[], relations : string[] = [], throwsException : boolean = true,  transformOptions? : any): Promise<K> {
    return this.findOne({
      where: whereOptions,
      relations
    }).then(entity => {
      if(!entity && throwsException) {
        throw new NoSuchEntityException();
      }

      return entity ? this.transform(entity, transformOptions) : null;
    });
  }

  public async paginate(options : IPaginationOptions, searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>) : Promise<Pagination<K, IPaginationMeta>> {
    return paginate<T>(this, options, searchOptions).then(pagination => {
      const items = this.transformMany(pagination.items);

      let _pagination = new Pagination<K, IPaginationMeta>(items, pagination.meta, pagination.links);

      return _pagination;
    });
  }

  public transform(model : T, transformOptions : any = {}) : K {
    return plainToInstance(ModelEntitySerializer, model, transformOptions) as K;
  }

  public transformMany(models : T[], transformOptions : any = {}) : K[] {
    return models.map(model => this.transform(model, transformOptions));
  }
}