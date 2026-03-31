export function hasSystemAccess(user) {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  const email = String(user.email || '').toLowerCase();
  return ['admin', 'tech_admin', 'ops', 'owner'].includes(role) || email.includes('admin');
}