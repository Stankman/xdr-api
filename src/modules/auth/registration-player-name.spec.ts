import { BadRequestException } from '@nestjs/common';
import { registrationPlayerName } from './registration-player-name';

describe('Registration player-name candidates', () => {
  it.each([
    ['Alice@example.com', 'alice'],
    ['alice+tag@example.com', 'alicetag'],
    ['averylonglocalpart@example.com', 'averylon'],
    ['a@example.com', 'a'],
    ['___@example.com', '___'],
    ['!!!@example.com', 'player'],
    ['é@example.com', 'player'],
  ])(
    'fits the candidate derived from %s to the game name limits',
    (email, prefix) => {
      const candidate = registrationPlayerName(email);
      expect(candidate).toMatch(new RegExp(`^${prefix}_[a-f0-9]{6}$`));
      expect(candidate.length).toBeGreaterThanOrEqual(3);
      expect(candidate.length).toBeLessThanOrEqual(15);
      expect(candidate).toMatch(/^[a-z0-9_]+$/);
      expect(candidate).not.toContain('@');
      expect(candidate).not.toContain('example.com');
    },
  );

  it.each(['', 'missing-domain', '@example.com', 'alice@'])(
    'rejects an unusable registration email: %s',
    (email) => {
      expect(() => registrationPlayerName(email)).toThrow(BadRequestException);
    },
  );
});
