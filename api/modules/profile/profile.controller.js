import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as profileService from './profile.service.js';

export const getProfileOverview = asyncHandler(async (req, res) => {
  const data = await profileService.getProfileOverview(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const saveOnboarding = asyncHandler(async (req, res) => {
  const data = await profileService.saveOnboarding(req.tenant.id, req.auth.userId, req.body);
  res.status(201).json(data);
});

export const saveLearningGoal = asyncHandler(async (req, res) => {
  const data = await profileService.saveLearningGoal(req.tenant.id, req.auth.userId, req.body);
  res.status(201).json(data);
});

export const saveLearningStyle = asyncHandler(async (req, res) => {
  const data = await profileService.saveLearningStyle(req.tenant.id, req.auth.userId, req.body);
  res.status(201).json(data);
});
