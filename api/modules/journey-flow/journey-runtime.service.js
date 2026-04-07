import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import {
  AssessmentSubmission,
  JourneyEvent,
  JourneyMission,
  JourneyState,
  JourneyTwistLog,
  JourneyTwistRule,
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  Scenario,
  ScenarioEpisode,
  DecisionOption,
  SimulationRun
} from '../../db/models/index.js';
import { getGamificationSummary, recordGamificationEvent } from '../gamification/gamification.service.js';
import { getJourneyFlowState } from './journey-flow.service.js';
import { trackTelemetryEvent } from './telemetry.service.js';
import { DEFAULT_MISSION_LIBRARY, PLOT_TWIST_LIBRARY } from './journey-runtime.fixtures.js';
import { getCompetencyMatrix } from '../competency/competency.service.js';

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeTag(value) {
  return String(value || '').trim().toLowerCase();
}

function splitTrackSlug(trackSlug) {
  return normalizeTag(trackSlug)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function normalizeGoalSignals(goal) {
  const source = [goal?.goalType, goal?.title, goal?.description]
    .map((item) => normalizeTag(item))
    .filter(Boolean)
    .join(' ');

  return source;
}

function normalizeMentorMode(style) {
  const normalized = String(style || '').trim().toLowerCase();
  if (normalized.includes('socratic')) return 'socratico';
  if (normalized.includes('analit')) return 'analitico';
  if (normalized.includes('narrat')) return 'narrativo';
  if (normalized.includes('prat')) return 'pratico';
  return 'socratico';
}

function toMissionFromScenario(scenario, episode, options = []) {
  if (!scenario) return null;
  const missionId = String(scenario.id || `scenario-${Date.now()}`);

  return {
    id: missionId,
    sourceType: 'scenario',
    scenarioId: scenario.id,
    title: scenario.title,
    context: scenario.context || scenario.description || '',
    stakeholders: ['cliente', 'time tecnico', 'produto'],
    riskLevel: scenario.difficulty || 'medio',
    objective: scenario.problem || 'Resolver a missao com criterio e consistencia.',
    choices: options.map((option) => ({
      id: option.id,
      label: option.label,
      consequence: option.outcomeText || 'Consequencia registrada na jornada.'
    })),
    consequences: {
      bestCase: scenario.consequencesJson?.bestCase || 'Evolucao de competencia e ganho de confianca.',
      worstCase: scenario.consequencesJson?.worstCase || 'Aumento de risco e perda de eficiencia.'
    },
    evidenceTargets: ['racional da decisao', 'impacto observado', 'proximo ajuste'],
    competenciesImpacted: safeArray(scenario.competenciesEvaluatedJson).length
      ? safeArray(scenario.competenciesEvaluatedJson)
      : ['tomada de decisao'],
    completionCriteria: ['decidir com criterio', 'explicar trade-off', 'registrar proximo passo'],
    optionalTwistTriggers: ['context_shift', 'new_information'],
    narrativeText: episode?.narrativeText || null
  };
}

function buildMissionMapNodes(steps = []) {
  return safeArray(steps).map((step, index) => {
    const isFinal = index === steps.length - 1;
    const isBoss = isFinal || String(step.id) === '15';
    const isEvent = (index + 1) % 4 === 0 && !isBoss;

    return {
      id: String(step.id),
      title: step.title,
      nodeType: isBoss ? 'boss' : isEvent ? 'event' : 'mission',
      status: step.status,
      unlocked: Boolean(step.unlocked),
      xp: asNumber(step.xp, 0),
      reward: step.reward || null,
      position: step.position || null,
      unlockConditions: {
        requiredCompletedStepIds: index > 0 ? [String(steps[index - 1].id)] : [],
        minimumLevel: 1
      }
    };
  });
}

function chooseTwistCandidate({ progressPercent, streak, latestTwist }) {
  if (latestTwist) return latestTwist;

  if (progressPercent >= 66) {
    return PLOT_TWIST_LIBRARY.find((item) => item.kind === 'deadline_reduction') || PLOT_TWIST_LIBRARY[0];
  }

  if (streak <= 1) {
    return PLOT_TWIST_LIBRARY.find((item) => item.kind === 'new_stakeholder') || PLOT_TWIST_LIBRARY[0];
  }

  return PLOT_TWIST_LIBRARY[progressPercent % PLOT_TWIST_LIBRARY.length];
}

function scoreMissionFit(mission, profile, style, goal) {
  const learnerStyle = normalizeTag(style?.dominantStyle);
  const learnerArea = normalizeTag(profile?.area);
  const goalSignals = normalizeGoalSignals(goal);
  const missionTrackSlug = normalizeTag(mission?.trackSlug);
  const missionTrackTokens = splitTrackSlug(mission?.trackSlug);
  const targetStyles = safeArray(mission?.audienceStylesJson).map((item) => normalizeTag(item));
  const missionArea = normalizeTag(mission?.targetArea);

  let score = 0;
  if (targetStyles.length) {
    score += targetStyles.includes(learnerStyle) ? 3 : -1;
  }

  if (missionArea) {
    score += missionArea === learnerArea ? 2 : -1;
  }

  if (missionTrackSlug) {
    const goalDirectMatch = goalSignals.includes(missionTrackSlug);
    const goalTokenMatch = missionTrackTokens.length
      ? missionTrackTokens.every((token) => goalSignals.includes(token))
      : false;

    if (goalDirectMatch) {
      score += 4;
    } else if (goalTokenMatch) {
      score += 2;
    } else {
      score -= 1;
    }
  }

  return score;
}

async function resolveActiveMission(tenantId, userId, { profile = null, style = null, goal = null } = {}) {
  const curatedMissions = await JourneyMission.findAll({
    where: { tenantId, active: true },
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
  }).catch(() => []);

  const curatedMission = curatedMissions.length
    ? [...curatedMissions]
      .map((mission) => ({ mission, fit: scoreMissionFit(mission, profile, style, goal) }))
      .sort((a, b) => b.fit - a.fit || Number(a.mission.sortOrder || 0) - Number(b.mission.sortOrder || 0))[0]?.mission
    : null;

  if (curatedMission) {
    return {
      id: curatedMission.id,
      sourceType: 'catalog',
      scenarioId: null,
      title: curatedMission.title,
      context: curatedMission.context || '',
      stakeholders: safeArray(curatedMission.stakeholdersJson),
      riskLevel: curatedMission.riskLevel || 'medio',
      objective: curatedMission.objective || '',
      choices: safeArray(curatedMission.choicesJson),
      consequences: curatedMission.consequencesJson || {},
      evidenceTargets: safeArray(curatedMission.evidenceTargetsJson),
      competenciesImpacted: safeArray(curatedMission.competenciesImpactedJson),
      completionCriteria: safeArray(curatedMission.completionCriteriaJson),
      optionalTwistTriggers: safeArray(curatedMission.optionalTwistTriggersJson),
      targeting: {
        trackSlug: curatedMission.trackSlug || null,
        targetArea: curatedMission.targetArea || null,
        audienceStyles: safeArray(curatedMission.audienceStylesJson)
      }
    };
  }

  const latestScenario = await Scenario.findOne({
    where: { tenantId, status: 'active' },
    order: [['createdAt', 'DESC']]
  });

  if (latestScenario) {
    const episode = await ScenarioEpisode.findOne({
      where: { tenantId, scenarioId: latestScenario.id },
      order: [['episodeIndex', 'ASC']]
    });

    const options = episode
      ? await DecisionOption.findAll({
          where: { tenantId, scenarioEpisodeId: episode.id },
          order: [['createdAt', 'ASC']]
        })
      : [];

    const mapped = toMissionFromScenario(latestScenario, episode, options);
    if (mapped) return mapped;
  }

  const fallbackIndex = Math.max(0, (asNumber(userId?.length, 0) || 1) % DEFAULT_MISSION_LIBRARY.length);
  return {
    ...DEFAULT_MISSION_LIBRARY[fallbackIndex],
    sourceType: 'fixture',
    scenarioId: null
  };
}

function buildMentorRuntime({ profile, style, activeMission, latestDecision }) {
  const dominantStyle = String(style?.dominantStyle || 'explorador').toLowerCase();
  const mentorMode = normalizeMentorMode(style?.mentorshipStyle || dominantStyle);

  const guidance = {
    socratico: 'Qual suposicao voce considera verdadeira sem validar? Como testaria isso agora?',
    pratico: 'Escolha uma acao de alto impacto para executar nas proximas 2 horas.',
    analitico: 'Liste criterio, risco e ganho esperado antes de confirmar a escolha.',
    narrativo: 'Enquadre a decisao como historia de problema, tensao e resolucao.'
  };

  return {
    mentorMode,
    mentorRoles: ['mentor', 'avaliador', 'diretor_de_jogo'],
    languageTone: dominantStyle,
    prompt: guidance[mentorMode] || guidance.socratico,
    latestDecisionSummary: latestDecision?.feedbackText || null,
    contextualMission: activeMission?.title || null,
    learnerAlias: profile?.displayName || 'Aprendiz'
  };
}

function buildPhaseResult({ progressPercent, competencyMatrix, gamification }) {
  const weakest = safeArray(competencyMatrix?.focus).slice(0, 2);
  const strongest = safeArray(competencyMatrix?.strengths).slice(0, 2);

  return {
    phaseStatus: progressPercent >= 100 ? 'completed' : progressPercent >= 60 ? 'in_progress' : 'warming_up',
    performance: {
      progressPercent,
      level: asNumber(gamification?.level, 1),
      xpTotal: asNumber(gamification?.xp?.total, 0),
      streak: asNumber(gamification?.streak?.current, 0)
    },
    strengths: strongest,
    recurringGaps: weakest,
    rewards: {
      unlockedBadges: safeArray(gamification?.achievements?.unlocked).slice(0, 5),
      nextBadges: safeArray(gamification?.achievements?.next).slice(0, 3)
    },
    nextTrackRecommendation: weakest[0]
      ? `Focar em ${weakest[0].name || weakest[0].competencyName || 'competencia-chave'} na proxima trilha.`
      : 'Expandir dificuldade mantendo consistencia da jornada atual.'
  };
}

function buildDerivedMission({ activeMission, weakestCompetency, phaseResult, goal, profile }) {
  const competencyName = weakestCompetency?.name || 'criterio aplicado';
  const goalText = goal?.title || profile?.primaryObjective || 'a próxima meta da jornada';

  return {
    id: `derived-${normalizeTag(competencyName) || 'competencia'}-${normalizeTag(goalText) || 'meta'}`,
    sourceType: 'campaign-derived',
    scenarioId: null,
    title: `Missao de refinamento: ${competencyName}`,
    context: `A campanha entrou em um novo capitulo orientado por ${competencyName}. O foco agora e transformar a lacuna mais recorrente em criterio observavel sem perder ritmo em ${goalText}.`,
    stakeholders: activeMission?.stakeholders?.length ? activeMission.stakeholders : ['lideranca', 'mentor IA', 'time de execucao'],
    riskLevel: activeMission?.riskLevel || 'medio',
    objective: phaseResult?.nextTrackRecommendation || `Criar evidência concreta de evolução em ${competencyName}.`,
    choices: [
      {
        id: `derived-choice-${normalizeTag(competencyName)}-1`,
        label: `Definir um criterio explicito para ${competencyName}`,
        consequence: `Cria um padrão reutilizável para decidir com mais consistência em ${competencyName}.`,
        impact: 'reduz ambiguidade e estabiliza execução'
      },
      {
        id: `derived-choice-${normalizeTag(competencyName)}-2`,
        label: `Executar um teste curto com checkpoint de evidencia`,
        consequence: `Transforma a lacuna em experimento controlado antes de escalar a decisão.`,
        impact: 'aumenta aprendizado validado'
      },
      {
        id: `derived-choice-${normalizeTag(competencyName)}-3`,
        label: `Alinhar o time com trade-off e condição de sucesso`,
        consequence: 'Reduz ruído de execução e evita interpretações diferentes do objetivo.',
        impact: 'melhora coordenação e clareza'
      }
    ],
    consequences: {
      bestCase: `A próxima decisão passa a demonstrar domínio claro de ${competencyName}.`,
      worstCase: `A lacuna em ${competencyName} continua invisível e se repete no próximo ciclo.`
    },
    evidenceTargets: ['criterio explicitado', 'trade-off assumido', 'checkpoint definido'],
    competenciesImpacted: [competencyName, ...(safeArray(activeMission?.competenciesImpacted).filter((item) => item !== competencyName).slice(0, 2))],
    completionCriteria: ['explicar criterio', 'definir experimento', 'registrar sinal de sucesso'],
    optionalTwistTriggers: activeMission?.optionalTwistTriggers || ['new_information']
  };
}

function buildCampaignScenarioFromMission(mission, fallbackLabel = 'Simulacao de campanha') {
  if (!mission) return null;

  return {
    title: mission.title || fallbackLabel,
    context: mission.context || `Contexto narrativo para ${fallbackLabel}.`,
    problem: mission.objective || 'Definir uma resposta consistente para o proximo estado da campanha.',
    options: safeArray(mission.choices).map((choice, index) => ({
      id: choice.id || `campaign-option-${index + 1}`,
      title: choice.label,
      label: choice.label,
      text: choice.impact || choice.consequence || 'Escolha estrategica para conduzir o proximo estado.',
      outcomeText: choice.consequence || choice.impact || null,
      risk: choice.risk || mission.riskLevel || 'medio'
    }))
  };
}

function buildCampaignEvolutionContent({ chapterTitle, competencyName, phaseResult, stageLabel }) {
  return {
    title: `Evolucao de ${stageLabel}`,
    description: `Feche ${chapterTitle} com leitura de progresso, ranking e recomendacao para o proximo ciclo em ${competencyName}.`,
    summary: phaseResult?.summary || 'Sem resumo adicional para este ciclo.',
    recommendation: phaseResult?.nextTrackRecommendation || `Continue aprofundando ${competencyName}.`
  };
}

function buildCampaignMentorContent({ mission, competencyName, phaseLabel, mentorMode = 'analitico' }) {
  const missionTitle = mission?.title || 'missao atual';
  const objective = mission?.objective || 'transformar contexto em proximo movimento claro';
  const choices = safeArray(mission?.choices).slice(0, 3);

  return {
    title: `Mentor de ${phaseLabel}`,
    description: `A mentoria agora tensiona ${competencyName} como criterio observavel dentro de ${missionTitle}.`,
    heroText: `O mentor deixa de responder genericamente e passa a atuar como diretor de leitura para ${missionTitle}, destacando o que valida ou enfraquece ${competencyName}.`,
    sceneLabel: missionTitle,
    recentDecisionLabel: choices[0]?.label || 'Escolha principal desta fase',
    focusCompetency: competencyName,
    mentorMode,
    messagePlaceholder: `Quero ajuda para destrinchar ${competencyName}, o risco central de ${missionTitle} e a melhor forma de agir agora.`,
    quickPrompts: [
      `Como reduzir risco em ${missionTitle} sem sacrificar ${competencyName}?`,
      `Qual trade-off desta fase ameaça mais ${competencyName}?`,
      `Que evidência provaria avanço real em ${competencyName} ainda neste capítulo?`
    ],
    apiContext: {
      chapterFocus: competencyName,
      missionTitle,
      objective,
      phaseLabel,
      recommendedMentorMode: mentorMode
    }
  };
}

function buildCampaignAssessmentContent({ mission, competencyName, phaseLabel, levelLabel }) {
  const missionTitle = mission?.title || 'missao atual';
  const objective = mission?.objective || 'explicar criterio e proximo passo';

  return {
    title: `Assessment de ${phaseLabel}`,
    description: `Avalie se ${competencyName} saiu da narrativa e virou evidencia pratica em ${missionTitle}.`,
    competencyLabel: competencyName,
    criterionLabel: `clareza de criterio em ${competencyName}`,
    levelLabel,
    evidenceLabel: `racional aplicado, impacto esperado e checkpoint para ${objective}`,
    promptPlaceholder: `Descreva como você validaria ${competencyName} em ${missionTitle}, qual trade-off aceitou e qual evidência vai acompanhar.`,
    rubric: [
      `Explicitar criterio objetivo para ${competencyName}`,
      'Assumir trade-off com justificativa concreta',
      'Definir evidência e próximo checkpoint'
    ],
    apiContext: {
      chapterFocus: competencyName,
      missionTitle,
      objective,
      phaseLabel,
      rubric: [
        `criterio em ${competencyName}`,
        'trade-off assumido',
        'evidencia definida'
      ]
    }
  };
}

function buildCampaignBriefingContent({ mission, chapterTitle, competencyName }) {
  return {
    title: `Briefing: ${chapterTitle}`,
    description: `Abertura formal da fase com contexto, objetivo, stakeholders, recursos e tensão inicial em ${competencyName}.`,
    headline: mission?.title || chapterTitle,
    objective: mission?.objective || 'Definir o objetivo operacional da fase.',
    context: mission?.context || 'Contexto de fase em preparação.',
    stakeholders: safeArray(mission?.stakeholders),
    competencyName,
    initialIndicators: [
      { label: 'Tensão inicial', value: mission?.riskLevel || 'medio' },
      { label: 'Stakeholders', value: safeArray(mission?.stakeholders).length || 0 },
      { label: 'Competência foco', value: competencyName }
    ]
  };
}

function buildCampaignConsequenceContent({ mission, competencyName }) {
  return {
    title: `Consequencia: ${mission?.title || 'fase atual'}`,
    description: `Leitura separada do impacto da decisão sobre o mundo, a missão e ${competencyName}.`,
    competencyName,
    summary: mission?.consequences?.bestCase || mission?.consequences?.worstCase || 'Consequência em atualização pelo backend.'
  };
}

function buildCampaignTwistContent({ mission, competencyName }) {
  return {
    title: `Plot twist: ${mission?.title || 'fase atual'}`,
    description: `Momento de ruptura para reconfigurar a fase quando o estado do mundo exigir uma resposta adicional em ${competencyName}.`,
    competencyName,
    urgencyLabel: mission?.riskLevel || 'medio',
    summary: `O twist pode disparar por regra ou estado acumulado do mundo, alterando condição, pressão e foco de execução.`
  };
}

function buildCampaignReflectionContent({ mission, competencyName, mentorMode = 'socratico' }) {
  return {
    title: `Reflexao: ${mission?.title || 'fase atual'}`,
    description: `Etapa própria de debrief com foco em aprendizagem extraída, feedback do mentor e reflexão guiada sobre ${competencyName}.`,
    competencyName,
    mentorMode,
    prompt: `O que mudou na sua leitura de ${competencyName} depois da consequência da fase?`,
    summary: mission?.objective || 'Consolidar o aprendizado antes do fechamento da fase.'
  };
}

function buildCampaignResultContent({ chapterTitle, competencyName, phaseResult }) {
  return {
    title: `Resultado: ${chapterTitle}`,
    description: `Fechamento visual da fase com score, radar, XP, badges e leitura de performance em ${competencyName}.`,
    competencyName,
    recommendation: phaseResult?.nextTrackRecommendation || `Continuar aprofundando ${competencyName}.`,
    summary: phaseResult?.summary || 'Resultado oficial da fase consolidado pelo backend.'
  };
}

function buildCampaignProgressionContent({ competencyName, phaseResult, derivedMission }) {
  return {
    title: `Proximo passo: ${competencyName}`,
    description: `Explique para onde a jornada segue, quais reforços entram e o que foi desbloqueado com base no estado real.`,
    competencyName,
    recommendation: phaseResult?.nextTrackRecommendation || `Avancar para a proxima fase focando em ${competencyName}.`,
    nextMissionTitle: derivedMission?.title || 'Próxima missão',
    unlocks: safeArray(phaseResult?.rewards?.nextBadges)
  };
}

function buildCampaignChapters({ runtimeMission, derivedMission, phaseResult, weakestCompetency }) {
  const competencyName = weakestCompetency?.name || derivedMission?.competenciesImpacted?.[0] || 'criterio aplicado';

  return [
    {
      id: 'capitulo-1',
      title: runtimeMission?.title || 'Campanha Ativa',
      theme: 'missao-base',
      phases: [
        {
          id: 'briefing',
          type: 'briefing',
          title: 'Briefing',
          description: 'Contexto, objetivo, regras, stakeholders e indicadores iniciais da fase.',
          content: buildCampaignBriefingContent({
            mission: runtimeMission,
            chapterTitle: runtimeMission?.title || 'Campanha ativa',
            competencyName
          })
        },
        {
          id: 'mission',
          type: 'mission-play',
          title: 'Missao',
          description: 'Interação principal da fase com escolha, pressão e estado do mundo.',
          content: {
            mission: runtimeMission,
            headline: runtimeMission?.title || 'Missao ativa',
            summary: runtimeMission?.context || '',
            competencyName
          }
        },
        {
          id: 'consequence',
          type: 'consequence',
          title: 'Consequencia',
          description: 'Impacto visual e sistêmico da decisão com delta de estado oficial.',
          content: buildCampaignConsequenceContent({
            mission: runtimeMission,
            competencyName
          })
        },
        {
          id: 'plot-twist',
          type: 'plot-twist',
          title: 'Plot Twist',
          description: 'Evento inesperado com urgência alta e alteração de condição da fase.',
          content: buildCampaignTwistContent({
            mission: runtimeMission,
            competencyName
          })
        },
        {
          id: 'reflection',
          type: 'reflection',
          title: 'Reflexao',
          description: 'Debrief orientado pelo mentor com foco pedagógico próprio.',
          content: buildCampaignReflectionContent({
            mission: runtimeMission,
            competencyName,
            mentorMode: 'socratico'
          })
        },
        {
          id: 'phase-result',
          type: 'phase-result',
          title: 'Resultado',
          description: 'Score, radar, XP, badges e resumo da performance da fase.',
          content: buildCampaignResultContent({
            chapterTitle: runtimeMission?.title || 'Campanha ativa',
            competencyName,
            phaseResult
          })
        },
        {
          id: 'progression',
          type: 'progression',
          title: 'Próximo passo',
          description: 'Recomendação, reforço, desbloqueios e transição para a próxima fase.',
          content: buildCampaignProgressionContent({
            competencyName,
            phaseResult,
            derivedMission
          })
        }
      ]
    },
    {
      id: 'capitulo-2',
      title: `Proxima trilha: ${competencyName}`,
      theme: 'refinamento',
      phases: [
        {
          id: 'briefing',
          type: 'briefing',
          title: 'Briefing',
          description: 'Abertura formal do capítulo de refinamento.',
          content: buildCampaignBriefingContent({
            mission: derivedMission,
            chapterTitle: `Proxima trilha: ${competencyName}`,
            competencyName
          })
        },
        {
          id: 'mission',
          type: 'mission-play',
          title: 'Missao',
          description: phaseResult?.nextTrackRecommendation || `Refinamento focado em ${competencyName}.`,
          content: {
            mission: derivedMission,
            headline: derivedMission?.title,
            summary: derivedMission?.context,
            competencyName
          }
        },
        {
          id: 'consequence',
          type: 'consequence',
          title: 'Consequencia',
          description: 'Leitura acumulada do impacto da decisão no capítulo de refinamento.',
          content: buildCampaignConsequenceContent({
            mission: derivedMission,
            competencyName
          })
        },
        {
          id: 'plot-twist',
          type: 'plot-twist',
          title: 'Plot Twist',
          description: 'Reviravolta de alto impacto para estressar a nova competência focal.',
          content: buildCampaignTwistContent({
            mission: derivedMission,
            competencyName
          })
        },
        {
          id: 'reflection',
          type: 'reflection',
          title: 'Reflexao',
          description: 'Mentoria e aprendizagem extraída da fase crítica.',
          content: buildCampaignReflectionContent({
            mission: derivedMission,
            competencyName,
            mentorMode: 'analitico'
          })
        },
        {
          id: 'phase-result',
          type: 'phase-result',
          title: 'Resultado',
          description: 'Consolidação do capítulo de refinamento com leitura de progresso.',
          content: buildCampaignResultContent({
            chapterTitle: `Proxima trilha: ${competencyName}`,
            competencyName,
            phaseResult
          })
        },
        {
          id: 'progression',
          type: 'progression',
          title: 'Próximo passo',
          description: 'Fechamento final da campanha e orientação real de continuidade.',
          content: buildCampaignProgressionContent({
            competencyName,
            phaseResult,
            derivedMission
          })
        }
      ]
    }
  ];
}

function normalizeName(value) {
  return normalizeTag(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const CAMPAIGN_CHAPTER_IDS = ['capitulo-1', 'capitulo-2'];
const CAMPAIGN_CHAPTER_ID = CAMPAIGN_CHAPTER_IDS[0];
const CAMPAIGN_PHASE_SEQUENCE = ['briefing', 'mission', 'consequence', 'plot-twist', 'reflection', 'phase-result', 'progression'];

function makeCampaignPhaseKey(chapterId, phaseId) {
  return `${chapterId}:${phaseId}`;
}

function buildDefaultCampaignProgress() {
  return {
    chapterId: CAMPAIGN_CHAPTER_ID,
    phaseId: CAMPAIGN_PHASE_SEQUENCE[0],
    totalPhases: CAMPAIGN_PHASE_SEQUENCE.length,
    totalChapters: CAMPAIGN_CHAPTER_IDS.length,
    unlockedChapterIds: [CAMPAIGN_CHAPTER_ID],
    completedPhaseKeys: [],
    visitedPhaseKeys: [makeCampaignPhaseKey(CAMPAIGN_CHAPTER_ID, CAMPAIGN_PHASE_SEQUENCE[0])],
    updatedAt: new Date().toISOString()
  };
}

function normalizeCampaignProgress(input = {}, previous = null) {
  const baseline = previous || buildDefaultCampaignProgress();
  const chapterId = CAMPAIGN_CHAPTER_IDS.includes(String(input?.chapterId || '').trim())
    ? String(input.chapterId).trim()
    : baseline.chapterId;
  const phaseId = CAMPAIGN_PHASE_SEQUENCE.includes(String(input?.phaseId || '').trim())
    ? String(input.phaseId).trim()
    : baseline.phaseId;
  const unlockedChapterIds = Array.from(new Set([
    ...safeArray(input?.unlockedChapterIds)
      .map((item) => String(item || '').trim())
      .filter((item) => CAMPAIGN_CHAPTER_IDS.includes(item)),
    baseline.chapterId,
    chapterId
  ]));
  const completedPhaseKeys = safeArray(input?.completedPhaseKeys || input?.completedPhaseIds)
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const visitedPhaseKeys = Array.from(new Set([
    ...safeArray(input?.visitedPhaseKeys || input?.visitedPhaseIds)
      .map((item) => String(item || '').trim())
      .filter(Boolean),
    makeCampaignPhaseKey(chapterId, phaseId)
  ]));

  return {
    chapterId,
    phaseId,
    totalPhases: CAMPAIGN_PHASE_SEQUENCE.length,
    totalChapters: CAMPAIGN_CHAPTER_IDS.length,
    unlockedChapterIds,
    completedPhaseKeys,
    visitedPhaseKeys,
    updatedAt: new Date().toISOString()
  };
}

function getCompletedChapterIds(progress = null) {
  const completedKeys = new Set(safeArray(progress?.completedPhaseKeys));
  return CAMPAIGN_CHAPTER_IDS.filter((chapterId) => {
    return CAMPAIGN_PHASE_SEQUENCE.every((phaseId) => completedKeys.has(makeCampaignPhaseKey(chapterId, phaseId)));
  });
}

async function trackCampaignProgressEvents({ tenantId, userId, previousProgress, nextProgress }) {
  const previousUnlocked = new Set(safeArray(previousProgress?.unlockedChapterIds));
  const nextUnlocked = safeArray(nextProgress?.unlockedChapterIds);
  const newlyUnlockedChapterIds = nextUnlocked.filter((chapterId) => !previousUnlocked.has(chapterId));

  for (const chapterId of newlyUnlockedChapterIds) {
    await trackTelemetryEvent({
      tenantId,
      userId,
      payload: {
        eventType: 'chapter_unlocked',
        stepId: nextProgress?.phaseId || null,
        metadata: {
          chapterId,
          phaseId: nextProgress?.phaseId || null,
          unlockedChapterIds: nextUnlocked
        },
        createdAt: new Date().toISOString()
      }
    });
  }

  const previousCompleted = new Set(getCompletedChapterIds(previousProgress));
  const newlyCompletedChapterIds = getCompletedChapterIds(nextProgress).filter((chapterId) => !previousCompleted.has(chapterId));

  for (const chapterId of newlyCompletedChapterIds) {
    await trackTelemetryEvent({
      tenantId,
      userId,
      payload: {
        eventType: 'chapter_completed',
        stepId: nextProgress?.phaseId || null,
        metadata: {
          chapterId,
          phaseId: nextProgress?.phaseId || null,
          completedPhaseKeys: safeArray(nextProgress?.completedPhaseKeys).filter((key) => key.startsWith(`${chapterId}:`))
        },
        createdAt: new Date().toISOString()
      }
    });
  }
}

function buildMissionCompetencyCoverage(activeMission, competencyMatrix) {
  const impacted = safeArray(activeMission?.competenciesImpacted).map((item) => normalizeName(item));
  const focus = safeArray(competencyMatrix?.focus).map((item) => normalizeName(item?.name));
  const strengths = safeArray(competencyMatrix?.strengths).map((item) => normalizeName(item?.name));

  if (!impacted.length) {
    return {
      impactedCount: 0,
      focusCoverage: 0,
      strengthCoverage: 0
    };
  }

  const focusCoverage = impacted.filter((item) => focus.some((focusName) => focusName.includes(item) || item.includes(focusName))).length;
  const strengthCoverage = impacted.filter((item) => strengths.some((strengthName) => strengthName.includes(item) || item.includes(strengthName))).length;

  return {
    impactedCount: impacted.length,
    focusCoverage,
    strengthCoverage
  };
}

function buildCompetencyMomentum(competencyMatrix) {
  const items = safeArray(competencyMatrix?.items);
  if (!items.length) {
    return {
      averageScore: 0,
      directEvidenceRatio: 0,
      inferredEvidenceRatio: 0,
      evidenceTotal: 0
    };
  }

  const totalScore = items.reduce((acc, item) => acc + asNumber(item?.score, 0), 0);
  const directEvidence = items.reduce((acc, item) => acc + asNumber(item?.evidence?.direct, 0), 0);
  const inferredEvidence = items.reduce((acc, item) => acc + asNumber(item?.evidence?.inferred, 0), 0);
  const evidenceTotal = directEvidence + inferredEvidence;

  return {
    averageScore: Number((totalScore / items.length).toFixed(2)),
    directEvidenceRatio: evidenceTotal ? Number((directEvidence / evidenceTotal).toFixed(4)) : 0,
    inferredEvidenceRatio: evidenceTotal ? Number((inferredEvidence / evidenceTotal).toFixed(4)) : 0,
    evidenceTotal
  };
}

function summarizeCampaignAnalytics(events = [], days, windowStart) {
  const relevantEvents = safeArray(events);
  const users = new Set();
  const byChapter = new Map();
  const daySeries = buildDaySeries(windowStart, days);
  const timeline = new Map(daySeries.map((day) => [day, { day, unlocked: 0, completed: 0 }]));

  for (const event of relevantEvents) {
    const userId = String(event.userId || '');
    const chapterId = String(event.metadata?.chapterId || 'unknown').trim() || 'unknown';
    const eventType = String(event.eventType || '').trim();
    const createdAt = event.createdAt || null;

    if (userId) users.add(userId);

    const current = byChapter.get(chapterId) || {
      chapterId,
      unlocked: 0,
      completed: 0,
      unlockedUsers: new Set(),
      completedUsers: new Set()
    };

    if (eventType === 'chapter_unlocked') {
      current.unlocked += 1;
      if (userId) current.unlockedUsers.add(userId);
    }

    if (eventType === 'chapter_completed') {
      current.completed += 1;
      if (userId) current.completedUsers.add(userId);
    }

    byChapter.set(chapterId, current);

    const dayKey = toDayKey(createdAt);
    if (dayKey && timeline.has(dayKey)) {
      const dayItem = timeline.get(dayKey);
      if (eventType === 'chapter_unlocked') dayItem.unlocked += 1;
      if (eventType === 'chapter_completed') dayItem.completed += 1;
      timeline.set(dayKey, dayItem);
    }
  }

  const chapters = [...byChapter.values()]
    .map((item) => ({
      chapterId: item.chapterId,
      unlocked: item.unlocked,
      completed: item.completed,
      unlockedUsers: item.unlockedUsers.size,
      completedUsers: item.completedUsers.size,
      completionRate: item.unlockedUsers.size
        ? Number(((item.completedUsers.size / item.unlockedUsers.size) * 100).toFixed(2))
        : 0
    }))
    .sort((a, b) => b.completionRate - a.completionRate || b.completedUsers - a.completedUsers || a.chapterId.localeCompare(b.chapterId));

  const unlockedTotal = chapters.reduce((acc, item) => acc + item.unlocked, 0);
  const completedTotal = chapters.reduce((acc, item) => acc + item.completed, 0);
  const uniqueUnlockedUsers = new Set(chapters.flatMap((item) => Array.from(byChapter.get(item.chapterId)?.unlockedUsers || []))).size;
  const uniqueCompletedUsers = new Set(chapters.flatMap((item) => Array.from(byChapter.get(item.chapterId)?.completedUsers || []))).size;

  return {
    totals: {
      users: users.size,
      chaptersUnlocked: unlockedTotal,
      chaptersCompleted: completedTotal,
      unlockedUsers: uniqueUnlockedUsers,
      completedUsers: uniqueCompletedUsers,
      completionRate: uniqueUnlockedUsers ? Number(((uniqueCompletedUsers / uniqueUnlockedUsers) * 100).toFixed(2)) : 0
    },
    byChapter: chapters,
    timeline: [...timeline.values()]
  };
}

function createCampaignFunnelAccumulator(identifier = {}) {
  return {
    ...identifier,
    startedRuns: 0,
    completedRuns: 0,
    assessmentsSubmitted: 0,
    linkedAssessments: 0
  };
}

function finalizeCampaignFunnel(item) {
  return {
    ...item,
    completionRateFromRuns: item.startedRuns
      ? Number(((item.completedRuns / item.startedRuns) * 100).toFixed(2))
      : 0,
    assessmentRateFromCompletedRuns: item.completedRuns
      ? Number(((item.assessmentsSubmitted / item.completedRuns) * 100).toFixed(2))
      : 0,
    linkedRateFromAssessments: item.assessmentsSubmitted
      ? Number(((item.linkedAssessments / item.assessmentsSubmitted) * 100).toFixed(2))
      : 0
  };
}

function summarizeCampaignQualityAnalytics({ states = [], submissions = [], styleByUser = new Map(), styleFilter = '', chapterFilter = '', phaseFilter = '', runStatusFilter = '', linkModeFilter = '', days = 30, windowStart = new Date() }) {
  const byPhase = new Map();
  const runIndex = new Map();
  const funnelByChapter = new Map();
  const funnelByPhase = new Map();
  const funnelByChapterPhase = new Map();
  const funnelTimelineByChapter = new Map();
  const daySeries = buildDaySeries(windowStart, days);
  const funnelTimeline = new Map(daySeries.map((day) => [day, {
    day,
    startedRuns: 0,
    completedRuns: 0,
    assessmentsSubmitted: 0,
    linkedAssessments: 0,
    completionRateFromRuns: 0,
    assessmentRateFromCompletedRuns: 0,
    linkedRateFromAssessments: 0
  }]));
  const totals = {
    scenarioRuns: 0,
    completedScenarioRuns: 0,
    scenarioScoreSum: 0,
    assessments: 0,
    assessmentScoreSum: 0,
    linkedAssessments: 0
  };

  for (const state of safeArray(states)) {
    const userId = String(state.userId || '');
    const itemStyle = styleByUser.get(userId) || '';
    if (styleFilter && itemStyle !== styleFilter) continue;

    const runs = state.stateJson?.campaignScenarioRuns || {};
    for (const run of Object.values(runs)) {
      const chapterId = String(run?.chapterId || '').trim();
      const phaseId = String(run?.phaseId || '').trim();
      const runStatus = String(run?.status || '').trim().toLowerCase();
      if (!chapterId || !phaseId) continue;

      if (run?.runId) {
        runIndex.set(String(run.runId), {
          chapterId,
          phaseId,
          runId: String(run.runId),
          status: run?.status || null
        });
      }

      if (chapterFilter && chapterId !== chapterFilter) continue;
      if (phaseFilter && phaseId !== phaseFilter) continue;
      if (runStatusFilter && runStatus !== runStatusFilter) continue;

      const key = `${chapterId}:${phaseId}`;
      const chapterFunnel = funnelByChapter.get(chapterId) || createCampaignFunnelAccumulator({ chapterId });
      chapterFunnel.startedRuns += 1;
      if (run?.status === 'completed') {
        chapterFunnel.completedRuns += 1;
      }
      funnelByChapter.set(chapterId, chapterFunnel);

      const phaseFunnel = funnelByPhase.get(phaseId) || createCampaignFunnelAccumulator({ phaseId });
      phaseFunnel.startedRuns += 1;
      if (run?.status === 'completed') {
        phaseFunnel.completedRuns += 1;
      }
      funnelByPhase.set(phaseId, phaseFunnel);

      const chapterPhaseFunnel = funnelByChapterPhase.get(key) || createCampaignFunnelAccumulator({ chapterId, phaseId });
      chapterPhaseFunnel.startedRuns += 1;
      if (run?.status === 'completed') {
        chapterPhaseFunnel.completedRuns += 1;
      }
      funnelByChapterPhase.set(key, chapterPhaseFunnel);

      const startedDayKey = toDayKey(run?.startedAt || run?.createdAt || run?.updatedAt);
      if (startedDayKey && funnelTimeline.has(startedDayKey)) {
        const dayItem = funnelTimeline.get(startedDayKey);
        dayItem.startedRuns += 1;
        funnelTimeline.set(startedDayKey, dayItem);
      }
      if (startedDayKey) {
        const chapterDayKey = `${chapterId}:${startedDayKey}`;
        const chapterDayItem = funnelTimelineByChapter.get(chapterDayKey) || {
          chapterId,
          day: startedDayKey,
          ...createCampaignFunnelAccumulator()
        };
        chapterDayItem.startedRuns += 1;
        funnelTimelineByChapter.set(chapterDayKey, chapterDayItem);
      }

      if (run?.status === 'completed') {
        const completedDayKey = toDayKey(run?.completedAt || run?.updatedAt || run?.startedAt);
        if (completedDayKey && funnelTimeline.has(completedDayKey)) {
          const dayItem = funnelTimeline.get(completedDayKey);
          dayItem.completedRuns += 1;
          funnelTimeline.set(completedDayKey, dayItem);
        }
        if (completedDayKey) {
          const chapterDayKey = `${chapterId}:${completedDayKey}`;
          const chapterDayItem = funnelTimelineByChapter.get(chapterDayKey) || {
            chapterId,
            day: completedDayKey,
            ...createCampaignFunnelAccumulator()
          };
          chapterDayItem.completedRuns += 1;
          funnelTimelineByChapter.set(chapterDayKey, chapterDayItem);
        }
      }

      const current = byPhase.get(key) || {
        chapterId,
        phaseId,
        scenarioRuns: 0,
        completedScenarioRuns: 0,
        scenarioScoreSum: 0,
        scenarioScoreCount: 0,
        assessments: 0,
        assessmentScoreSum: 0,
        assessmentScoreCount: 0,
        linkedAssessments: 0,
        users: new Set()
      };

      current.scenarioRuns += 1;
      totals.scenarioRuns += 1;
      current.users.add(userId);

      if (run?.status === 'completed') {
        current.completedScenarioRuns += 1;
        totals.completedScenarioRuns += 1;
      }

      if (Number.isFinite(Number(run?.scoreDelta))) {
        current.scenarioScoreSum += Number(run.scoreDelta);
        current.scenarioScoreCount += 1;
        totals.scenarioScoreSum += Number(run.scoreDelta);
      }

      byPhase.set(key, current);
    }
  }

  for (const submission of safeArray(submissions)) {
    const userId = String(submission.userId || '');
    const itemStyle = styleByUser.get(userId) || '';
    if (styleFilter && itemStyle !== styleFilter) continue;

    const campaignContext = submission.submissionJson?.answers?.[0]?.campaignContext || submission.submissionJson?.campaignContext || null;
    const chapterId = String(campaignContext?.chapterId || '').trim();
    const phaseId = String(campaignContext?.phaseId || '').trim();
    if (!chapterId || !phaseId) continue;
    if (chapterFilter && chapterId !== chapterFilter) continue;
    if (phaseFilter && phaseId !== phaseFilter) continue;

    const key = `${chapterId}:${phaseId}`;
    const current = byPhase.get(key) || {
      chapterId,
      phaseId,
      scenarioRuns: 0,
      completedScenarioRuns: 0,
      scenarioScoreSum: 0,
      scenarioScoreCount: 0,
      assessments: 0,
      assessmentScoreSum: 0,
      assessmentScoreCount: 0,
      linkedAssessments: 0,
      users: new Set()
    };

    const simulationRunId = String(submission.submissionJson?.simulationRunId || '').trim();
    const linkedRun = simulationRunId ? runIndex.get(simulationRunId) : null;
    const isLinked = Boolean(linkedRun);
    if (linkModeFilter === 'linked' && !isLinked) continue;
    if (linkModeFilter === 'unlinked' && isLinked) continue;

    const attributedPhaseId = String(linkedRun?.phaseId || phaseId).trim() || phaseId;
    const chapterFunnel = funnelByChapter.get(chapterId) || createCampaignFunnelAccumulator({ chapterId });
    chapterFunnel.assessmentsSubmitted += 1;
    if (linkedRun) {
      chapterFunnel.linkedAssessments += 1;
    }
    funnelByChapter.set(chapterId, chapterFunnel);

    const phaseFunnel = funnelByPhase.get(attributedPhaseId) || createCampaignFunnelAccumulator({ phaseId: attributedPhaseId });
    phaseFunnel.assessmentsSubmitted += 1;
    if (linkedRun) {
      phaseFunnel.linkedAssessments += 1;
    }
    funnelByPhase.set(attributedPhaseId, phaseFunnel);

    const chapterPhaseFunnelKey = `${chapterId}:${attributedPhaseId}`;
    const chapterPhaseFunnel = funnelByChapterPhase.get(chapterPhaseFunnelKey) || createCampaignFunnelAccumulator({ chapterId, phaseId: attributedPhaseId });
    chapterPhaseFunnel.assessmentsSubmitted += 1;
    if (linkedRun) {
      chapterPhaseFunnel.linkedAssessments += 1;
    }
    funnelByChapterPhase.set(chapterPhaseFunnelKey, chapterPhaseFunnel);

    const submissionDayKey = toDayKey(submission.createdAt);
    if (submissionDayKey && funnelTimeline.has(submissionDayKey)) {
      const dayItem = funnelTimeline.get(submissionDayKey);
      dayItem.assessmentsSubmitted += 1;
      if (linkedRun) {
        dayItem.linkedAssessments += 1;
      }
      funnelTimeline.set(submissionDayKey, dayItem);
    }
    if (submissionDayKey) {
      const chapterDayKey = `${chapterId}:${submissionDayKey}`;
      const chapterDayItem = funnelTimelineByChapter.get(chapterDayKey) || {
        chapterId,
        day: submissionDayKey,
        ...createCampaignFunnelAccumulator()
      };
      chapterDayItem.assessmentsSubmitted += 1;
      if (linkedRun) {
        chapterDayItem.linkedAssessments += 1;
      }
      funnelTimelineByChapter.set(chapterDayKey, chapterDayItem);
    }

    current.assessments += 1;
    current.users.add(userId);
    totals.assessments += 1;
    if (linkedRun) {
      current.linkedAssessments += 1;
      totals.linkedAssessments += 1;
    }

    if (Number.isFinite(Number(submission.aiScore))) {
      current.assessmentScoreSum += Number(submission.aiScore);
      current.assessmentScoreCount += 1;
      totals.assessmentScoreSum += Number(submission.aiScore);
    }

    byPhase.set(key, current);
  }

  const byChapterPhase = [...byPhase.values()]
    .map((item) => ({
      chapterId: item.chapterId,
      phaseId: item.phaseId,
      users: item.users.size,
      scenarioRuns: item.scenarioRuns,
      completedScenarioRuns: item.completedScenarioRuns,
      averageScenarioScore: item.scenarioScoreCount
        ? Number((item.scenarioScoreSum / item.scenarioScoreCount).toFixed(2))
        : 0,
      assessments: item.assessments,
      linkedAssessments: item.linkedAssessments,
      averageAssessmentScore: item.assessmentScoreCount
        ? Number((item.assessmentScoreSum / item.assessmentScoreCount).toFixed(2))
        : 0,
      assessmentCoverageRate: item.completedScenarioRuns
        ? Number(((item.assessments / item.completedScenarioRuns) * 100).toFixed(2))
        : 0
    }))
    .sort((a, b) => b.averageAssessmentScore - a.averageAssessmentScore || b.averageScenarioScore - a.averageScenarioScore || a.chapterId.localeCompare(b.chapterId) || a.phaseId.localeCompare(b.phaseId));

  const timeline = [...funnelTimeline.values()].map((item) => ({
    ...item,
    completionRateFromRuns: item.startedRuns
      ? Number(((item.completedRuns / item.startedRuns) * 100).toFixed(2))
      : 0,
    assessmentRateFromCompletedRuns: item.completedRuns
      ? Number(((item.assessmentsSubmitted / item.completedRuns) * 100).toFixed(2))
      : 0,
    linkedRateFromAssessments: item.assessmentsSubmitted
      ? Number(((item.linkedAssessments / item.assessmentsSubmitted) * 100).toFixed(2))
      : 0
  }));

  const timelineByChapter = [...funnelTimelineByChapter.values()]
    .map((item) => finalizeCampaignFunnel(item))
    .sort((a, b) => a.chapterId.localeCompare(b.chapterId) || b.day.localeCompare(a.day));

  return {
    totals: {
      scenarioRuns: totals.scenarioRuns,
      completedScenarioRuns: totals.completedScenarioRuns,
      averageScenarioScore: totals.scenarioRuns ? Number((totals.scenarioScoreSum / totals.scenarioRuns).toFixed(2)) : 0,
      assessments: totals.assessments,
      averageAssessmentScore: totals.assessments ? Number((totals.assessmentScoreSum / totals.assessments).toFixed(2)) : 0,
      linkedAssessments: totals.linkedAssessments
    },
    funnel: {
      startedRuns: totals.scenarioRuns,
      completedRuns: totals.completedScenarioRuns,
      assessmentsSubmitted: totals.assessments,
      linkedAssessments: totals.linkedAssessments,
      completionRateFromRuns: totals.scenarioRuns ? Number(((totals.completedScenarioRuns / totals.scenarioRuns) * 100).toFixed(2)) : 0,
      assessmentRateFromCompletedRuns: totals.completedScenarioRuns ? Number(((totals.assessments / totals.completedScenarioRuns) * 100).toFixed(2)) : 0,
      linkedRateFromAssessments: totals.assessments ? Number(((totals.linkedAssessments / totals.assessments) * 100).toFixed(2)) : 0
    },
    funnelByChapter: [...funnelByChapter.values()]
      .map((item) => finalizeCampaignFunnel(item))
      .sort((a, b) => b.assessmentsSubmitted - a.assessmentsSubmitted || b.completedRuns - a.completedRuns || a.chapterId.localeCompare(b.chapterId)),
    funnelByPhase: [...funnelByPhase.values()]
      .map((item) => finalizeCampaignFunnel(item))
      .sort((a, b) => b.assessmentsSubmitted - a.assessmentsSubmitted || b.completedRuns - a.completedRuns || a.phaseId.localeCompare(b.phaseId)),
    funnelByChapterPhase: [...funnelByChapterPhase.values()]
      .map((item) => finalizeCampaignFunnel(item))
      .sort((a, b) => b.assessmentsSubmitted - a.assessmentsSubmitted || b.completedRuns - a.completedRuns || a.chapterId.localeCompare(b.chapterId) || a.phaseId.localeCompare(b.phaseId)),
    funnelTimeline: timeline,
    funnelTimelineByChapter: timelineByChapter,
    byChapterPhase
  };
}

function summarizeTwistLogs(twistLogs = []) {
  const totalTriggered = twistLogs.length;
  const totalResolved = twistLogs.filter((item) => item.status === 'resolved').length;
  const resolutionRate = totalTriggered ? Number(((totalResolved / totalTriggered) * 100).toFixed(2)) : 0;

  const byKindMap = new Map();
  for (const item of twistLogs) {
    const key = item.kind || 'unknown';
    const current = byKindMap.get(key) || {
      kind: key,
      triggered: 0,
      resolved: 0,
      lastTriggeredAt: null
    };

    current.triggered += 1;
    if (item.status === 'resolved') current.resolved += 1;
    current.lastTriggeredAt = current.lastTriggeredAt || item.triggeredAt;
    byKindMap.set(key, current);
  }

  const byKind = [...byKindMap.values()].map((item) => ({
    ...item,
    resolutionRate: item.triggered ? Number(((item.resolved / item.triggered) * 100).toFixed(2)) : 0
  }));

  return {
    totalTriggered,
    totalResolved,
    resolutionRate,
    byKind,
    latestKind: twistLogs[0]?.kind || null,
    latestStatus: twistLogs[0]?.status || null
  };
}

function buildTemporalTwistWindows(twistLogs = []) {
  const now = Date.now();
  const last7Start = now - (7 * 24 * 60 * 60 * 1000);
  const last30Start = now - (30 * 24 * 60 * 60 * 1000);

  const last7DaysLogs = twistLogs.filter((item) => new Date(item.triggeredAt).getTime() >= last7Start);
  const last30DaysLogs = twistLogs.filter((item) => new Date(item.triggeredAt).getTime() >= last30Start);

  const summarized7 = summarizeTwistLogs(last7DaysLogs);
  const summarized30 = summarizeTwistLogs(last30DaysLogs);

  return {
    last7Days: {
      triggered: summarized7.totalTriggered,
      resolved: summarized7.totalResolved,
      resolutionRate: summarized7.resolutionRate
    },
    last30Days: {
      triggered: summarized30.totalTriggered,
      resolved: summarized30.totalResolved,
      resolutionRate: summarized30.resolutionRate
    }
  };
}

async function buildStyleComparison({ tenantId, userId, dominantStyle, userTwistLogs }) {
  const styleKey = normalizeTag(dominantStyle);
  if (!styleKey) {
    return {
      dominantStyle: null,
      currentUserLast30ResolutionRate: 0,
      styleAverageLast30ResolutionRate: 0,
      tenantAverageLast30ResolutionRate: 0,
      deltaVsStyleAverage: 0,
      deltaVsTenantAverage: 0
    };
  }

  const last30Start = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  const [styleProfiles, tenantTwistLogs] = await Promise.all([
    LearningStyleProfile.findAll({
      where: { tenantId },
      attributes: ['userId', 'dominantStyle']
    }).catch(() => []),
    JourneyTwistLog.findAll({
      where: { tenantId, triggeredAt: { [Op.gte]: last30Start } },
      attributes: ['userId', 'status', 'triggeredAt']
    }).catch(() => [])
  ]);

  const styleByUser = new Map(
    styleProfiles.map((item) => [String(item.userId), normalizeTag(item.dominantStyle)])
  );

  const aggregateByUser = new Map();
  for (const log of tenantTwistLogs) {
    const key = String(log.userId);
    const current = aggregateByUser.get(key) || { triggered: 0, resolved: 0 };
    current.triggered += 1;
    if (log.status === 'resolved') current.resolved += 1;
    aggregateByUser.set(key, current);
  }

  const rates = [...aggregateByUser.entries()].map(([uid, stats]) => ({
    userId: uid,
    style: styleByUser.get(uid) || '',
    resolutionRate: stats.triggered ? Number(((stats.resolved / stats.triggered) * 100).toFixed(2)) : 0
  }));

  const styleRates = rates.filter((item) => item.style === styleKey);
  const tenantAverage = rates.length
    ? Number((rates.reduce((acc, item) => acc + item.resolutionRate, 0) / rates.length).toFixed(2))
    : 0;
  const styleAverage = styleRates.length
    ? Number((styleRates.reduce((acc, item) => acc + item.resolutionRate, 0) / styleRates.length).toFixed(2))
    : 0;

  const userLast30Summary = summarizeTwistLogs(
    safeArray(userTwistLogs).filter((item) => new Date(item.triggeredAt) >= last30Start)
  );

  return {
    dominantStyle: styleKey,
    currentUserLast30ResolutionRate: userLast30Summary.resolutionRate,
    styleAverageLast30ResolutionRate: styleAverage,
    tenantAverageLast30ResolutionRate: tenantAverage,
    deltaVsStyleAverage: Number((userLast30Summary.resolutionRate - styleAverage).toFixed(2)),
    deltaVsTenantAverage: Number((userLast30Summary.resolutionRate - tenantAverage).toFixed(2))
  };
}

function asPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildDaySeries(dayStart, days) {
  const series = [];
  const start = new Date(dayStart);
  for (let index = 0; index < days; index += 1) {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + index);
    series.push(current.toISOString().slice(0, 10));
  }
  return series;
}

function normalizeCampaignScenarioRunsMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([runId, item]) => ([runId, {
      ...(item || {}),
      runId
    }]))
  );
}

