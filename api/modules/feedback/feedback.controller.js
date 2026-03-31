import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as feedbackService from './feedback.service.js';

export const generateFeedback = asyncHandler(async (req, res) => {
  const data = await feedbackService.generateDecisionFeedback(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});
