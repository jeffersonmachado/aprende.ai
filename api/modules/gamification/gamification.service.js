import { v4 as uuidv4 } from 'uuid';
import {
  Achievement,
  GamificationEvent,
  IntegrationEvent,
  LevelRule,
  RewardRule,
  User,
  UserAchievement,
  UserProgression,
  UserStreak
} from '../../db/models/index.js';

const DEFAULT_REWARD_RULES = [
  { eventType: 'stage_completed', xpAmount: 30, metadata: { streakEligible: true } },
  { eventType: 'journey_completed', xpAmount: 120, metadata: { streakEligible: true } },
  { eventType: 'mentor_interaction', xpAmount: 12, metadata: { streakEligible: true } },
  { eventType: 'assessment_correct', xpAmount: 22, metadata: { streakEligible: true } },
  { eventType: 'competency_improved', xpAmount: 28, metadata: { streakEligible: true } },
  { eventType: 'daily_return', xpAmount: 15, metadata: { streakEligible: true } }
];

const DEFAULT_LEVEL_RULES = [
  { level: 1, xpRequired: 0, title: 'Explorador' },
  { level: 2, xpRequired: 120, title: 'Praticante' },
  { level: 3, xpRequired: 280, title: 'Executor' },
  { level: 4, xpRequired: 480, title: 'Estrategista' },
  { level: 5, xpRequired: 760, title: 'Catalisador' },
  { level: 6, xpRequired: 1120, title: 'Mentor em Formacao' },
  { level: 7, xpRequired: 1560, title: 'Mestre de Jornada' }
];

const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'first_step',
    title: 'Primeiro passo',
    description: 'Concluiu sua primeira etapa de jornada.',
    category: 'journey',
    icon: 'flag',
    criteriaJson: { type: 'event_count', eventType: 'stage_completed', minCount: 1 },
    xpReward: 25
  },
  {
    code: 'mentor_connected',
    title: 'Conexao com mentor',
    description: 'Interagiu com o mentor por 5 vezes.',
    category: 'mentor',
    icon: 'sparkles',
    criteriaJson: { type: 'event_count', eventType: 'mentor_interaction', minCount: 5 },
    xpReward: 40
  },
  {
    code: 'streak_3',
    title: 'Ritmo consistente',
    description: 'Manteve 3 dias consecutivos de atividade.',
    category: 'consistency',
    icon: 'flame',
    criteriaJson: { type: 'streak', minStreak: 3 },
    xpReward: 30
  },
  {
    code: 'level_4',
    title: 'Estrategista emergente',
    description: 'Chegou ao nivel 4 de progressao.',
    category: 'progression',
    icon: 'target',
    criteriaJson: { type: 'level', minLevel: 4 },
    xpReward: 60
  }
];

function toISODate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function resolveLevel(levelRules, totalXp) {
  const ordered = [...levelRules].sort((a, b) => a.xpRequired - b.xpRequired);
  let current = ordered[0] || { level: 1, xpRequired: 0 };
  let next = null;

  for (const rule of ordered) {
    if (totalXp >= rule.xpRequired) {
      current = rule;
      continue;
    }
    next = rule;
    break;
  }

  return {
    currentLevel: current.level,
    xpInCurrentLevel: Math.max(0, totalXp - current.xpRequired),
    xpToNextLevel: next ? Math.max(0, next.xpRequired - totalXp) : 0
  };
}

async function ensureDefaults(tenantId) {
  const [rulesCount, levelsCount, achievementsCount] = await Promise.all([
    RewardRule.count({ where: { tenantId } }),
    LevelRule.count({ where: { tenantId } }),
    Achievement.count({ where: { tenantId } })
  ]);

  if (!rulesCount) {
    await RewardRule.bulkCreate(
      DEFAULT_REWARD_RULES.map((rule) => ({
        id: uuidv4(),
        tenantId,
        eventType: rule.eventType,
        xpAmount: rule.xpAmount,
        metadata: rule.metadata,
        active: true
      }))
    );
  }

  if (!levelsCount) {
    await LevelRule.bulkCreate(
      DEFAULT_LEVEL_RULES.map((rule) => ({
        id: uuidv4(),
        tenantId,
        level: rule.level,
        xpRequired: rule.xpRequired,
        title: rule.title,
        perksJson: [],
        active: true
      }))
    );
  }

  if (!achievementsCount) {
    await Achievement.bulkCreate(
      DEFAULT_ACHIEVEMENTS.map((achievement) => ({
        id: uuidv4(),
        tenantId,
        ...achievement,
        active: true
      }))
    );
  }
}