function listCampaignScenarioRuns(value) {
  return Object.values(normalizeCampaignScenarioRunsMap(value))
    .sort((a, b) => new Date(b.updatedAt || b.completedAt || b.startedAt || 0).getTime() - new Date(a.updatedAt || a.completedAt || a.startedAt || 0).getTime());
}

async function buildEffectivenessSignals({ tenantId, userId, activeMission, competencyMatrix, style }) {
  const twistLogs = await JourneyTwistLog.findAll({
    where: { tenantId, userId },
    order: [['triggeredAt', 'DESC']],
    limit: 120
  }).catch(() => []);

  const summarizedTwists = summarizeTwistLogs(twistLogs);
  const temporalWindows = buildTemporalTwistWindows(twistLogs);
  const profileComparison = await buildStyleComparison({
    tenantId,
    userId,
    dominantStyle: style?.dominantStyle,
    userTwistLogs: twistLogs
  });

  return {
    twist: {
      ...summarizedTwists,
      windows: temporalWindows,
      profileComparison
    },
    competencies: buildCompetencyMomentum(competencyMatrix),
    mission: buildMissionCompetencyCoverage(activeMission, competencyMatrix)
  };
}

export async function getJourneyEffectivenessAnalytics(tenantId, filters = {}) {
  const days = Math.min(90, asPositiveInt(filters?.days, 30));
  const styleFilter = normalizeTag(filters?.style);
  const kindFilter = normalizeTag(filters?.kind);
  const chapterFilter = String(filters?.chapterId || '').trim();
  const phaseFilter = String(filters?.phaseId || '').trim();
  const runStatusFilter = String(filters?.runStatus || '').trim().toLowerCase();
  const linkModeFilter = String(filters?.linkMode || '').trim().toLowerCase();
  const windowStart = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

  const allProfiles = await LearningStyleProfile.findAll({
    where: { tenantId },
    attributes: ['userId', 'dominantStyle']
  }).catch(() => []);

  const styleByUser = new Map(
    allProfiles.map((item) => [String(item.userId), normalizeTag(item.dominantStyle)])
  );

  const logs = await JourneyTwistLog.findAll({
    where: {
      tenantId,
      triggeredAt: { [Op.gte]: windowStart }
    },
    attributes: ['userId', 'kind', 'status', 'triggeredAt'],
    order: [['triggeredAt', 'DESC']]
  }).catch(() => []);

  const campaignEvents = await JourneyEvent.findAll({
    where: {
      tenantId,
      createdAt: { [Op.gte]: windowStart },
      eventType: { [Op.in]: ['chapter_unlocked', 'chapter_completed'] }
    },
    attributes: ['userId', 'eventType', 'metadata', 'createdAt'],
    order: [['createdAt', 'DESC']]
  }).catch(() => []);

  const campaignStates = await JourneyState.findAll({
    where: {
      tenantId,
      updatedAt: { [Op.gte]: windowStart }
    },
    attributes: ['userId', 'stateJson', 'updatedAt']
  }).catch(() => []);

  const assessmentSubmissions = await AssessmentSubmission.findAll({
    where: {
      tenantId,
      createdAt: { [Op.gte]: windowStart }
    },
    attributes: ['userId', 'submissionJson', 'aiScore', 'createdAt']
  }).catch(() => []);

  const filteredLogs = logs.filter((item) => {
    const itemStyle = styleByUser.get(String(item.userId)) || '';
    const styleOk = styleFilter ? itemStyle === styleFilter : true;
    const kindOk = kindFilter ? normalizeTag(item.kind) === kindFilter : true;
    return styleOk && kindOk;
  });

  const filteredCampaignEvents = campaignEvents.filter((item) => {
    const itemStyle = styleByUser.get(String(item.userId)) || '';
    const styleOk = styleFilter ? itemStyle === styleFilter : true;
    const chapterOk = chapterFilter ? String(item.metadata?.chapterId || '').trim() === chapterFilter : true;
    const phaseOk = phaseFilter ? String(item.metadata?.phaseId || '').trim() === phaseFilter : true;
    return styleOk && chapterOk && phaseOk;
  });

  const globalSummary = summarizeTwistLogs(filteredLogs);
  const daySeries = buildDaySeries(windowStart, days);

  const users = new Map();
  const seriesByDay = new Map(daySeries.map((day) => [day, { day, triggered: 0, resolved: 0, resolutionRate: 0 }]));
  const heatmap = new Map();
  for (const log of filteredLogs) {
    const key = String(log.userId);
    const current = users.get(key) || { userId: key, triggered: 0, resolved: 0 };
    current.triggered += 1;
    if (log.status === 'resolved') current.resolved += 1;
    users.set(key, current);

    const dayKey = toDayKey(log.triggeredAt);
    if (dayKey && seriesByDay.has(dayKey)) {
      const dayItem = seriesByDay.get(dayKey);
      dayItem.triggered += 1;
      if (log.status === 'resolved') dayItem.resolved += 1;
      dayItem.resolutionRate = dayItem.triggered
        ? Number(((dayItem.resolved / dayItem.triggered) * 100).toFixed(2))
        : 0;
      seriesByDay.set(dayKey, dayItem);
    }

    const style = styleByUser.get(key) || 'unknown';
    const kind = normalizeTag(log.kind) || 'unknown';
    const heatmapKey = `${kind}::${style}`;
    const cell = heatmap.get(heatmapKey) || {
      kind,
      dominantStyle: style,
      triggered: 0,
      resolved: 0,
      resolutionRate: 0
    };
    cell.triggered += 1;
    if (log.status === 'resolved') cell.resolved += 1;
    cell.resolutionRate = cell.triggered
      ? Number(((cell.resolved / cell.triggered) * 100).toFixed(2))
      : 0;
    heatmap.set(heatmapKey, cell);
  }

  const usersSummary = [...users.values()].map((item) => ({
    userId: item.userId,
    dominantStyle: styleByUser.get(item.userId) || null,
    triggered: item.triggered,
    resolved: item.resolved,
    resolutionRate: item.triggered ? Number(((item.resolved / item.triggered) * 100).toFixed(2)) : 0
  }));

  const byStyle = new Map();
  for (const userItem of usersSummary) {
    const key = userItem.dominantStyle || 'unknown';
    const current = byStyle.get(key) || {
      dominantStyle: key,
      users: 0,
      triggered: 0,
      resolved: 0
    };

    current.users += 1;
    current.triggered += userItem.triggered;
    current.resolved += userItem.resolved;
    byStyle.set(key, current);
  }

  const styleSummary = [...byStyle.values()].map((item) => ({
    ...item,
    resolutionRate: item.triggered ? Number(((item.resolved / item.triggered) * 100).toFixed(2)) : 0
  }));

  const campaignSummary = summarizeCampaignAnalytics(filteredCampaignEvents, days, windowStart);
  const campaignQuality = summarizeCampaignQualityAnalytics({
    states: campaignStates,
    submissions: assessmentSubmissions,
    styleByUser,
    styleFilter,
    chapterFilter,
    phaseFilter,
    runStatusFilter,
    linkModeFilter,
    days,
    windowStart
  });

  return {
    window: {
      days,
      startAt: windowStart.toISOString(),
      endAt: new Date().toISOString()
    },
    filters: {
      style: styleFilter || null,
      kind: kindFilter || null,
      chapterId: chapterFilter || null,
      phaseId: phaseFilter || null,
      runStatus: runStatusFilter || null,
      linkMode: linkModeFilter || null
    },
    totals: {
      users: usersSummary.length,
      triggered: globalSummary.totalTriggered,
      resolved: globalSummary.totalResolved,
      resolutionRate: globalSummary.resolutionRate
    },
    byKind: globalSummary.byKind,
    byStyle: styleSummary,
    campaign: campaignSummary,
    campaignQuality,
    timeSeries: [...seriesByDay.values()],
    heatmapKindStyle: [...heatmap.values()]
      .sort((a, b) => b.resolutionRate - a.resolutionRate || b.triggered - a.triggered),
    topUsers: usersSummary
      .sort((a, b) => b.resolutionRate - a.resolutionRate || b.triggered - a.triggered)
      .slice(0, 10)
  };
}

