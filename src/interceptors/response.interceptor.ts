import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { CustomResponse } from '../common/models/custom-response.model';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    return next.handle().pipe(
      map((data) => {
        return data;
      })
    );
  }
}