async function getOrCreateProgression(tenantId, userId) {
  const [progression] = await UserProgression.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      xpTotal: 0,
      currentLevel: 1,
      xpInCurrentLevel: 0,
      xpToNextLevel: 120,
      lastEventAt: null
    }
  });

  return progression;
}

async function getOrCreateStreak(tenantId, userId) {
  const [streak] = await UserStreak.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      lastEventAt: null
    }
  });

  return streak;
}

function shouldCountForStreak(rule, eventType) {
  if (rule?.metadata?.streakEligible === true) {
    return true;
  }

  return eventType === 'daily_return';
}

async function evaluateAchievements({ tenantId, userId, sourceEventId, progression, streak }) {
  const [achievements, unlocked] = await Promise.all([
    Achievement.findAll({ where: { tenantId, active: true }, order: [['createdAt', 'ASC']] }),
    UserAchievement.findAll({ where: { tenantId, userId } })
  ]);

  const unlockedSet = new Set(unlocked.map((item) => item.achievementId));
  const eventCounters = {};

  const eventTypes = [...new Set(
    achievements
      .map((item) => item.criteriaJson?.eventType)
      .filter(Boolean)
  )];

  await Promise.all(eventTypes.map(async (eventType) => {
    const count = await GamificationEvent.count({ where: { tenantId, userId, eventType } });
    eventCounters[eventType] = count;
  }));

  const newlyUnlocked = [];

  for (const achievement of achievements) {
    if (unlockedSet.has(achievement.id)) {
      continue;
    }

    const criteria = achievement.criteriaJson || {};
    let isMet = false;

    if (criteria.type === 'event_count') {
      const eventType = String(criteria.eventType || '');
      const minCount = Number(criteria.minCount || 1);
      isMet = Number(eventCounters[eventType] || 0) >= minCount;
    } else if (criteria.type === 'streak') {
      isMet = Number(streak.currentStreak || 0) >= Number(criteria.minStreak || 1);
    } else if (criteria.type === 'level') {
      isMet = Number(progression.currentLevel || 1) >= Number(criteria.minLevel || 1);
    } else if (criteria.type === 'xp') {
      isMet = Number(progression.xpTotal || 0) >= Number(criteria.minXp || 0);
    }

    if (!isMet) {
      continue;
    }

    const userAchievement = await UserAchievement.create({
      id: uuidv4(),
      tenantId,
      userId,
      achievementId: achievement.id,
      sourceEventId,
      unlockedAt: new Date()
    });

    if (achievement.xpReward > 0) {
      progression.xpTotal = Number(progression.xpTotal || 0) + Number(achievement.xpReward || 0);
    }

    newlyUnlocked.push({
      id: userAchievement.id,
      code: achievement.code,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      icon: achievement.icon,
      xpReward: Number(achievement.xpReward || 0)
    });
  }

  return newlyUnlocked;
}

async function logAdminRuleChange(tenantId, payload) {
  await IntegrationEvent.create({
    id: uuidv4(),
    tenantId,
    sourceSystem: 'gamification-admin',
    eventType: 'gamification_rule_updated',
    direction: 'outbound',
    status: 'processed',
    payload,
    processedAt: new Date()
  });
}

