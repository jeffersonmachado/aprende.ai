export function requireRoleCodes(allowed = []) {
  const allowedSet = new Set((allowed || []).map((item) => String(item || '').toLowerCase()));

  return (req, res, next) => {
    const membershipRole = String(req.membership?.role?.code || '').toLowerCase();
    const tokenRole = String(req.auth?.roleCode || '').toLowerCase();
    const effectiveRole = membershipRole || tokenRole;

    if (!effectiveRole || !allowedSet.has(effectiveRole)) {
      return res.status(403).json({ error: 'Acesso restrito a perfis administrativos' });
    }

    return next();
  };
}
