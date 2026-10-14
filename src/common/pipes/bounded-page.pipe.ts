import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class BoundedPagePipe implements PipeTransform<string | undefined, number> {
  transform(value?: string): number {
    const parsed = value === undefined ? 1 : Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100_000) {
      throw new BadRequestException('page must be an integer between 1 and 100000.');
    }
    return parsed;
  }
}