export async function recordGamificationEvent(tenantId, userId, payload = {}) {
  await ensureDefaults(tenantId);

  const eventType = String(payload.eventType || '').trim();
  if (!eventType) {
    throw new Error('eventType é obrigatório para gamificação.');
  }

  const [rule, progression, streak, levelRules] = await Promise.all([
    RewardRule.findOne({ where: { tenantId, eventType, active: true } }),
    getOrCreateProgression(tenantId, userId),
    getOrCreateStreak(tenantId, userId),
    LevelRule.findAll({ where: { tenantId, active: true }, order: [['xpRequired', 'ASC']] })
  ]);

  const xpAwarded = Number(payload.xpAwarded ?? rule?.xpAmount ?? 0);
  const event = await GamificationEvent.create({
    id: uuidv4(),
    tenantId,
    userId,
    eventType,
    source: payload.source || 'platform',
    referenceType: payload.referenceType || null,
    referenceId: payload.referenceId || null,
    xpAwarded,
    metadata: payload.metadata || null,
    occurredAt: payload.occurredAt || new Date()
  });

  const previousLevel = Number(progression.currentLevel || 1);
  progression.xpTotal = Number(progression.xpTotal || 0) + xpAwarded;

  if (shouldCountForStreak(rule, eventType)) {
    const today = toISODate(new Date());
    const yesterday = toISODate(new Date(Date.now() - (24 * 60 * 60 * 1000)));

    if (streak.lastActiveDate === today) {
      // no-op: same day should not inflate streak
    } else if (streak.lastActiveDate === yesterday) {
      streak.currentStreak = Number(streak.currentStreak || 0) + 1;
    } else {
      streak.currentStreak = 1;
    }

    streak.lastActiveDate = today;
    streak.bestStreak = Math.max(Number(streak.bestStreak || 0), Number(streak.currentStreak || 0));
    streak.lastEventAt = new Date();
    await streak.save();
  }

  const levelState = resolveLevel(levelRules, Number(progression.xpTotal || 0));
  progression.currentLevel = levelState.currentLevel;
  progression.xpInCurrentLevel = levelState.xpInCurrentLevel;
  progression.xpToNextLevel = levelState.xpToNextLevel;
  progression.lastEventAt = new Date();

  const unlockedAchievements = await evaluateAchievements({
    tenantId,
    userId,
    sourceEventId: event.id,
    progression,
    streak
  });

  if (unlockedAchievements.length) {
    const recalculated = resolveLevel(levelRules, Number(progression.xpTotal || 0));
    progression.currentLevel = recalculated.currentLevel;
    progression.xpInCurrentLevel = recalculated.xpInCurrentLevel;
    progression.xpToNextLevel = recalculated.xpToNextLevel;
  }

  await progression.save();

  return {
    event,
    xpAwarded,
    leveledUp: Number(progression.currentLevel || 1) > previousLevel,
    progression,
    streak,
    unlockedAchievements
  };
}

export async function getGamificationSummary(tenantId, userId) {
  await ensureDefaults(tenantId);

  const [progression, streak, recentEvents, unlocked, achievements] = await Promise.all([
    getOrCreateProgression(tenantId, userId),
    getOrCreateStreak(tenantId, userId),
    GamificationEvent.findAll({
      where: { tenantId, userId },
      order: [['occurredAt', 'DESC']],
      limit: 12
    }),
    UserAchievement.findAll({
      where: { tenantId, userId },
      include: [{ model: Achievement, as: 'achievement' }],
      order: [['unlockedAt', 'DESC']],
      limit: 6
    }),
    Achievement.findAll({ where: { tenantId, active: true }, order: [['createdAt', 'ASC']] })
  ]);

  const unlockedIds = new Set(unlocked.map((item) => item.achievementId));
  const nextAchievements = achievements
    .filter((item) => !unlockedIds.has(item.id))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      code: item.code,
      title: item.title,
      description: item.description,
      category: item.category,
      icon: item.icon,
      criteriaJson: item.criteriaJson,
      xpReward: Number(item.xpReward || 0)
    }));

  return {
    xp: {
      total: Number(progression.xpTotal || 0),
      inCurrentLevel: Number(progression.xpInCurrentLevel || 0),
      toNextLevel: Number(progression.xpToNextLevel || 0)
    },
    level: Number(progression.currentLevel || 1),
    streak: {
      current: Number(streak.currentStreak || 0),
      best: Number(streak.bestStreak || 0),
      lastActiveDate: streak.lastActiveDate || null
    },
    achievements: {
      unlocked: unlocked.map((entry) => ({
        id: entry.id,
        unlockedAt: entry.unlockedAt,
        achievement: entry.achievement
      })),
      next: nextAchievements
    },
    recentProgression: recentEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      xpAwarded: Number(event.xpAwarded || 0),
      source: event.source,
      occurredAt: event.occurredAt,
      metadata: event.metadata || null
    }))
  };
}

