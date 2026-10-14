import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rule = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rule) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const address = request.ip || request.socket.remoteAddress || 'unknown';
    const key = `${request.method}:${request.route?.path ?? request.path}:${address}`;
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      if (this.buckets.size >= 10_000) {
        for (const [entryKey, entry] of this.buckets) {
          if (entry.resetAt <= now) this.buckets.delete(entryKey);
        }
      }
      if (this.buckets.size >= 10_000) {
        throw new HttpException('Authentication rate limit exceeded.', HttpStatus.TOO_MANY_REQUESTS);
      }
      bucket = { count: 0, resetAt: now + rule.windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > rule.limit) {
      throw new HttpException('Authentication rate limit exceeded.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