async function readLatestTwist(tenantId, userId) {
  const latestPersistent = await JourneyTwistLog.findOne({
    where: { tenantId, userId },
    order: [['triggeredAt', 'DESC']]
  }).catch(() => null);

  if (latestPersistent) {
    return {
      id: latestPersistent.id,
      twistRuleId: latestPersistent.twistRuleId || null,
      kind: latestPersistent.kind,
      title: latestPersistent.title,
      narrative: latestPersistent.narrative,
      impact: latestPersistent.impactJson || {},
      suggestedAction: latestPersistent.suggestedAction || '',
      status: latestPersistent.status,
      createdAt: latestPersistent.triggeredAt,
      resolvedAt: latestPersistent.resolvedAt || null,
      resolutionNotes: latestPersistent.resolutionNotes || null
    };
  }

  const latest = await JourneyEvent.findOne({
    where: { tenantId, userId, eventType: 'plot_twist_triggered' },
    order: [['createdAt', 'DESC']]
  }).catch(() => null);

  if (!latest) return null;
  return {
    id: latest.id,
    kind: latest.metadata?.kind || 'context_shift',
    title: latest.metadata?.title || 'Plot twist',
    narrative: latest.metadata?.narrative || '',
    impact: latest.metadata?.impact || {},
    suggestedAction: latest.metadata?.suggestedAction || '',
    createdAt: latest.createdAt
  };
}