export async function listRecentGamificationEvents(tenantId, userId, limit = 20) {
  const safeLimit = Math.min(60, Math.max(1, Number(limit || 20)));
  const events = await GamificationEvent.findAll({
    where: { tenantId, userId },
    order: [['occurredAt', 'DESC']],
    limit: safeLimit
  });

  return events;
}

export async function recordDailyCheckIn(tenantId, userId) {
  return recordGamificationEvent(tenantId, userId, {
    eventType: 'daily_return',
    source: 'checkin',
    metadata: { trigger: 'manual_checkin' }
  });
}

export async function getGamificationLeaderboard(tenantId, limit = 10) {
  const safeLimit = Math.min(50, Math.max(3, Number(limit || 10)));
  const topRows = await UserProgression.findAll({
    where: { tenantId },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['xpTotal', 'DESC'], ['updatedAt', 'ASC']],
    limit: safeLimit
  });

  const totalRows = topRows.length;

  return topRows.map((row, index) => ({
    tier: totalRows <= 3
      ? (index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze')
      : (() => {
          const pct = (index + 1) / totalRows;
          if (pct <= 0.1) return 'gold';
          if (pct <= 0.3) return 'silver';
          return 'bronze';
        })(),
    rank: index + 1,
    userId: row.userId,
    name: row.user?.name || 'Aprendiz',
    email: row.user?.email || null,
    xpTotal: Number(row.xpTotal || 0),
    level: Number(row.currentLevel || 1),
    xpInCurrentLevel: Number(row.xpInCurrentLevel || 0),
    xpToNextLevel: Number(row.xpToNextLevel || 0),
    updatedAt: row.updatedAt
  }));
}

export async function listRewardRules(tenantId) {
  await ensureDefaults(tenantId);
  const rules = await RewardRule.findAll({
    where: { tenantId },
    order: [['eventType', 'ASC']]
  });
  return rules;
}

export async function upsertRewardRule(tenantId, payload = {}) {
  const eventType = String(payload.eventType || '').trim();
  if (!eventType) {
    throw new Error('eventType é obrigatório.');
  }

  const [rule] = await RewardRule.findOrCreate({
    where: { tenantId, eventType },
    defaults: {
      id: uuidv4(),
      tenantId,
      eventType,
      xpAmount: Number(payload.xpAmount || 0),
      metadata: payload.metadata || {},
      active: payload.active !== false
    }
  });

  await rule.update({
    xpAmount: Number(payload.xpAmount ?? rule.xpAmount ?? 0),
    metadata: payload.metadata ?? rule.metadata ?? {},
    active: payload.active ?? rule.active
  });

  await logAdminRuleChange(tenantId, {
    type: 'reward_rule',
    eventType,
    xpAmount: Number(rule.xpAmount || 0),
    active: Boolean(rule.active)
  });

  return rule;
}

export async function listLevelRules(tenantId) {
  await ensureDefaults(tenantId);
  const rules = await LevelRule.findAll({
    where: { tenantId },
    order: [['level', 'ASC']]
  });
  return rules;
}

export async function upsertLevelRule(tenantId, payload = {}) {
  const level = Number(payload.level || 0);
  if (!Number.isFinite(level) || level <= 0) {
    throw new Error('level deve ser um número positivo.');
  }

  const [rule] = await LevelRule.findOrCreate({
    where: { tenantId, level },
    defaults: {
      id: uuidv4(),
      tenantId,
      level,
      xpRequired: Number(payload.xpRequired || 0),
      title: String(payload.title || `Nível ${level}`),
      perksJson: payload.perksJson || [],
      active: payload.active !== false
    }
  });

  await rule.update({
    xpRequired: Number(payload.xpRequired ?? rule.xpRequired ?? 0),
    title: String(payload.title ?? rule.title ?? `Nível ${level}`),
    perksJson: payload.perksJson ?? rule.perksJson ?? [],
    active: payload.active ?? rule.active
  });

  await logAdminRuleChange(tenantId, {
    type: 'level_rule',
    level,
    xpRequired: Number(rule.xpRequired || 0),
    title: String(rule.title || ''),
    active: Boolean(rule.active)
  });

  return rule;
}
