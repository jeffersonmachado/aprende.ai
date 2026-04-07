import { v4 as uuidv4 } from 'uuid';
import {
  Assessment,
  AssessmentAnswer,
  AssessmentAttempt,
  AssessmentEvaluation,
  AssessmentQuestion,
  AssessmentSubmission,
  Competency,
  CompetencyEvidence
} from '../../db/models/index.js';
import { AppError } from '../../core/errors/AppError.js';
import { chatCompletion } from '../../core/ai/chatCompletion.js';
import { recordGamificationEvent } from '../gamification/gamification.service.js';
import { upsertUserCompetencyScore } from '../competency/competency.service.js';

async function resolveCompetencyReference(tenantId, competencyReference) {
  if (!competencyReference) return null;

  const directById = await Competency.findOne({ where: { tenantId, id: competencyReference } }).catch(() => null);
  if (directById) return directById;

  const normalizedName = String(competencyReference || '').trim();
  if (!normalizedName) return null;

  const [competency] = await Competency.findOrCreate({
    where: { tenantId, name: normalizedName },
    defaults: {
      id: uuidv4(),
      tenantId,
      name: normalizedName,
      type: 'comportamental',
      dimensionsJson: [
        { name: 'K', weight: 0.25, description: 'Conhecimento estruturado' },
        { name: 'A', weight: 0.35, description: 'Aplicacao pratica' },
        { name: 'J', weight: 0.25, description: 'Julgamento' },
        { name: 'C', weight: 0.15, description: 'Consistencia' }
      ]
    }
  });

  return competency;
}
export async function listAssessments(tenantId) { return Assessment.findAll({ where: { tenantId }, order: [['createdAt', 'DESC']] }); }
export async function getAssessment(tenantId, id) {
  const assessment = await Assessment.findOne({ where: { tenantId, id }, include: [{ model: AssessmentQuestion, as: 'questions' }] });
  if (!assessment) throw new AppError('Avaliação não encontrada', 404);
  return assessment;
}
export async function startAttempt(tenantId, userId, assessmentId) { return AssessmentAttempt.create({ id: uuidv4(), tenantId, assessmentId, userId, status: 'in_progress', startedAt: new Date(), evaluationStatus: 'pending' }); }
export async function submitAttempt(tenantId, attemptId, answers = []) {
  const attempt = await AssessmentAttempt.findOne({ where: { id: attemptId, tenantId } });
  if (!attempt) throw new AppError('Tentativa não encontrada', 404);
  for (const item of answers) {
    await AssessmentAnswer.create({ id: uuidv4(), attemptId, questionId: item.questionId, answerText: item.answerText || null, answerJson: item.answerJson || null });
  }

  const aiResult = await evaluateSubmissionWithAI({
    tenantId,
    userId: attempt.userId,
    assessmentId: attempt.assessmentId,
    answers
  });

  await AssessmentEvaluation.create({
    id: uuidv4(),
    tenantId,
    attemptId,
    evaluatorType: 'ai',
    modelName: aiResult.model,
    overallScore: aiResult.score,
    summaryFeedback: aiResult.feedback,
    detailedFeedbackJson: {
      recommendation: aiResult.recommendation,
      nextStep: aiResult.nextStepSuggestion
    }
  });

  await AssessmentSubmission.create({
    id: uuidv4(),
    tenantId,
    userId: attempt.userId,
    assessmentId: attempt.assessmentId,
    assessmentAttemptId: attempt.id,
    submissionText: JSON.stringify(answers),
    submissionJson: { answers },
    aiScore: aiResult.score,
    aiFeedback: aiResult.feedback,
    recommendation: aiResult.recommendation,
    nextStepSuggestion: aiResult.nextStepSuggestion
  });

  await CompetencyEvidence.create({
    id: uuidv4(),
    tenantId,
    userId: attempt.userId,
    competencyId: null,
    sourceType: 'assessment',
    sourceId: attempt.id,
    evidenceText: aiResult.feedback,
    score: aiResult.score,
    metadata: {
      recommendation: aiResult.recommendation,
      nextStepSuggestion: aiResult.nextStepSuggestion
    }
  });

  attempt.status = 'submitted';
  attempt.submittedAt = new Date();
  attempt.evaluationStatus = 'completed';
  attempt.finalScore = aiResult.score;
  await attempt.save();

  return {
    attempt,
    evaluation: aiResult
  };
}

