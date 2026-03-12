import { Tenant } from '../../db/models/index.js';

export async function tenantResolver(req, res, next) {
  const slug = req.headers['x-tenant-slug'];
  if (!slug) return res.status(400).json({ error: 'Header x-tenant-slug não informado' });
  const tenant = await Tenant.findOne({ where: { slug, status: 'active' } });
  if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });
  req.tenant = tenant;
  next();
}
