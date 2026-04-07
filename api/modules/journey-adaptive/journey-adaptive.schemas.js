import { z } from 'zod';
import { AppError } from '../../core/errors/AppError.js';
import { ADAPTIVE_CHAPTER_TYPES, LEARNING_PROFILES } from './journey-adaptive.constants.js';

const stringArray = z.array(z.string().min(1)).default([]);

export const startDiagnosticSchema = z.object({
  targetCompetencyCode: z.string().min(1).optional(),
  diagnostic: z.object({
    baselineScore: z.number().min(0).max(100).optional(),
    confidence: z.number().min(0).max(100).optional(),
    consistency: z.number().min(0).max(100).optional(),
    errorPatterns: stringArray.optional(),
    successPatterns: stringArray.optional()
  }).optional()
});

export const createAdaptiveJourneySchema = z.object({
  targetCompetencyCode: z.string().min(1),
  learningGoalId: z.string().uuid().optional(),
  learningProfile: z.enum(LEARNING_PROFILES).optional(),
  diagnosis: z.object({
    baselineScore: z.number().min(0).max(100).optional(),
    confidence: z.number().min(0).max(100).optional(),
    consistency: z.number().min(0).max(100).optional(),
    errorPatterns: stringArray.optional(),
    successPatterns: stringArray.optional()
  }).optional()
});

export const decisionSchema = z.object({
  chapterId: z.string().min(1),
  selectedOption: z.string().min(1),
  responseText: z.string().max(4000).optional(),
  outcome: z.object({
    scoreHint: z.number().min(0).max(100).optional(),
    confidenceHint: z.number().min(0).max(100).optional(),
    evidenceText: z.string().max(4000).optional(),
    successTags: stringArray.optional(),
    errorTags: stringArray.optional()
  }).optional()
});

export const recalculateJourneySchema = z.object({
  force: z.boolean().optional(),
  reason: z.string().max(300).optional()
});

export const completeJourneySchema = z.object({
  reason: z.string().max(300).optional()
});

export function parsePayload(schema, payload, message = 'Payload inválido') {
  const result = schema.safeParse(payload || {});
  if (!result.success) {
    throw new AppError(message, 422, result.error.flatten());
  }
  return result.data;
}

export function assertValidChapterType(value) {
  if (!ADAPTIVE_CHAPTER_TYPES.includes(value)) {
    throw new AppError(`Tipo de capítulo inválido: ${value}`, 422);
  }
}
