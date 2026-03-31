import OpenAI from 'openai';

const clientsByKey = new Map();

function normalizeToken(token) {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  return trimmed || null;
}

export function getOpenAIClient(explicitApiKey) {
  const apiKey = normalizeToken(explicitApiKey) || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!clientsByKey.has(apiKey)) {
    clientsByKey.set(apiKey, new OpenAI({ apiKey }));
  }

  return clientsByKey.get(apiKey);
}