export async function evaluateSubmissionWithAI({ tenantId, userId, assessmentId, answers }) {
  const campaignContext = answers?.[0]?.campaignContext || null;
  const prompt = [
    `Tenant: ${tenantId}`,
    `Usuário: ${userId}`,
    `Assessment: ${assessmentId || 'n/a'}`,
    'Respostas do aprendiz:',
    JSON.stringify(answers, null, 2),
    campaignContext ? `Contexto de campanha: ${JSON.stringify(campaignContext, null, 2)}` : null,
    'Avalie de 0 a 10 e responda em JSON com as chaves: score, feedback, recommendation, nextStepSuggestion.'
  ].filter(Boolean).join('\n');

  const completion = await chatCompletion({
    systemPrompt: 'Você é avaliador pedagógico do aprende.ai. Responda apenas JSON válido.',
    userPrompt: prompt,
    temperature: 0.2,
    maxTokens: 500
  });

  let parsed;
  try {
    parsed = JSON.parse(completion.text);
  } catch {
    parsed = {
      score: 6,
      feedback: completion.text,
      recommendation: 'Revisar fundamentos e praticar mais um cenário.',
      nextStepSuggestion: 'Executar uma simulação de reforço.'
    };
  }

  return {
    model: completion.model,
    score: Number(parsed.score || 0),
    feedback: parsed.feedback || 'Feedback não retornado pela IA.',
    recommendation: parsed.recommendation || 'Sem recomendação específica.',
    nextStepSuggestion: parsed.nextStepSuggestion || 'Seguir para o próximo passo da jornada.'
  };
}

export async function evaluateAssessment(tenantId, userId, payload) {
  const campaignContext = payload?.answers?.[0]?.campaignContext || null;
  const simulationRunId = payload?.simulationRunId ? String(payload.simulationRunId).trim() : null;
  const competency = await resolveCompetencyReference(tenantId, payload.competencyId || campaignContext?.chapterFocus || null);
  const result = await evaluateSubmissionWithAI({
    tenantId,
    userId,
    assessmentId: payload.assessmentId || null,
    answers: payload.answers || []
  });

  const submission = await AssessmentSubmission.create({
    id: uuidv4(),
    tenantId,
    userId,
    assessmentId: payload.assessmentId || null,
    assessmentAttemptId: null,
    submissionText: payload.textAnswer || null,
    submissionJson: {
      ...payload,
      campaignContext,
      simulationRunId,
    },
    aiScore: result.score,
    aiFeedback: result.feedback,
    recommendation: result.recommendation,
    nextStepSuggestion: result.nextStepSuggestion
  });

  await CompetencyEvidence.create({
    id: uuidv4(),
    tenantId,
    userId,
    competencyId: competency?.id || null,
    sourceType: 'assessment',
    sourceId: submission.id,
    evidenceText: result.feedback,
    score: result.score,
    metadata: {
      recommendation: result.recommendation,
      nextStepSuggestion: result.nextStepSuggestion
    }
  });

  if (competency?.id) {
    await upsertUserCompetencyScore(tenantId, userId, competency.id, (Number(result.score || 0) - 5) * 1.6, {
      sourceType: 'assessment',
      evidenceType: 'direct',
      feedback: result.feedback,
      narrative: result.recommendation,
      impact: {
        assertividade: Number(result.score || 0) - 5,
        analise_risco: (Number(result.score || 0) - 5) * 0.8,
        consistencia: 1,
        velocidade: 0
      },
      createdAt: new Date().toISOString()
    });
  }

  await recordGamificationEvent(tenantId, userId, {
    eventType: 'assessment_correct',
    source: 'assessment_submission',
    referenceType: 'assessment_submission',
    referenceId: submission.id,
    metadata: {
      score: Number(result.score || 0)
    }
  });

  return {
    score: result.score,
    feedback: result.feedback,
    recommendation: result.recommendation,
    nextStepSuggestion: result.nextStepSuggestion,
    submissionId: submission.id
  };
}
