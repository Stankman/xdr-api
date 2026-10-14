import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';

export function registrationPlayerName(email: string): string {
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) {
    throw new BadRequestException('A valid registration email is required.');
  }
  const prefix =
    email
      .slice(0, separator)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 8) || 'player';
  return `${prefix}_${randomBytes(3).toString('hex')}`;
}
