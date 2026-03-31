import { signJwt, verifyJwt } from '../core/auth/jwt.js';

describe('jwt utils', () => {
  test('assina e valida token com payload', () => {
    const token = signJwt({ sub: 'user-123', role: 'student' });
    const decoded = verifyJwt(token);

    expect(decoded.sub).toBe('user-123');
    expect(decoded.role).toBe('student');
    expect(decoded.exp).toBeDefined();
  });

  test('lança erro para token inválido', () => {
    expect(() => verifyJwt('token-invalido')).toThrow();
  });
});