async function ensureRuntimeCatalog(tenantId) {
  const [missionsCount, twistRulesCount] = await Promise.all([
    JourneyMission.count({ where: { tenantId } }).catch(() => 0),
    JourneyTwistRule.count({ where: { tenantId } }).catch(() => 0)
  ]);

  if (!missionsCount) {
    await JourneyMission.bulkCreate(DEFAULT_MISSION_LIBRARY.map((item, index) => ({
      id: uuidv4(),
      tenantId,
      code: item.id,
      title: item.title,
      context: item.context,
      objective: item.objective,
      riskLevel: item.riskLevel || 'medio',
      stakeholdersJson: item.stakeholders || [],
      choicesJson: item.choices || [],
      consequencesJson: item.consequences || {},
      evidenceTargetsJson: item.evidenceTargets || [],
      competenciesImpactedJson: item.competenciesImpacted || [],
      completionCriteriaJson: item.completionCriteria || [],
      optionalTwistTriggersJson: item.optionalTwistTriggers || [],
      trackSlug: item.trackSlug || null,
      targetArea: item.targetArea || null,
      audienceStylesJson: item.audienceStyles || [],
      sourceType: 'curated',
      sortOrder: index,
      active: true
    }))).catch(() => null);
  }

  if (!twistRulesCount) {
    await JourneyTwistRule.bulkCreate(PLOT_TWIST_LIBRARY.map((item, index) => ({
      id: uuidv4(),
      tenantId,
      kind: item.kind,
      title: item.title,
      narrative: item.narrative,
      impactJson: item.impact || {},
      suggestedAction: item.suggestedAction || null,
      triggerConditionJson: {},
      rarity: index === 0 ? 'rare' : 'common',
      cooldownMinutes: 0,
      priority: index,
      active: true
    }))).catch(() => null);
  }
}

