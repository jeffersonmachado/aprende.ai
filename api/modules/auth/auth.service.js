import { TenantUser, User, Role } from '../../db/models/index.js';
import { comparePassword } from '../../utils/password.js';
import { signJwt } from '../../core/auth/jwt.js';
import { AppError } from '../../core/errors/AppError.js';

export async function login({ tenantId, email, password }) {
  const user = await User.findOne({ where: { email, status: 'active' } });
  if (!user) throw new AppError('Credenciais inválidas', 401);
  const membership = await TenantUser.findOne({ where: { tenantId, userId: user.id, status: 'active' }, include: [{ model: Role, as: 'role' }] });
  if (!membership) throw new AppError('Usuário não vinculado ao tenant', 403);
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new AppError('Credenciais inválidas', 401);
  const token = signJwt({ userId: user.id, tenantId, roleCode: membership.role?.code || 'user' });
  return { token, user: { id: user.id, name: user.name, email: user.email }, role: membership.role?.code || 'user' };
}

export async function me({ userId, tenantId }) {
  const membership = await TenantUser.findOne({ where: { tenantId, userId, status: 'active' }, include: [{ model: User, as: 'user' }, { model: Role, as: 'role' }] });
  if (!membership) throw new AppError('Usuário não encontrado no tenant', 404);
  return { id: membership.user.id, name: membership.user.name, email: membership.user.email, role: membership.role?.code || 'user' };
}
