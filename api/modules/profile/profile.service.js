import { v4 as uuidv4 } from 'uuid';
import {
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  JourneyPlan,
  JourneyPlanStep,
  JourneyState
} from '../../db/models/index.js';
import { generateJourney } from '../../services/adaptiveEngine.service.js';

function buildDefaultJourneySteps(journeyShape) {
  const style = journeyShape?.mentorshipStyle || 'adaptativa';

  return [
    {
      title: 'Diagnóstico inicial',
      description: 'Revisar objetivos e contexto do desafio atual.',
      stepType: 'lesson'
    },
    {
      title: 'Simulação guiada',
      description: `Executar cenário com formato ${journeyShape?.simulationFormat || 'adaptativo'}.`,
      stepType: 'simulation'
    },
    {
      title: `Mentoria ${style}`,
      description: 'Troca com mentor IA para consolidar lacunas.',
      stepType: 'mentor'
    },
    {
      title: 'Evolução de competências',
      description: 'Submeter evidências, avaliar progresso e ajustar jornada.',
      stepType: 'assessment'
    }
  ];
}

function buildDefaultCampaignProgress() {
  return {
    chapterId: 'capitulo-1',
    phaseId: 'missao',
    totalPhases: 4,
    totalChapters: 2,
    unlockedChapterIds: ['capitulo-1'],
    completedPhaseKeys: [],
    visitedPhaseKeys: ['capitulo-1:missao'],
    updatedAt: new Date().toISOString()
  };
}

export async function getProfileOverview(tenantId, userId) {
  const [profile, goal, style, journeyState] = await Promise.all([
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningGoal.findOne({ where: { tenantId, userId, status: 'active' }, order: [['createdAt', 'DESC']] }),
    LearningStyleProfile.findOne({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] }),
    JourneyState.findOne({ where: { tenantId, userId } })
  ]);

  return { profile, goal, style, journeyState };
}

export async function saveOnboarding(tenantId, userId, payload) {
  const dominantStyle = payload.dominantStyle || 'pratico';

  const [profile] = await LearnerProfile.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      displayName: payload.displayName || null,
      currentLevel: payload.currentLevel || payload.experienceLevel || null,
      contextType: payload.contextType || null,
      area: payload.area || null,
      experienceLevel: payload.experienceLevel || payload.currentLevel || null,
      primaryObjective: payload.primaryObjective || null,
      bio: payload.bio || null,
      preferencesJson: payload.preferencesJson || {}
    }
  });

  await profile.update({
    displayName: payload.displayName || profile.displayName,
    currentLevel: payload.currentLevel || payload.experienceLevel || profile.currentLevel,
    contextType: payload.contextType || profile.contextType,
    area: payload.area || profile.area,
    experienceLevel: payload.experienceLevel || payload.currentLevel || profile.experienceLevel,
    primaryObjective: payload.primaryObjective || profile.primaryObjective,
    bio: payload.bio || profile.bio,
    preferencesJson: payload.preferencesJson || profile.preferencesJson
  });

  const goal = await LearningGoal.create({
    id: uuidv4(),
    tenantId,
    userId,
    title: payload.goalTitle,
    goalType: payload.goalType || null,
    description: payload.goalDescription || null,
    targetDate: payload.targetDate || null,
    status: 'active'
  });

  const journeyShape = generateJourney(
    {
      contextType: payload.contextType,
      area: payload.area,
      experienceLevel: payload.experienceLevel || payload.currentLevel,
      primaryObjective: payload.primaryObjective
    },
    {
      title: payload.goalTitle,
      goalType: payload.goalType
    },
    {
      dominantStyle
    }
  );

  const [styleProfile] = await LearningStyleProfile.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      dominantStyle,
      contentPreference: journeyShape.contentType,
      mentorshipStyle: journeyShape.mentorshipStyle,
      simulationFormat: journeyShape.simulationFormat,
      styleScoresJson: payload.styleScoresJson || {},
      recommendationsJson: payload.recommendationsJson || {}
    }
  });

  await styleProfile.update({
    dominantStyle,
    contentPreference: journeyShape.contentType,
    mentorshipStyle: journeyShape.mentorshipStyle,
    simulationFormat: journeyShape.simulationFormat,
    styleScoresJson: payload.styleScoresJson || styleProfile.styleScoresJson,
    recommendationsJson: payload.recommendationsJson || styleProfile.recommendationsJson
  });

  const journey = await JourneyPlan.create({
    id: uuidv4(),
    tenantId,
    userId,
    learningGoalId: goal.id,
    title: `Jornada personalizada: ${goal.title}`,
    status: 'active',
    generatedBy: 'ai',
    metadata: {
      onboardingVersion: 'v1',
      dominantStyle,
      ...journeyShape
    }
  });

  const steps = buildDefaultJourneySteps(journeyShape);
  const createdSteps = [];
  for (let i = 0; i < steps.length; i += 1) {
    const step = await JourneyPlanStep.create({
      id: uuidv4(),
      tenantId,
      journeyPlanId: journey.id,
      title: steps[i].title,
      description: steps[i].description,
      stepType: steps[i].stepType,
      orderIndex: i,
      status: i === 0 ? 'in_progress' : 'pending'
    });
    createdSteps.push(step);
  }

  const [journeyState] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: journey.id,
      currentStepId: createdSteps[0]?.id || null,
      progressPercent: 0,
      lastEventAt: new Date(),
      stateJson: {
        lastAction: 'onboarding_completed',
        suggestedNextScenario: journeyShape.scenarios?.[0] || null,
        adaptiveDifficulty: journeyShape.difficulty
      }
    }
  });

  await journeyState.update({
    journeyPlanId: journey.id,
    currentStepId: createdSteps[0]?.id || null,
    progressPercent: 0,
    lastEventAt: new Date(),
    stateJson: {
      lastAction: 'onboarding_completed',
      suggestedNextScenario: journeyShape.scenarios?.[0] || null,
      adaptiveDifficulty: journeyShape.difficulty,
      campaignProgress: buildDefaultCampaignProgress()
    }
  });

  return {
    profile,
    goal,
    style: styleProfile,
    journey: {
      ...journey.toJSON(),
      steps: createdSteps.map((step) => step.toJSON())
    },
    journeyShape,
    journeyState
  };
}

export async function saveLearningGoal(tenantId, userId, payload) {
  const goal = await LearningGoal.create({
    id: uuidv4(),
    tenantId,
    userId,
    title: payload.goalTitle,
    goalType: payload.goalType || null,
    description: payload.goalDescription || null,
    targetDate: payload.targetDate || null,
    status: 'active'
  });

  return goal;
}

export async function saveLearningStyle(tenantId, userId, payload) {
  const [styleProfile] = await LearningStyleProfile.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      dominantStyle: payload.dominantStyle || 'pratico',
      contentPreference: payload.contentPreference || null,
      mentorshipStyle: payload.mentorshipStyle || null,
      simulationFormat: payload.simulationFormat || null,
      styleScoresJson: payload.styleScoresJson || {},
      recommendationsJson: payload.recommendationsJson || {}
    }
  });

  await styleProfile.update({
    dominantStyle: payload.dominantStyle || styleProfile.dominantStyle,
    contentPreference: payload.contentPreference || styleProfile.contentPreference,
    mentorshipStyle: payload.mentorshipStyle || styleProfile.mentorshipStyle,
    simulationFormat: payload.simulationFormat || styleProfile.simulationFormat,
    styleScoresJson: payload.styleScoresJson || styleProfile.styleScoresJson,
    recommendationsJson: payload.recommendationsJson || styleProfile.recommendationsJson
  });

  return styleProfile;
}
