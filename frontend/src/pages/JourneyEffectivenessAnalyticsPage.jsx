import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Button, EmptyState, ExperienceCard, StageWrapper } from '../components/index.js';
import { getJourneyEffectivenessAnalytics } from '../services/journeyRuntimeApi.js';

const EffectivenessInsightsSection = lazy(() => import('../features/analytics/EffectivenessInsightsSection.jsx'));
const OperationalAnalyticsSection = lazy(() => import('../features/analytics/OperationalAnalyticsSection.jsx'));

const initialFilters = {
  days: 30,
  style: '',
  kind: '',
  chapterId: '',
  phaseId: '',
  runStatus: '',
  linkMode: ''
};

const MAX_RECENT_GLOBAL_FUNNEL_DAYS = 7;
const MAX_CHAPTER_TREND_DAYS = 3;
const MAX_CHAPTER_TREND_GROUPS = 4;

function AnalyticsSectionFallback({ title }) {
  return (
    <ExperienceCard title={title} variant="default">
      <div className="list compact-list">
        <div className="list-item">Carregando seção...</div>
      </div>
    </ExperienceCard>
  );
}

export default function JourneyEffectivenessAnalyticsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compactTrendView, setCompactTrendView] = useState(true);

  async function load(payload = filters) {
    setLoading(true);
    setError('');
    try {
      const response = await getJourneyEffectivenessAnalytics(payload);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao carregar analytics de efetividade.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(initialFilters);
  }, []);

  const topUsers = useMemo(() => data?.topUsers || [], [data]);
  const byKind = useMemo(() => data?.byKind || [], [data]);
  const byStyle = useMemo(() => data?.byStyle || [], [data]);
  const campaignSummary = useMemo(() => data?.campaign || null, [data]);
  const campaignQuality = useMemo(() => data?.campaignQuality || null, [data]);
  const campaignByChapter = useMemo(() => campaignSummary?.byChapter || [], [campaignSummary]);
  const campaignTimeline = useMemo(() => campaignSummary?.timeline || [], [campaignSummary]);
  const campaignQualityByPhase = useMemo(() => campaignQuality?.byChapterPhase || [], [campaignQuality]);
  const funnel = useMemo(() => campaignQuality?.funnel || null, [campaignQuality]);
  const funnelByChapter = useMemo(() => campaignQuality?.funnelByChapter || [], [campaignQuality]);
  const funnelByPhase = useMemo(() => campaignQuality?.funnelByPhase || [], [campaignQuality]);
  const funnelTimeline = useMemo(() => campaignQuality?.funnelTimeline || [], [campaignQuality]);
  const funnelTimelineByChapter = useMemo(() => campaignQuality?.funnelTimelineByChapter || [], [campaignQuality]);
  const activeFunnelTimeline = useMemo(() => {
    return funnelTimeline
      .filter((item) => Number(item.startedRuns || 0) > 0 || Number(item.completedRuns || 0) > 0 || Number(item.assessmentsSubmitted || 0) > 0)
      .sort((a, b) => b.day.localeCompare(a.day));
  }, [funnelTimeline]);
  const recentFunnelTimeline = useMemo(() => {
    return activeFunnelTimeline
      .slice(0, MAX_RECENT_GLOBAL_FUNNEL_DAYS);
  }, [activeFunnelTimeline]);
  const fullChapterTrendGroups = useMemo(() => {
    const grouped = new Map();

    for (const item of funnelTimelineByChapter) {
      const totalActivity = Number(item.startedRuns || 0) + Number(item.completedRuns || 0) + Number(item.assessmentsSubmitted || 0);
      if (totalActivity <= 0) continue;

      const current = grouped.get(item.chapterId) || {
        chapterId: item.chapterId,
        totalActivity: 0,
        entries: []
      };

      current.totalActivity += totalActivity;
      current.entries.push(item);
      grouped.set(item.chapterId, current);
    }

    return [...grouped.values()]
      .map((group) => ({
        ...group,
        entries: group.entries.sort((a, b) => b.day.localeCompare(a.day))
      }))
      .sort((a, b) => b.totalActivity - a.totalActivity || a.chapterId.localeCompare(b.chapterId));
  }, [funnelTimelineByChapter]);
  const recentChapterTrendGroups = useMemo(() => {
    return fullChapterTrendGroups
      .map((group) => ({
        ...group,
        entries: group.entries.slice(0, MAX_CHAPTER_TREND_DAYS)
      }))
      .slice(0, MAX_CHAPTER_TREND_GROUPS);
  }, [fullChapterTrendGroups]);
  const displayedFunnelTimeline = compactTrendView ? recentFunnelTimeline : activeFunnelTimeline;
  const displayedChapterTrendGroups = compactTrendView ? recentChapterTrendGroups : fullChapterTrendGroups;
  const timeSeries = useMemo(() => data?.timeSeries || [], [data]);
  const heatmapKindStyle = useMemo(() => data?.heatmapKindStyle || [], [data]);

  async function applyFilters(event) {
    event.preventDefault();
    await load(filters);
  }

  return (
    <StageWrapper
      stageKey="journey-effectiveness-analytics"
      title="Analytics de efetividade"
      subtitle="Leitura administrativa por tenant com recortes de período, estilo dominante e tipo de twist"
      completed={Number(data?.totals?.resolutionRate || 0)}
      total={100}
      variant="default"
      loading={loading}
    >
      <ExperienceCard title="Filtros de leitura" variant="mentor">
        <form className="stack-form" onSubmit={applyFilters}>
          <label>
            Janela (dias)
            <select
              className="state-select-shell"
              value={String(filters.days)}
              onChange={(event) => setFilters((prev) => ({ ...prev, days: Number(event.target.value) }))}
            >
              <option value="7">7</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </select>
          </label>

          <label>
            Estilo dominante
            <select
              className="state-select-shell"
              value={filters.style}
              onChange={(event) => setFilters((prev) => ({ ...prev, style: event.target.value }))}
            >
              <option value="">todos</option>
              <option value="explorador">explorador</option>
              <option value="pratico">pratico</option>
              <option value="narrativo">narrativo</option>
              <option value="analitico">analitico</option>
            </select>
          </label>

          <label>
            Kind de twist
            <input
              value={filters.kind}
              onChange={(event) => setFilters((prev) => ({ ...prev, kind: event.target.value }))}
              placeholder="Ex: new_information"
            />
          </label>

          <label>
            Capítulo
            <input
              value={filters.chapterId}
              onChange={(event) => setFilters((prev) => ({ ...prev, chapterId: event.target.value }))}
              placeholder="Ex: capitulo-2"
            />
          </label>

          <label>
            Fase
            <input
              value={filters.phaseId}
              onChange={(event) => setFilters((prev) => ({ ...prev, phaseId: event.target.value }))}
              placeholder="Ex: assessment"
            />
          </label>

          <label>
            Status do run
            <select
              className="state-select-shell"
              value={filters.runStatus}
              onChange={(event) => setFilters((prev) => ({ ...prev, runStatus: event.target.value }))}
            >
              <option value="">todos</option>
              <option value="active">active</option>
              <option value="completed">completed</option>
            </select>
          </label>

          <label>
            Vínculo
            <select
              className="state-select-shell"
              value={filters.linkMode}
              onChange={(event) => setFilters((prev) => ({ ...prev, linkMode: event.target.value }))}
            >
              <option value="">todos</option>
              <option value="linked">linked</option>
              <option value="unlinked">unlinked</option>
            </select>
          </label>

          <div className="campaign-actions">
            <Button type="submit">Aplicar filtros</Button>
            <Button type="button" variant="secondary" onClick={() => {
              setFilters(initialFilters);
              load(initialFilters);
            }}>
              Resetar
            </Button>
          </div>
        </form>
      </ExperienceCard>

      {error ? <div className="error-box">{error}</div> : null}

      {data ? (
        <div className="stats-grid">
          <div className="list-item">
            <strong>Usuários</strong>
            <p>{data?.totals?.users || 0}</p>
          </div>
          <div className="list-item">
            <strong>Twists disparados</strong>
            <p>{data?.totals?.triggered || 0}</p>
          </div>
          <div className="list-item">
            <strong>Twists resolvidos</strong>
            <p>{data?.totals?.resolved || 0}</p>
          </div>
          <div className="list-item">
            <strong>Taxa de resolução</strong>
            <p>{Number(data?.totals?.resolutionRate || 0).toFixed(2)}%</p>
          </div>
          <div className="list-item">
            <strong>Capítulos desbloqueados</strong>
            <p>{campaignSummary?.totals?.chaptersUnlocked || 0}</p>
          </div>
          <div className="list-item">
            <strong>Capítulos concluídos</strong>
            <p>{campaignSummary?.totals?.chaptersCompleted || 0}</p>
          </div>
          <div className="list-item">
            <strong>Taxa de conclusão</strong>
            <p>{Number(campaignSummary?.totals?.completionRate || 0).toFixed(2)}%</p>
          </div>
          <div className="list-item">
            <strong>Runs de simulação</strong>
            <p>{campaignQuality?.totals?.scenarioRuns || 0}</p>
          </div>
          <div className="list-item">
            <strong>Média de assessment</strong>
            <p>{Number(campaignQuality?.totals?.averageAssessmentScore || 0).toFixed(2)}</p>
          </div>
          <div className="list-item">
            <strong>Assessments vinculados</strong>
            <p>{campaignQuality?.totals?.linkedAssessments || 0}</p>
          </div>
        </div>
      ) : null}

      <Suspense fallback={<AnalyticsSectionFallback title="Insights de efetividade" />}>
        <EffectivenessInsightsSection
          byKind={byKind}
          byStyle={byStyle}
          topUsers={topUsers}
          timeSeries={timeSeries}
          heatmapKindStyle={heatmapKindStyle}
        />
      </Suspense>

      <Suspense fallback={<AnalyticsSectionFallback title="Leitura operacional da campanha" />}>
        <OperationalAnalyticsSection
          campaignByChapter={campaignByChapter}
          campaignTimeline={campaignTimeline}
          campaignQualityByPhase={campaignQualityByPhase}
          funnel={funnel}
          funnelByChapter={funnelByChapter}
          funnelByPhase={funnelByPhase}
          displayedFunnelTimeline={displayedFunnelTimeline}
          displayedChapterTrendGroups={displayedChapterTrendGroups}
          compactTrendView={compactTrendView}
          onToggleTrendView={() => setCompactTrendView((current) => !current)}
          maxRecentGlobalDays={MAX_RECENT_GLOBAL_FUNNEL_DAYS}
          maxChapterTrendDays={MAX_CHAPTER_TREND_DAYS}
          maxChapterTrendGroups={MAX_CHAPTER_TREND_GROUPS}
        />
      </Suspense>
    </StageWrapper>
  );
}
