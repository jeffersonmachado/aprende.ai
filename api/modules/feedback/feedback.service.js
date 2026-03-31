import { LearnerProfile, LearningStyleProfile } from '../../db/models/index.js';
import { generateFeedback } from '../../services/adaptiveEngine.service.js';
import { getTenantOpenAIKey } from '../../services/tenantOpenAI.service.js';

export async function generateDecisionFeedback(tenantId, userId, payload) {
  const apiKey = await getTenantOpenAIKey(tenantId);
  const [userProfile, learningStyle] = await Promise.all([
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningStyleProfile.findOne({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] })
  ]);

  const feedback = await generateFeedback({
    decision: payload.decision,
    userProfile,
    learningStyle,
    style: payload.style || learningStyle?.mentorshipStyle || learningStyle?.dominantStyle || 'analitico',
    apiKey
  });

  return {
    style: payload.style || learningStyle?.mentorshipStyle || 'analitico',
    feedback
  };
}
