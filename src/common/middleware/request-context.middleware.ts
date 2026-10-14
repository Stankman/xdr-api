import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export interface RequestWithContext extends Request {
  requestId: string;
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: RequestWithContext, response: Response, next: NextFunction): void {
    const suppliedId = request.header('x-request-id')?.trim();
    request.requestId =
      suppliedId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        suppliedId,
      )
        ? suppliedId
        : randomUUID();
    response.setHeader('X-Request-Id', request.requestId);
    next();
  }
}
