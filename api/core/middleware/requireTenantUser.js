import { Role, TenantUser, User } from '../../db/models/index.js';

export async function requireTenantUser(req, res, next) {
  if (!req.auth?.userId || !req.tenant?.id) return res.status(401).json({ error: 'Contexto de autenticação inválido' });
  const membership = await TenantUser.findOne({
    where: { tenantId: req.tenant.id, userId: req.auth.userId, status: 'active' },
    include: [
      { model: User, as: 'user' },
      { model: Role, as: 'role' }
    ]
  });
  if (!membership) return res.status(403).json({ error: 'Usuário não pertence ao tenant informado' });
  req.membership = membership;
  req.user = membership.user;
  next();
}