export async function getJourneyExperienceRuntime(tenantId, userId) {
  await ensureRuntimeCatalog(tenantId);

  const twistRules = await JourneyTwistRule.findAll({
    where: { tenantId, active: true },
    order: [['priority', 'ASC'], ['createdAt', 'ASC']]
  }).catch(() => []);

  const twistCatalog = twistRules.length
    ? twistRules.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        narrative: item.narrative,
        impact: item.impactJson || {},
        suggestedAction: item.suggestedAction || '',
        priority: item.priority,
        rarity: item.rarity
      }))
    : PLOT_TWIST_LIBRARY;

  const [journeyFlow, journeyStateRecord, profile, goal, style, gamification, competencyMatrix, latestTwist, latestDecision, simulations] = await Promise.all([
    getJourneyFlowState(tenantId, userId),
    JourneyState.findOne({ where: { tenantId, userId } }),
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningGoal.findOne({ where: { tenantId, userId, status: 'active' }, order: [['createdAt', 'DESC']] }),
    LearningStyleProfile.findOne({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] }),
    getGamificationSummary(tenantId, userId),
    getCompetencyMatrix(tenantId, userId),
    readLatestTwist(tenantId, userId),
    JourneyEvent.findOne({ where: { tenantId, userId, eventType: 'step_completed' }, order: [['createdAt', 'DESC']] }),
    SimulationRun.findAll({ where: { tenantId, userId }, order: [['createdAt', 'DESC']], limit: 5 })
  ]);

  const activeMission = await resolveActiveMission(tenantId, userId, { profile, style, goal });
  const campaignProgress = normalizeCampaignProgress(journeyStateRecord?.stateJson?.campaignProgress, null);
  const campaignScenarioRuns = listCampaignScenarioRuns(journeyStateRecord?.stateJson?.campaignScenarioRuns);
  const steps = safeArray(journeyFlow?.journeyState?.steps);
  const mapNodes = buildMissionMapNodes(steps);
  const progressPercent = asNumber(journeyFlow?.journeyState?.progress, asNumber(journeyFlow?.progressState?.progressPercent, 0));
  const twist = chooseTwistCandidate({
    progressPercent,
    streak: asNumber(gamification?.streak?.current, 0),
    latestTwist
  }) || twistCatalog[0];

  const mentorRuntime = buildMentorRuntime({
    profile,
    style,
    activeMission,
    latestDecision
  });

  const phaseResult = buildPhaseResult({
    progressPercent,
    competencyMatrix,
    gamification
  });

  const effectiveness = await buildEffectivenessSignals({
    tenantId,
    userId,
    activeMission,
    competencyMatrix,
    style
  });
  const derivedMission = buildDerivedMission({
    activeMission,
    weakestCompetency: phaseResult?.recurringGaps?.[0],
    phaseResult,
    goal,
    profile
  });
  const campaignChapters = buildCampaignChapters({
    runtimeMission: activeMission,
    derivedMission,
    phaseResult,
    weakestCompetency: phaseResult?.recurringGaps?.[0]
  });

  return {
    runtimeVersion: 'journey-experience-runtime.v1',
    generatedAt: new Date().toISOString(),
    learner: {
      id: userId,
      displayName: profile?.displayName || null,
      profile: {
        contextType: profile?.contextType || null,
        area: profile?.area || null,
        experienceLevel: profile?.experienceLevel || null
      },
      goal: {
        title: goal?.title || null,
        goalType: goal?.goalType || null,
        description: goal?.description || null
      },
      learningStyle: {
        dominantStyle: style?.dominantStyle || 'explorador',
        mentorshipStyle: style?.mentorshipStyle || mentorRuntime.mentorMode,
        contentPreference: style?.contentPreference || null,
        simulationFormat: style?.simulationFormat || null
      }
    },
    journey: {
      state: journeyFlow?.journeyState || null,
      campaignProgress,
      campaignScenarioRuns,
      activeStepId: steps.find((item) => item.status === 'active')?.id || steps[0]?.id || null,
      progressPercent,
      level: asNumber(journeyFlow?.journeyState?.level, asNumber(gamification?.level, 1)),
      xpTotal: asNumber(journeyFlow?.journeyState?.xpTotal, asNumber(gamification?.xp?.total, 0)),
      streak: asNumber(journeyFlow?.journeyState?.streak, asNumber(gamification?.streak?.current, 0)),
      map: {
        nodes: mapNodes,
        episodes: mapNodes.length,
        missionNodes: mapNodes.filter((item) => item.nodeType === 'mission').length,
        eventNodes: mapNodes.filter((item) => item.nodeType === 'event').length,
        bossNodes: mapNodes.filter((item) => item.nodeType === 'boss').length
      }
    },
    mission: activeMission,
    plotTwist: {
      enabled: true,
      nextCandidate: twist,
      latest: latestTwist,
      catalog: twistCatalog,
      triggerHints: ['progress_plateau', 'low_streak', 'critical_step_transition']
    },
    mentor: mentorRuntime,
    campaign: {
      chapters: campaignChapters
    },
    competencies: competencyMatrix,
    effectiveness,
    phaseResult,
    telemetry: {
      eventsTracked: asNumber(journeyFlow?.telemetrySummary?.eventsTracked, 0),
      lastEventAt: journeyFlow?.telemetrySummary?.lastEventAt || null,
      recentSimulations: simulations.map((item) => ({
        id: item.id,
        status: item.status,
        score: asNumber(item.totalScore, 0),
        startedAt: item.startedAt,
        completedAt: item.completedAt
      }))
    }
  };
}

