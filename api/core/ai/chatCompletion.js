import { AppError } from '../errors/AppError.js';
import { getOpenAIClient } from './openaiClient.js';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function chatCompletion({
  systemPrompt,
  userPrompt,
  apiKey,
  model = DEFAULT_MODEL,
  temperature = 0.3,
  maxTokens = 700
}) {
  const client = getOpenAIClient(apiKey);
  if (!client) {
    throw new AppError('OPENAI_API_KEY não configurada no ambiente', 500);
  }

  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: userPrompt }
  ];

  const response = await client.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages
  });

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new AppError('Resposta vazia do provedor de IA', 502);
  }

  return {
    text,
    model: response.model || model,
    usage: response.usage || null
  };
}
