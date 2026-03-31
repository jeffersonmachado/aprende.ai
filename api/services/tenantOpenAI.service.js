import { Tenant } from '../db/models/index.js';
import { decryptString, encryptString } from '../core/security/encryption.js';

function ensureSettings(settings) {
  return settings && typeof settings === 'object' ? settings : {};
}

export async function getTenantOpenAIConfig(tenantId) {
  const tenant = await Tenant.findByPk(tenantId);
  const settings = ensureSettings(tenant?.settings);
  const encrypted = settings?.ai?.openaiTokenEncrypted || null;
  const hasTenantToken = Boolean(encrypted);

  return {
    configured: hasTenantToken || Boolean(process.env.OPENAI_API_KEY),
    source: hasTenantToken ? 'tenant' : (process.env.OPENAI_API_KEY ? 'environment' : 'none')
  };
}

export async function getTenantOpenAIKey(tenantId) {
  const tenant = await Tenant.findByPk(tenantId);
  const settings = ensureSettings(tenant?.settings);
  const encrypted = settings?.ai?.openaiTokenEncrypted || null;

  if (!encrypted) {
    return process.env.OPENAI_API_KEY || null;
  }

  const decrypted = decryptString(encrypted);
  return decrypted || process.env.OPENAI_API_KEY || null;
}

export async function saveTenantOpenAIKey(tenantId, token) {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) {
    return { configured: false, source: 'none' };
  }

  const settings = ensureSettings(tenant.settings);
  const encrypted = encryptString(token);

  tenant.settings = {
    ...settings,
    ai: {
      ...(settings.ai || {}),
      openaiTokenEncrypted: encrypted
    }
  };

  await tenant.save();
  return getTenantOpenAIConfig(tenantId);
}
