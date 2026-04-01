import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as gamificationService from './gamification.service.js';

export const getMyGamificationSummary = asyncHandler(async (req, res) => {
  const data = await gamificationService.getGamificationSummary(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const getRecentEvents = asyncHandler(async (req, res) => {
  const data = await gamificationService.listRecentGamificationEvents(
    req.tenant.id,
    req.auth.userId,
    req.query.limit
  );
  res.json(data);
});

export const postCheckIn = asyncHandler(async (req, res) => {
  const data = await gamificationService.recordDailyCheckIn(req.tenant.id, req.auth.userId);
  res.status(201).json(data);
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const data = await gamificationService.getGamificationLeaderboard(
    req.tenant.id,
    req.query.limit
  );
  res.json(data);
});

export const getRewardRules = asyncHandler(async (req, res) => {
  const data = await gamificationService.listRewardRules(req.tenant.id);
  res.json(data);
});

export const putRewardRule = asyncHandler(async (req, res) => {
  const data = await gamificationService.upsertRewardRule(req.tenant.id, req.body);
  res.json(data);
});

export const getLevelRules = asyncHandler(async (req, res) => {
  const data = await gamificationService.listLevelRules(req.tenant.id);
  res.json(data);
});

export const putLevelRule = asyncHandler(async (req, res) => {
  const data = await gamificationService.upsertLevelRule(req.tenant.id, req.body);
  res.json(data);
});
