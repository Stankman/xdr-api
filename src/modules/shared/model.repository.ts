import { plainToClass } from "class-transformer";
import { FindOptionsWhere, ObjectID, Repository } from "typeorm";
import { CustomResponseService } from 'nestjs-custom-response';
import { IPaginationMeta, IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";

export class ModelRepository<T, K extends ModelEntitySerializer> extends Repository<T> {
    
  public async getOneBy(customResponse : CustomResponseService, whereOptions: FindOptionsWhere<T> | FindOptionsWhere<T>[], relations : string[] = [], throwsException : boolean = true): Promise<CustomResponseService> {
    return this.findOne({
      where: whereOptions,
      relations: relations
    }).then(entity => {
      if(!entity && throwsException) {
        return customResponse.makeErrorResponse("response.error.notFound", 450);
      }

      return customResponse.makeResponseResponse("response.message.successfully", 200, (entity ? this.transform(entity) : null));
    });
  }

  public async updateEntity(customResponse : CustomResponseService, criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>, throwsException : boolean = true) : Promise<CustomResponseService> {
    return this.update(criteria, partialEntity).then(
      entity => {
        if(!entity && throwsException) {
          return customResponse.makeErrorResponse("response.error.notFound", 450);
        }
  
        return customResponse.makeResponseResponse("response.message.successfully", 200, entity ?? null);
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