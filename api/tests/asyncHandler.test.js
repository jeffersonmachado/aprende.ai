import asyncHandler from '../core/http/asyncHandler.js';
import { jest } from '@jest/globals';

describe('asyncHandler', () => {
  test('encaminha erros assíncronos para next', async () => {
    const error = new Error('falha async');
    const next = jest.fn();

    const wrapped = asyncHandler(async () => {
      throw error;
    });

    wrapped({}, {}, next);

    await Promise.resolve();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('não chama next em execução bem-sucedida', async () => {
    const next = jest.fn();

    const wrapped = asyncHandler(async () => {
      return 'ok';
    });

    wrapped({}, {}, next);

    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
  });
});
