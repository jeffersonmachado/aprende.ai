import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as mentorService from './mentor.service.js';

export const sendMentorMessage = asyncHandler(async (req, res) => {
  const data = await mentorService.sendMentorMessage(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});
