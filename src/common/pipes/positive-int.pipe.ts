import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Value must be a positive integer.');
    }
    return parsed;
  }
}
