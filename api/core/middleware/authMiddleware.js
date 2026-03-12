import { verifyJwt } from '../auth/jwt.js';

export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');
  if (!token) return res.status(401).json({ error: 'Token não informado' });
  try {
    req.auth = verifyJwt(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
