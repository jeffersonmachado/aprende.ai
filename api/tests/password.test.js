import { comparePassword, hashPassword } from '../utils/password.js';

describe('password utils', () => {
  test('gera hash e valida senha correta', async () => {
    const hash = await hashPassword('senha-forte-123');

    expect(hash).toBeTruthy();
    expect(hash).not.toBe('senha-forte-123');
    await expect(comparePassword('senha-forte-123', hash)).resolves.toBe(true);
  });

  test('rejeita senha incorreta', async () => {
    const hash = await hashPassword('senha-correta');

    await expect(comparePassword('senha-errada', hash)).resolves.toBe(false);
  });
});
