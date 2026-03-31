import { AppError } from '../core/errors/AppError.js';

describe('AppError', () => {
  test('usa valores padrão quando statusCode e details não são informados', () => {
    const err = new AppError('erro padrão');

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
    expect(err.message).toBe('erro padrão');
    expect(err.statusCode).toBe(400);
    expect(err.details).toBeNull();
  });

  test('aceita statusCode e details customizados', () => {
    const details = { field: 'email' };
    const err = new AppError('erro customizado', 422, details);

    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual(details);
  });
});
