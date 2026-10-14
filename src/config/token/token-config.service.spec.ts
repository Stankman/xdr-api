import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenConfigService } from './token-config.service';

describe('JWT duration configuration', () => {
  it.each(['1800s', '2 days', '1h', '5000', '1.5 hours'])(
    'accepts existing JWT time spans: %s',
    (duration) => {
      const service = new TokenConfigService(
        new ConfigService({ token: { duration } }),
      );
      expect(service.duration).toBe(duration);
      const jwt = new JwtService({
        secret: 'test-only-secret',
        signOptions: { expiresIn: service.duration },
      });
      expect(jwt.verify(jwt.sign({ uid: 1 })).uid).toBe(1);
    },
  );

  it.each([undefined, '', 'garbage', '10 elephants'])(
    'reports invalid duration: %s',
    (duration) => {
      const service = new TokenConfigService(
        new ConfigService({ token: { duration } }),
      );
      expect(() => service.duration).toThrow('TOKEN_DURATION');
    },
  );
});
