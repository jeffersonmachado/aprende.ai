import { AppError } from '../errors/AppError.js';

export function errorHandler(err, req, res, _next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const payload = { error: err.message || 'Erro interno do servidor' };
  if (err instanceof AppError && err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && !(err instanceof AppError)) payload.stack = err.stack;
  res.status(statusCode).json(payload);
}
