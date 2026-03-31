import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import api, { setAuthToken, setUnauthorizedHandler } from './api';

describe('services/api', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    setAuthToken(null);
    setUnauthorizedHandler(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
  });

  test('api.get faz request com header json e retorna payload', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ ok: true, items: [1, 2] })
    });

    const result = await api.get('/health');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/health');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(result).toEqual({ ok: true, items: [1, 2] });
  });

  test('api.post envia method/body e retorna payload', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ id: 'created-1' })
    });

    const payload = { name: 'Teste' };
    const result = await api.post('/items', payload);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/items');
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify(payload));
    expect(result).toEqual({ id: 'created-1' });
  });

  test('lança erro com texto da resposta quando request falha', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValueOnce('Falha de validação')
    });

    await expect(api.get('/erro')).rejects.toThrow('Falha de validação');
  });

  test('lança erro padrão quando resposta falha sem mensagem', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValueOnce('')
    });

    await expect(api.get('/erro-vazio')).rejects.toThrow('Erro na requisição');
  });

  test('envia Authorization quando token existe', async () => {
    setAuthToken('token-abc');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ ok: true })
    });

    await api.get('/privado');

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer token-abc');
  });

  test('executa handler de não autorizado quando recebe 401', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValueOnce('Não autorizado')
    });

    await expect(api.get('/privado')).rejects.toThrow('Não autorizado');
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
