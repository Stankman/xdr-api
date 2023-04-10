import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { CustomResponse } from '../common/models/custom-response.model';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    return next.handle().pipe(
      map((data) => {
        if(data instanceof CustomResponse) {
          return data.setCode(200).getJSON();
        } else {
          return new CustomResponse().setCode(200).setData(data).getJSON();
        }
      })
    );
  }
}
