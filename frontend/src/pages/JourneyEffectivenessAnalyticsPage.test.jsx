import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const getJourneyEffectivenessAnalyticsMock = vi.fn();
const ASYNC_TIMEOUT = 5000;

vi.mock('../services/journeyRuntimeApi.js', () => ({
  getJourneyEffectivenessAnalytics: (...args) => getJourneyEffectivenessAnalyticsMock(...args)
}));

import JourneyEffectivenessAnalyticsPage from './JourneyEffectivenessAnalyticsPage.jsx';

describe('JourneyEffectivenessAnalyticsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('carrega analytics iniciais e aplica filtros', async () => {
    getJourneyEffectivenessAnalyticsMock
      .mockResolvedValueOnce({
        totals: { users: 2, triggered: 5, resolved: 3, resolutionRate: 60 },
        campaign: {
          totals: { chaptersUnlocked: 3, chaptersCompleted: 2, completionRate: 66.67 },
          byChapter: [{ chapterId: 'capitulo-1', unlocked: 2, completed: 1, completedUsers: 1, completionRate: 50 }],
          timeline: [{ day: '2026-04-01', unlocked: 2, completed: 1 }]
        },
        campaignQuality: {
          totals: { scenarioRuns: 3, completedScenarioRuns: 2, averageScenarioScore: 4.5, assessments: 2, averageAssessmentScore: 7.5, linkedAssessments: 1 },
          funnel: { startedRuns: 3, completedRuns: 2, assessmentsSubmitted: 2, linkedAssessments: 1, completionRateFromRuns: 66.67, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 50 },
          funnelByChapter: [{ chapterId: 'capitulo-1', startedRuns: 3, completedRuns: 2, assessmentsSubmitted: 2, linkedAssessments: 1, completionRateFromRuns: 66.67, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 50 }],
          funnelByPhase: [{ phaseId: 'cenario', startedRuns: 3, completedRuns: 2, assessmentsSubmitted: 2, linkedAssessments: 1, completionRateFromRuns: 66.67, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 50 }],
          funnelTimeline: [
            { day: '2026-04-02', startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 },
            { day: '2026-04-01', startedRuns: 2, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 50, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 }
          ],
          funnelTimelineByChapter: [
            { chapterId: 'capitulo-1', day: '2026-04-02', startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 },
            { chapterId: 'capitulo-1', day: '2026-04-01', startedRuns: 2, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 50, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 }
          ],
          byChapterPhase: [{ chapterId: 'capitulo-1', phaseId: 'assessment', scenarioRuns: 2, completedScenarioRuns: 1, averageScenarioScore: 4.5, assessments: 1, linkedAssessments: 1, averageAssessmentScore: 7.5, assessmentCoverageRate: 100 }]
        },
        byKind: [{ kind: 'new_information', triggered: 2, resolved: 1, resolutionRate: 50 }],
        byStyle: [{ dominantStyle: 'analitico', users: 1, triggered: 2, resolved: 1, resolutionRate: 50 }],
        timeSeries: [{ day: '2026-04-01', triggered: 2, resolved: 1, resolutionRate: 50 }],
        heatmapKindStyle: [{ kind: 'new_information', dominantStyle: 'analitico', triggered: 2, resolved: 1, resolutionRate: 50 }],
        topUsers: [{ userId: 'u-1', dominantStyle: 'analitico', triggered: 2, resolved: 1, resolutionRate: 50 }]
      })
      .mockResolvedValueOnce({
        totals: { users: 1, triggered: 2, resolved: 2, resolutionRate: 100 },
        campaign: {
          totals: { chaptersUnlocked: 1, chaptersCompleted: 1, completionRate: 100 },
          byChapter: [{ chapterId: 'capitulo-2', unlocked: 1, completed: 1, completedUsers: 1, completionRate: 100 }],
          timeline: [{ day: '2026-04-02', unlocked: 1, completed: 1 }]
        },
        campaignQuality: {
          totals: { scenarioRuns: 1, completedScenarioRuns: 1, averageScenarioScore: 6, assessments: 1, averageAssessmentScore: 9, linkedAssessments: 1 },
          funnel: { startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 },
          funnelByChapter: [{ chapterId: 'capitulo-2', startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 }],
          funnelByPhase: [{ phaseId: 'cenario', startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 }],
          funnelTimeline: [{ day: '2026-04-02', startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 }],
          funnelTimelineByChapter: [{ chapterId: 'capitulo-2', day: '2026-04-02', startedRuns: 1, completedRuns: 1, assessmentsSubmitted: 1, linkedAssessments: 1, completionRateFromRuns: 100, assessmentRateFromCompletedRuns: 100, linkedRateFromAssessments: 100 }],
          byChapterPhase: [{ chapterId: 'capitulo-2', phaseId: 'assessment', scenarioRuns: 1, completedScenarioRuns: 1, averageScenarioScore: 6, assessments: 1, linkedAssessments: 1, averageAssessmentScore: 9, assessmentCoverageRate: 100 }]
        },
        byKind: [{ kind: 'deadline_reduction', triggered: 2, resolved: 2, resolutionRate: 100 }],
        byStyle: [{ dominantStyle: 'pratico', users: 1, triggered: 2, resolved: 2, resolutionRate: 100 }],
        timeSeries: [{ day: '2026-04-02', triggered: 2, resolved: 2, resolutionRate: 100 }],
        heatmapKindStyle: [{ kind: 'deadline_reduction', dominantStyle: 'pratico', triggered: 2, resolved: 2, resolutionRate: 100 }],
        topUsers: [{ userId: 'u-2', dominantStyle: 'pratico', triggered: 2, resolved: 2, resolutionRate: 100 }]
      });

    render(<JourneyEffectivenessAnalyticsPage />);

    expect(await screen.findByText('Twists disparados', {}, { timeout: ASYNC_TIMEOUT })).toBeInTheDocument();
    expect(await screen.findByText('new_information', {}, { timeout: ASYNC_TIMEOUT })).toBeInTheDocument();
    expect(await screen.findByText('capitulo-1 · assessment', {}, { timeout: ASYNC_TIMEOUT })).toBeInTheDocument();

    expect(screen.getByText('Progressão por capítulo')).toBeInTheDocument();
    expect(screen.getByText('Qualidade por fase da campanha')).toBeInTheDocument();
    expect(screen.getByText('Funil da campanha')).toBeInTheDocument();
    expect(screen.getByText('Funil por capítulo')).toBeInTheDocument();
    expect(screen.getByText('Funil por fase')).toBeInTheDocument();
    expect(screen.getByText('Tendência de vínculo por dia')).toBeInTheDocument();
    expect(screen.getByText('Tendência por capítulo')).toBeInTheDocument();
    expect(screen.getByText('Visão compacta para leitura executiva.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver visão completa' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('capitulo-1').length).toBeGreaterThan(0));
    expect(screen.getByText('capitulo-1 · 2026-04-01')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver visão completa' }));
    expect(await screen.findByText('Visão completa para investigação detalhada.', {}, { timeout: ASYNC_TIMEOUT })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar para visão compacta' })).toBeInTheDocument();
    expect(screen.getByText('Exibindo todos os dias com atividade no período.')).toBeInTheDocument();
    expect(screen.getByText('Exibindo todos os capítulos com atividade e todos os dias disponíveis no período.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('cenario').length).toBeGreaterThan(0));
    await waitFor(() => expect(screen.getAllByText('2026-04-01').length).toBeGreaterThan(0));
    expect(screen.getByText('Série temporal (resolução por dia)')).toBeInTheDocument();
    expect(screen.getByText('Heatmap kind x estilo')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Janela (dias)'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Estilo dominante'), { target: { value: 'pratico' } });
    fireEvent.change(screen.getByLabelText('Kind de twist'), { target: { value: 'deadline_reduction' } });
    fireEvent.change(screen.getByLabelText('Capítulo'), { target: { value: 'capitulo-2' } });
    fireEvent.change(screen.getByLabelText('Fase'), { target: { value: 'assessment' } });
    fireEvent.change(screen.getByLabelText('Status do run'), { target: { value: 'completed' } });
    fireEvent.change(screen.getByLabelText('Vínculo'), { target: { value: 'linked' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(getJourneyEffectivenessAnalyticsMock).toHaveBeenNthCalledWith(1, { days: 30, style: '', kind: '', chapterId: '', phaseId: '', runStatus: '', linkMode: '' });
    expect(getJourneyEffectivenessAnalyticsMock).toHaveBeenNthCalledWith(2, { days: 7, style: 'pratico', kind: 'deadline_reduction', chapterId: 'capitulo-2', phaseId: 'assessment', runStatus: 'completed', linkMode: 'linked' });

    expect(await screen.findByText('deadline_reduction', {}, { timeout: ASYNC_TIMEOUT })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('capitulo-2').length).toBeGreaterThan(0));
    expect(screen.getByText('capitulo-2 · assessment')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('Assessments vinculados').length).toBeGreaterThan(0));
  }, 10000);

  test('exibe erro quando a API falha', async () => {
    getJourneyEffectivenessAnalyticsMock.mockRejectedValue(new Error('Falha de analytics'));

    render(<JourneyEffectivenessAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Falha de analytics')).toBeInTheDocument();
    }, { timeout: ASYNC_TIMEOUT });
  });
});