export async function saveJourneyCampaignProgress(tenantId, userId, payload = {}) {
  const [state] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: null,
      currentStepId: null,
      progressPercent: 0,
      lastEventAt: new Date(),
      stateJson: {}
    }
  });

  const stateJson = state.stateJson || {};
  const previousCampaignProgress = normalizeCampaignProgress(stateJson.campaignProgress || null, null);
  const campaignProgress = normalizeCampaignProgress(payload, stateJson.campaignProgress || null);

  await state.update({
    lastEventAt: new Date(),
    stateJson: {
      ...stateJson,
      campaignProgress
    }
  });

  await trackCampaignProgressEvents({
    tenantId,
    userId,
    previousProgress: previousCampaignProgress,
    nextProgress: campaignProgress
  });

  return {
    campaignProgress,
    runtime: await getJourneyExperienceRuntime(tenantId, userId)
  };
}

export async function triggerJourneyPlotTwist(tenantId, userId, payload = {}) {
  const runtime = await getJourneyExperienceRuntime(tenantId, userId);
  const requestedKind = String(payload.kind || '').trim();

  const selected = requestedKind
    ? safeArray(runtime?.plotTwist?.catalog).find((item) => item.kind === requestedKind)
    : null;

  const twist = selected || runtime.plotTwist.nextCandidate || safeArray(runtime?.plotTwist?.catalog)[0] || PLOT_TWIST_LIBRARY[0];

  const journeyState = await JourneyState.findOne({ where: { tenantId, userId } });
  const twistRuleId = safeArray(runtime?.plotTwist?.catalog).find((item) => item.kind === twist.kind)?.id || null;

  const twistLog = await JourneyTwistLog.create({
    id: uuidv4(),
    tenantId,
    userId,
    journeyStateId: journeyState?.id || null,
    twistRuleId,
    kind: twist.kind,
    title: twist.title,
    narrative: twist.narrative,
    impactJson: twist.impact || {},
    suggestedAction: twist.suggestedAction || null,
    status: 'triggered',
    triggeredAt: new Date(),
    metadata: {
      source: payload.source || 'runtime_engine'
    }
  }).catch(() => null);

  const eventPayload = {
    eventType: 'plot_twist_triggered',
    stepId: runtime.journey.activeStepId,
    level: runtime.journey.level,
    streak: runtime.journey.streak,
    metadata: {
      kind: twist.kind,
      title: twist.title,
      narrative: twist.narrative,
      impact: twist.impact,
      suggestedAction: twist.suggestedAction,
      twistRuleId,
      twistLogId: twistLog?.id || null,
      source: payload.source || 'runtime_engine'
    },
    createdAt: new Date().toISOString()
  };

  await trackTelemetryEvent({
    tenantId,
    userId,
    payload: eventPayload
  });

  const state = journeyState;
  if (state) {
    const stateJson = state.stateJson || {};
    const history = safeArray(stateJson.plotTwistHistory);
    const eventEntry = {
      id: uuidv4(),
      ...eventPayload,
      createdAt: eventPayload.createdAt
    };

    await state.update({
      lastEventAt: new Date(),
      stateJson: {
        ...stateJson,
        latestPlotTwist: eventEntry,
        plotTwistHistory: [...history, eventEntry].slice(-40)
      }
    });
  }

  await recordGamificationEvent(tenantId, userId, {
    eventType: 'mentor_interaction',
    source: 'plot_twist_engine',
    metadata: {
      twistKind: twist.kind,
      activeMissionId: runtime.mission?.id || null
    }
  });

  const refreshed = await getJourneyExperienceRuntime(tenantId, userId);
  return {
    twist: {
      ...twist,
      id: twistLog?.id || null,
      status: 'triggered',
      triggeredAt: eventPayload.createdAt
    },
    runtime: refreshed
  };
}

