import { v4 as uuidv4 } from 'uuid';
import { Assessment, AssessmentAttempt, AssessmentAnswer, AssessmentEvaluation, AssessmentQuestion } from '../../db/models/index.js';
import { AppError } from '../../core/errors/AppError.js';
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
  await AssessmentEvaluation.create({ id: uuidv4(), tenantId, attemptId, evaluatorType: 'ai', modelName: 'pending', overallScore: 0, summaryFeedback: 'Avaliação registrada. A etapa de IA ainda será conectada ao motor final.', detailedFeedbackJson: { status: 'queued' } });
  attempt.status = 'submitted'; attempt.submittedAt = new Date(); attempt.evaluationStatus = 'completed'; attempt.finalScore = 0; await attempt.save(); return attempt;
}
