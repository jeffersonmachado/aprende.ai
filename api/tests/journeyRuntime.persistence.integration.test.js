import { v4 as uuidv4 } from 'uuid';
import {
  AssessmentSubmission,
  IntegrationEvent,
  JourneyEvent,
  JourneyMission,
  JourneyTwistLog,
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  Role,
  Tenant,
  TenantUser,
  User
} from '../db/models/index.js';
import { sequelize } from '../db/models/index.js';
import {
  saveJourneyCampaignProgress,
  getJourneyEffectivenessAnalytics,
  getJourneyExperienceRuntime,
  resolveJourneyPlotTwist,
  triggerJourneyPlotTwist
} from '../modules/journey-flow/journey-runtime.service.js';
import { JourneyState } from '../db/models/index.js';
import { createScenario, getSimulationState, startSimulation, submitDecision } from '../modules/simulation/simulation.service.js';

describe('journey runtime persistence integration', () => {
  let tenantId;
  let userId;
  let roleId;
  let scenarioId;

  beforeAll(async () => {
    tenantId = uuidv4();
    userId = uuidv4();
    roleId = uuidv4();

    await Tenant.create({
      id: tenantId,
      name: 'Tenant Runtime Persistence Test',
      slug: `runtime-persistence-${tenantId.slice(0, 8)}`,
      status: 'active',
      plan: 'starter',
      settings: { seededBy: 'jest' }
    });

    await Role.create({
      id: roleId,
      tenantId,
      code: 'admin',
      name: 'Administrador',
      description: 'Role para testes de integracao',
      isSystem: true
    });

    await User.create({
      id: userId,
      name: 'Runtime Integration User',
      email: `runtime-${tenantId.slice(0, 8)}@example.com`,
      passwordHash: 'hashed-for-test',
      status: 'active',
      profileMetadata: { source: 'jest' }
    });

    await TenantUser.create({
      id: uuidv4(),
      tenantId,
      userId,
      roleId,
      status: 'active'
    });

    await LearnerProfile.create({
      id: uuidv4(),
      tenantId,
      userId,
      displayName: 'Pessoa Analitica',
      contextType: 'B2B',
      area: 'dados',
      experienceLevel: 'intermediario',
      primaryObjective: 'Tomar decisoes com base em evidencia.'
    });

    await LearningStyleProfile.create({
      id: uuidv4(),
      tenantId,
      userId,
      dominantStyle: 'analitico',
      mentorshipStyle: 'analitico',
      contentPreference: 'casos',
      simulationFormat: 'cenario'
    });

    await LearningGoal.create({
      id: uuidv4(),
      tenantId,
      userId,
      title: 'Decisao orientada a dados para fase critica',
      goalType: 'desenvolver habilidade',
      description: 'Quero evoluir na trilha decisao orientada a dados com menor risco.',
      status: 'active'
    });

    await JourneyMission.create({
      id: uuidv4(),
      tenantId,
      code: 'test-mission-data-001',
      title: 'Missao de Dados para Teste de Persistencia',
      context: 'Contexto de teste para validar targeting por trilha e perfil.',
      objective: 'Selecionar a melhor metrica para decisao executiva.',
      riskLevel: 'alto',
      stakeholdersJson: ['dados', 'produto', 'lideranca'],
      choicesJson: [
        { id: 'choice-a', label: 'Escolher por intuicao', consequence: 'Risco elevado de vies.' },
        { id: 'choice-b', label: 'Escolher por evidencias', consequence: 'Maior robustez decisoria.' }
      ],
      consequencesJson: { bestCase: 'Decisao robusta', worstCase: 'Decisao fragil' },
      evidenceTargetsJson: ['criterio', 'impacto'],
      competenciesImpactedJson: ['analise critica', 'analise de risco'],
      completionCriteriaJson: ['explicar criterio', 'definir plano de revisao'],
      optionalTwistTriggersJson: ['new_information'],
      trackSlug: 'decisao-orientada-a-dados',
      targetArea: 'dados',
      audienceStylesJson: ['analitico'],
      sourceType: 'test',
      sortOrder: -10,
      active: true
    });

    const scenario = await createScenario(tenantId, {
      title: 'Cenario persistido por capitulo',
      context: 'Contexto de teste para vincular run ao capitulo.',
      problem: 'Escolher a melhor resposta para a fase atual.',
      difficulty: 'medium',
      competenciesEvaluated: ['analise critica'],
      options: [
        {
          label: 'Responder com criterio',
          consequence: 'A decisão avança com segurança.',
          impact: { velocidade: 2, assertividade: 4, analise_risco: 4, consistencia: 3 }
        },
        {
          label: 'Responder sem validar',
          consequence: 'A decisão cria ruído no fluxo.',
          impact: { velocidade: 1, assertividade: -2, analise_risco: -3, consistencia: -2 }
        }
      ]
    });

    scenarioId = scenario.id;
  });

  afterAll(async () => {
    await JourneyEvent.destroy({ where: { tenantId, userId } }).catch(() => null);
    await IntegrationEvent.destroy({ where: { tenantId } }).catch(() => null);
    await JourneyState.destroy({ where: { tenantId, userId } });
    await JourneyTwistLog.destroy({ where: { tenantId, userId } });
    await LearningGoal.destroy({ where: { tenantId, userId } });
    await LearningStyleProfile.destroy({ where: { tenantId, userId } });
    await LearnerProfile.destroy({ where: { tenantId, userId } });
    await TenantUser.destroy({ where: { tenantId, userId } });
    await Role.destroy({ where: { tenantId } });
    await User.destroy({ where: { id: userId } });
    await JourneyMission.destroy({ where: { tenantId } });
    await Tenant.destroy({ where: { id: tenantId } });
    await sequelize.close();
  });

  test('seleciona missao aderente ao perfil/meta e persiste trigger + resolve de twist', async () => {
    const runtimeBefore = await getJourneyExperienceRuntime(tenantId, userId);

    expect(runtimeBefore?.mission?.title).toBe('Missao de Dados para Teste de Persistencia');
    expect(runtimeBefore?.mission?.targeting?.trackSlug).toBe('decisao-orientada-a-dados');
    expect(runtimeBefore?.mission?.targeting?.targetArea).toBe('dados');

    let triggerResponse;
    try {
      triggerResponse = await triggerJourneyPlotTwist(tenantId, userId, {
        kind: 'new_information',
        source: 'jest_integration_test'
      });
    } catch (error) {
      throw new Error(`Falha no triggerJourneyPlotTwist: ${error?.message || 'erro'} | db: ${error?.parent?.message || 'n/a'}`);
    }

    expect(triggerResponse?.twist?.status).toBe('triggered');
    expect(triggerResponse?.twist?.id).toBeTruthy();

    const storedTriggered = await JourneyTwistLog.findOne({
      where: { id: triggerResponse.twist.id, tenantId, userId }
    });

    expect(storedTriggered).toBeTruthy();
    expect(storedTriggered.status).toBe('triggered');

    let resolveResponse;
    try {
      resolveResponse = await resolveJourneyPlotTwist(tenantId, userId, {
        twistLogId: triggerResponse.twist.id,
        resolutionNotes: 'Resolvido no teste de persistencia.'
      });
    } catch (error) {
      throw new Error(`Falha no resolveJourneyPlotTwist: ${error?.message || 'erro'} | db: ${error?.parent?.message || 'n/a'}`);
    }

    expect(resolveResponse?.resolvedTwist?.status).toBe('resolved');
    expect(resolveResponse?.resolvedTwist?.id).toBe(triggerResponse.twist.id);

    const storedResolved = await JourneyTwistLog.findOne({
      where: { id: triggerResponse.twist.id, tenantId, userId }
    });

    expect(storedResolved).toBeTruthy();
    expect(storedResolved.status).toBe('resolved');
    expect(storedResolved.resolutionNotes).toMatch(/teste de persistencia/i);

    const runtimeAfter = await getJourneyExperienceRuntime(tenantId, userId);

    expect(runtimeAfter?.plotTwist?.latest?.id).toBe(triggerResponse.twist.id);
    expect(runtimeAfter?.plotTwist?.latest?.status).toBe('resolved');
    expect(runtimeAfter?.plotTwist?.latest?.resolutionNotes).toMatch(/teste de persistencia/i);
    expect(runtimeAfter?.effectiveness?.twist?.totalTriggered).toBeGreaterThanOrEqual(1);
    expect(runtimeAfter?.effectiveness?.twist?.totalResolved).toBeGreaterThanOrEqual(1);
    expect(runtimeAfter?.effectiveness?.twist?.resolutionRate).toBeGreaterThan(0);
    expect(Array.isArray(runtimeAfter?.effectiveness?.twist?.byKind)).toBe(true);
    expect(runtimeAfter?.effectiveness?.twist?.windows?.last7Days?.triggered).toBeGreaterThanOrEqual(1);
    expect(runtimeAfter?.effectiveness?.twist?.windows?.last30Days?.triggered).toBeGreaterThanOrEqual(1);
    expect(runtimeAfter?.effectiveness?.twist?.profileComparison?.dominantStyle).toBe('analitico');
    expect(runtimeAfter?.effectiveness?.twist?.profileComparison?.currentUserLast30ResolutionRate).toBeGreaterThan(0);
    expect(runtimeAfter?.effectiveness?.competencies?.averageScore).toBeDefined();
    expect(runtimeAfter?.effectiveness?.mission?.impactedCount).toBeGreaterThanOrEqual(1);
  });

  test('persiste progresso da campanha no JourneyState e devolve no runtime', async () => {
    const before = await getJourneyExperienceRuntime(tenantId, userId);

    expect(before?.journey?.campaignProgress?.phaseId).toBe('briefing');
    expect(before?.campaign?.chapters).toHaveLength(2);
    expect(before?.campaign?.chapters?.[0]?.phases).toHaveLength(7);
    expect(before?.campaign?.chapters?.[1]?.phases?.[0]?.content?.headline).toMatch(/refinamento/i);
    expect(before?.campaign?.chapters?.[1]?.phases?.[1]?.content?.mission?.title).toMatch(/refinamento/i);
    expect(before?.campaign?.chapters?.[1]?.phases?.[1]?.content?.mission?.choices?.length).toBeGreaterThan(0);
    expect(before?.campaign?.chapters?.[1]?.phases?.[2]?.content?.competencyName).toBeTruthy();
    expect(before?.campaign?.chapters?.[1]?.phases?.[2]?.content?.title).toMatch(/consequencia/i);
    expect(before?.campaign?.chapters?.[1]?.phases?.[5]?.content?.recommendation).toBeTruthy();
    expect(before?.campaign?.chapters?.[1]?.phases?.[5]?.content?.title).toMatch(/resultado/i);
    expect(before?.campaign?.chapters?.[1]?.phases?.[6]?.type).toBe('progression');

    const response = await saveJourneyCampaignProgress(tenantId, userId, {
      chapterId: 'capitulo-1',
      phaseId: 'reflection',
      unlockedChapterIds: ['capitulo-1'],
      completedPhaseKeys: ['capitulo-1:briefing', 'capitulo-1:mission', 'capitulo-1:consequence'],
      visitedPhaseKeys: ['capitulo-1:briefing', 'capitulo-1:mission', 'capitulo-1:consequence', 'capitulo-1:reflection']
    });

    expect(response?.campaignProgress?.phaseId).toBe('reflection');
    expect(response?.campaignProgress?.completedPhaseKeys).toEqual(['capitulo-1:briefing', 'capitulo-1:mission', 'capitulo-1:consequence']);

    const after = await getJourneyExperienceRuntime(tenantId, userId);

    expect(after?.journey?.campaignProgress?.phaseId).toBe('reflection');
    expect(after?.journey?.campaignProgress?.visitedPhaseKeys).toEqual(['capitulo-1:briefing', 'capitulo-1:mission', 'capitulo-1:consequence', 'capitulo-1:reflection']);

    const unlockedResponse = await saveJourneyCampaignProgress(tenantId, userId, {
      chapterId: 'capitulo-2',
      phaseId: 'briefing',
      unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
      completedPhaseKeys: [
        'capitulo-1:briefing',
        'capitulo-1:mission',
        'capitulo-1:consequence',
        'capitulo-1:plot-twist',
        'capitulo-1:reflection',
        'capitulo-1:phase-result',
        'capitulo-1:progression'
      ],
      visitedPhaseKeys: [
        'capitulo-1:briefing',
        'capitulo-1:mission',
        'capitulo-1:consequence',
        'capitulo-1:plot-twist',
        'capitulo-1:reflection',
        'capitulo-1:phase-result',
        'capitulo-1:progression',
        'capitulo-2:briefing'
      ]
    });

    expect(unlockedResponse?.campaignProgress?.chapterId).toBe('capitulo-2');
    expect(unlockedResponse?.campaignProgress?.unlockedChapterIds).toEqual(['capitulo-1', 'capitulo-2']);

    const telemetryEvents = await IntegrationEvent.findAll({
      where: { tenantId, sourceSystem: 'journey-flow' }
    });

    expect(telemetryEvents.map((event) => event.eventName)).toEqual(expect.arrayContaining(['chapter_completed', 'chapter_unlocked']));

    const analytics = await getJourneyEffectivenessAnalytics(tenantId, { days: 30 });

    expect(analytics?.campaign?.totals?.chaptersUnlocked).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaign?.totals?.chaptersCompleted).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaign?.byChapter?.[0]?.chapterId).toBeTruthy();
  });

  test('persiste identidade de capitulo e fase para simulation run da campanha', async () => {
    const run = await startSimulation(tenantId, userId, {
      scenarioId,
      campaignContext: {
        chapterId: 'capitulo-2',
        phaseId: 'cenario',
        chapterTitle: 'Proxima trilha',
        phaseTitle: 'Cenario avancado',
        source: 'campaign'
      }
    });

    expect(run?.campaignContext?.chapterId).toBe('capitulo-2');
    expect(run?.campaignContext?.phaseId).toBe('cenario');

    const runState = await getSimulationState(tenantId, userId, run.id);

    expect(runState?.run?.campaignContext?.chapterId).toBe('capitulo-2');
    expect(runState?.run?.campaignContext?.phaseId).toBe('cenario');

    const selectedOptionId = runState?.episode?.options?.[0]?.id;
    const decision = await submitDecision(tenantId, userId, run.id, {
      selectedOptionId,
      feedbackStyle: 'analitico'
    });

    expect(decision?.run?.campaignContext?.status).toBe('completed');
    expect(decision?.run?.campaignContext?.chapterId).toBe('capitulo-2');

    const state = await JourneyState.findOne({ where: { tenantId, userId } });

    expect(state?.stateJson?.campaignScenarioRuns?.[run.id]?.chapterId).toBe('capitulo-2');
    expect(state?.stateJson?.campaignScenarioRuns?.[run.id]?.phaseId).toBe('cenario');
    expect(state?.stateJson?.campaignScenarioRuns?.[run.id]?.status).toBe('completed');

    await AssessmentSubmission.create({
      id: uuidv4(),
      tenantId,
      userId,
      assessmentId: null,
      assessmentAttemptId: null,
      submissionText: 'Resposta correlacionada ao capítulo.',
      submissionJson: {
        simulationRunId: run.id,
        campaignContext: {
          chapterId: 'capitulo-2',
          phaseId: 'assessment',
          missionTitle: 'Missao de refinamento'
        },
        answers: [
          {
            questionId: 'open',
            answerText: 'Resposta correlacionada ao capítulo.',
            campaignContext: {
              chapterId: 'capitulo-2',
              phaseId: 'assessment',
              missionTitle: 'Missao de refinamento'
            }
          }
        ]
      },
      aiScore: 8.5,
      aiFeedback: 'Boa leitura do capítulo.',
      recommendation: 'Consolidar evidências.',
      nextStepSuggestion: 'Executar nova rodada controlada.'
    });

    const analytics = await getJourneyEffectivenessAnalytics(tenantId, { days: 30 });

    expect(analytics?.campaignQuality?.totals?.scenarioRuns).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaignQuality?.totals?.assessments).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaignQuality?.totals?.linkedAssessments).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaignQuality?.funnelByChapter).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId: 'capitulo-2',
        startedRuns: expect.any(Number),
        assessmentsSubmitted: expect.any(Number),
        linkedAssessments: 1
      })
    ]));
    expect(analytics?.campaignQuality?.funnelByPhase).toEqual(expect.arrayContaining([
      expect.objectContaining({
        phaseId: 'cenario',
        linkedAssessments: 1
      })
    ]));
    expect(analytics?.campaignQuality?.funnelTimeline).toEqual(expect.arrayContaining([
      expect.objectContaining({
        day: expect.any(String),
        assessmentsSubmitted: expect.any(Number),
        linkedAssessments: expect.any(Number)
      })
    ]));
    expect(analytics?.campaignQuality?.funnelTimelineByChapter).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId: 'capitulo-2',
        day: expect.any(String),
        linkedAssessments: expect.any(Number)
      })
    ]));
    expect(analytics?.campaignQuality?.byChapterPhase).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId: 'capitulo-2',
        phaseId: 'assessment',
        linkedAssessments: 1,
        averageAssessmentScore: 8.5
      })
    ]));
  });

  test('aplica filtros combinados de analytics para style, kind, chapter, phase, runStatus e linkMode', async () => {
    const analytics = await getJourneyEffectivenessAnalytics(tenantId, {
      days: 30,
      style: 'analitico',
      kind: 'new_information',
      chapterId: 'capitulo-2',
      phaseId: 'assessment',
      runStatus: 'completed',
      linkMode: 'linked'
    });

    expect(analytics?.filters).toEqual({
      style: 'analitico',
      kind: 'new_information',
      chapterId: 'capitulo-2',
      phaseId: 'assessment',
      runStatus: 'completed',
      linkMode: 'linked'
    });
    expect(analytics?.totals?.triggered).toBeGreaterThanOrEqual(1);
    expect(analytics?.byKind).toEqual([
      expect.objectContaining({
        kind: 'new_information'
      })
    ]);
    expect(analytics?.byStyle).toEqual([
      expect.objectContaining({
        dominantStyle: 'analitico'
      })
    ]);
    expect(analytics?.campaignQuality?.totals?.linkedAssessments).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaignQuality?.byChapterPhase).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId: 'capitulo-2',
        phaseId: 'assessment',
        linkedAssessments: 1,
        averageAssessmentScore: 8.5
      })
    ]));
    expect(analytics?.campaignQuality?.funnelByChapter).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId: 'capitulo-2',
        linkedAssessments: 1
      })
    ]));
  });

  test('separa assessments unlinked quando linkMode=unlinked', async () => {
    await AssessmentSubmission.create({
      id: uuidv4(),
      tenantId,
      userId,
      assessmentId: null,
      assessmentAttemptId: null,
      submissionText: 'Resposta sem vínculo com simulation run.',
      submissionJson: {
        campaignContext: {
          chapterId: 'capitulo-2',
          phaseId: 'assessment',
          missionTitle: 'Missao sem run vinculado'
        },
        answers: [
          {
            questionId: 'open',
            answerText: 'Resposta sem vínculo com simulation run.',
            campaignContext: {
              chapterId: 'capitulo-2',
              phaseId: 'assessment',
              missionTitle: 'Missao sem run vinculado'
            }
          }
        ]
      },
      aiScore: 6.5,
      aiFeedback: 'Resposta válida, mas sem correlação com run da campanha.',
      recommendation: 'Relacionar a evidência ao fluxo operacional quando aplicável.',
      nextStepSuggestion: 'Executar nova rodada com vínculo explícito.'
    });

    const analytics = await getJourneyEffectivenessAnalytics(tenantId, {
      days: 30,
      style: 'analitico',
      chapterId: 'capitulo-2',
      phaseId: 'assessment',
      linkMode: 'unlinked'
    });

    expect(analytics?.filters).toEqual({
      style: 'analitico',
      kind: null,
      chapterId: 'capitulo-2',
      phaseId: 'assessment',
      runStatus: null,
      linkMode: 'unlinked'
    });
    expect(analytics?.campaignQuality?.totals?.assessments).toBeGreaterThanOrEqual(1);
    expect(analytics?.campaignQuality?.totals?.linkedAssessments).toBe(0);
    expect(analytics?.campaignQuality?.byChapterPhase).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId: 'capitulo-2',
        phaseId: 'assessment',
        linkedAssessments: 0,
        averageAssessmentScore: 6.5
      })
    ]));
    expect(analytics?.campaignQuality?.funnelByPhase).toEqual(expect.arrayContaining([
      expect.objectContaining({
        phaseId: 'assessment',
        linkedAssessments: 0
      })
    ]));
  });

  test('isola analytics por estilo entre usuários do mesmo tenant', async () => {
    const secondaryUserId = uuidv4();
    const analyticalTwistId = uuidv4();
    const practicalTwistId = uuidv4();

    await User.create({
      id: secondaryUserId,
      name: 'Runtime Integration User Practical',
      email: `runtime-practical-${tenantId.slice(0, 8)}@example.com`,
      passwordHash: 'hashed-for-test',
      status: 'active',
      profileMetadata: { source: 'jest' }
    });

    await TenantUser.create({
      id: uuidv4(),
      tenantId,
      userId: secondaryUserId,
      roleId,
      status: 'active'
    });

    await LearningStyleProfile.create({
      id: uuidv4(),
      tenantId,
      userId: secondaryUserId,
      dominantStyle: 'pratico',
      mentorshipStyle: 'pratico',
      contentPreference: 'playbooks',
      simulationFormat: 'cenario'
    });

    await JourneyTwistLog.create({
      id: analyticalTwistId,
      tenantId,
      userId,
      journeyStateId: null,
      twistRuleId: null,
      kind: 'context_shift',
      title: 'Mudança de contexto para filtro analítico',
      narrative: 'Evento criado para validar o filtro por estilo analítico.',
      impactJson: {},
      suggestedAction: 'Reavaliar hipóteses.',
      status: 'resolved',
      triggeredAt: new Date(),
      resolvedAt: new Date(),
      resolutionNotes: 'Resolvido no teste.'
    });

    await JourneyTwistLog.create({
      id: practicalTwistId,
      tenantId,
      userId: secondaryUserId,
      journeyStateId: null,
      twistRuleId: null,
      kind: 'deadline_reduction',
      title: 'Prazo reduzido para filtro prático',
      narrative: 'Evento criado para validar o filtro por estilo prático.',
      impactJson: {},
      suggestedAction: 'Redefinir escopo.',
      status: 'triggered',
      triggeredAt: new Date()
    });

    const analyticalAnalytics = await getJourneyEffectivenessAnalytics(tenantId, {
      days: 30,
      style: 'analitico',
      kind: 'context_shift'
    });
    const practicalAnalytics = await getJourneyEffectivenessAnalytics(tenantId, {
      days: 30,
      style: 'pratico',
      kind: 'deadline_reduction'
    });

    expect(analyticalAnalytics?.totals?.users).toBe(1);
    expect(analyticalAnalytics?.totals?.triggered).toBe(1);
    expect(analyticalAnalytics?.totals?.resolved).toBe(1);
    expect(analyticalAnalytics?.byStyle).toEqual([
      expect.objectContaining({
        dominantStyle: 'analitico',
        users: 1,
        triggered: 1,
        resolved: 1
      })
    ]);
    expect(analyticalAnalytics?.byKind).toEqual([
      expect.objectContaining({
        kind: 'context_shift',
        triggered: 1,
        resolved: 1
      })
    ]);

    expect(practicalAnalytics?.totals?.users).toBe(1);
    expect(practicalAnalytics?.totals?.triggered).toBe(1);
    expect(practicalAnalytics?.totals?.resolved).toBe(0);
    expect(practicalAnalytics?.byStyle).toEqual([
      expect.objectContaining({
        dominantStyle: 'pratico',
        users: 1,
        triggered: 1,
        resolved: 0
      })
    ]);
    expect(practicalAnalytics?.byKind).toEqual([
      expect.objectContaining({
        kind: 'deadline_reduction',
        triggered: 1,
        resolved: 0
      })
    ]);

    await JourneyTwistLog.destroy({ where: { id: [analyticalTwistId, practicalTwistId] } });
    await LearningStyleProfile.destroy({ where: { tenantId, userId: secondaryUserId } });
    await TenantUser.destroy({ where: { tenantId, userId: secondaryUserId } });
    await User.destroy({ where: { id: secondaryUserId } });
  });
});