export async function resolveJourneyPlotTwist(tenantId, userId, payload = {}) {
  const twistLogId = String(payload?.twistLogId || '').trim();

  const log = twistLogId
    ? await JourneyTwistLog.findOne({ where: { id: twistLogId, tenantId, userId } })
    : await JourneyTwistLog.findOne({
        where: { tenantId, userId, status: 'triggered' },
        order: [['triggeredAt', 'DESC']]
      });

  if (!log) {
    throw new Error('Nenhum plot twist pendente encontrado para resolucao.');
  }

  if (log.status === 'resolved') {
    return {
      resolvedTwist: {
        id: log.id,
        kind: log.kind,
        status: log.status,
        resolvedAt: log.resolvedAt,
        resolutionNotes: log.resolutionNotes || null
      },
      runtime: await getJourneyExperienceRuntime(tenantId, userId)
    };
  }

  const resolvedAt = new Date();
  await log.update({
    status: 'resolved',
    resolvedAt,
    resolutionNotes: String(payload?.resolutionNotes || '').trim() || 'Twist resolvido na campanha.'
  });

  await trackTelemetryEvent({
    tenantId,
    userId,
    payload: {
      eventType: 'plot_twist_resolved',
      stepId: payload?.stepId || null,
      metadata: {
        twistLogId: log.id,
        kind: log.kind,
        resolutionNotes: log.resolutionNotes || null
      },
      createdAt: resolvedAt.toISOString()
    }
  });

  await recordGamificationEvent(tenantId, userId, {
    eventType: 'daily_return',
    source: 'plot_twist_resolution',
    metadata: {
      twistLogId: log.id,
      kind: log.kind
    }
  });

  const state = await JourneyState.findOne({ where: { tenantId, userId } });
  if (state) {
    const stateJson = state.stateJson || {};
    const latest = stateJson.latestPlotTwist || null;
    if (latest?.id === log.id || latest?.metadata?.twistLogId === log.id) {
      await state.update({
        stateJson: {
          ...stateJson,
          latestPlotTwist: {
            ...latest,
            status: 'resolved',
            resolvedAt: resolvedAt.toISOString(),
            resolutionNotes: log.resolutionNotes || null
          }
        }
      });
    }
  }

  const runtime = await getJourneyExperienceRuntime(tenantId, userId);
  return {
    resolvedTwist: {
      id: log.id,
      kind: log.kind,
      status: 'resolved',
      resolvedAt: resolvedAt.toISOString(),
      resolutionNotes: log.resolutionNotes || null
    },
    runtime
  };
}
