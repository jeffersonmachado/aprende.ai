import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useJourneyRuntime } from './JourneyRuntimeContext.jsx';

const CampaignRuntimeContext = createContext(null);

function makePhaseKey(chapterId, phaseId) {
  return `${chapterId}:${phaseId}`;
}

function buildCampaign(runtime) {
  return runtime?.campaign?.chapters || [];
}

function resolveLinkedScenarioRun(chapterId, scenarioRuns = []) {
  return (Array.isArray(scenarioRuns) ? scenarioRuns : []).find((item) => item?.chapterId === chapterId && item?.phaseId === 'cenario') || null;
}

export function CampaignRuntimeProvider({ children }) {
  const { runtime, error, saveCampaignProgress } = useJourneyRuntime();
  const navigate = useNavigate();
  const location = useLocation();
  const { chapterId, phaseId } = useParams();
  const campaignScenarioRuns = runtime?.journey?.campaignScenarioRuns || [];

  const chapters = useMemo(() => buildCampaign(runtime), [runtime]);
  const persistedCampaignProgress = runtime?.journey?.campaignProgress || null;
  const unlockedChapterIds = useMemo(() => {
    return persistedCampaignProgress?.unlockedChapterIds?.length ? persistedCampaignProgress.unlockedChapterIds : [chapters[0]?.id].filter(Boolean);
  }, [chapters, persistedCampaignProgress]);
  const unlockedChapters = useMemo(() => chapters.filter((chapter) => unlockedChapterIds.includes(chapter.id)), [chapters, unlockedChapterIds]);

  const phases = useMemo(() => {
    return unlockedChapters.flatMap((chapter) => {
      const linkedScenarioRun = resolveLinkedScenarioRun(chapter.id, campaignScenarioRuns);
      return chapter.phases.map((phase, index) => ({
        ...phase,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        linkedScenarioRunId: phase.type === 'assessment' ? linkedScenarioRun?.runId || null : null,
        linkedScenarioRun,
        route: `/campaign/${chapter.id}/${phase.id}`,
        localIndex: index
      }));
    });
  }, [campaignScenarioRuns, unlockedChapters]);

  const firstPhase = phases[0] || null;

  const persistedPhase = useMemo(() => {
    if (!persistedCampaignProgress) return null;
    return phases.find((phase) => phase.chapterId === persistedCampaignProgress.chapterId && phase.id === persistedCampaignProgress.phaseId) || null;
  }, [persistedCampaignProgress, phases]);

  const currentPhase = useMemo(() => {
    return phases.find((phase) => phase.chapterId === chapterId && phase.id === phaseId) || persistedPhase || null;
  }, [chapterId, phaseId, phases, persistedPhase]);

  const currentIndex = useMemo(() => {
    if (!currentPhase) return 0;
    return phases.findIndex((phase) => phase.chapterId === currentPhase.chapterId && phase.id === currentPhase.id);
  }, [currentPhase, phases]);

  useEffect(() => {
    if (!firstPhase) return;
    if (!phaseId || !currentPhase) {
      const targetRoute = persistedCampaignProgress?.chapterId && persistedCampaignProgress?.phaseId
        ? `/campaign/${persistedCampaignProgress.chapterId}/${persistedCampaignProgress.phaseId}`
        : (persistedPhase || firstPhase)?.route;
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [currentPhase, firstPhase, location.pathname, navigate, persistedCampaignProgress, persistedPhase, phaseId]);

  const progressPercent = phases.length ? Math.round(((currentIndex + 1) / phases.length) * 100) : 0;
  const nextPhase = currentIndex >= 0 ? phases[currentIndex + 1] || null : null;
  const previousPhase = currentIndex > 0 ? phases[currentIndex - 1] || null : null;
  const currentChapterIndex = chapters.findIndex((chapter) => chapter.id === currentPhase?.chapterId);
  const nextChapter = currentChapterIndex >= 0 ? chapters[currentChapterIndex + 1] || null : null;
  const hasLockedNextChapter = Boolean(nextChapter && !unlockedChapterIds.includes(nextChapter.id));

  useEffect(() => {
    if (!currentPhase) return;

    const currentCompleted = phases.slice(0, currentIndex).map((phase) => makePhaseKey(phase.chapterId, phase.id));
    const currentVisited = phases.slice(0, currentIndex + 1).map((phase) => makePhaseKey(phase.chapterId, phase.id));

    if (
      persistedCampaignProgress?.chapterId === currentPhase.chapterId
      && persistedCampaignProgress?.phaseId === currentPhase.id
      && JSON.stringify(persistedCampaignProgress?.unlockedChapterIds || []) === JSON.stringify(unlockedChapterIds)
      && JSON.stringify(persistedCampaignProgress?.completedPhaseKeys || []) === JSON.stringify(currentCompleted)
      && JSON.stringify(persistedCampaignProgress?.visitedPhaseKeys || []) === JSON.stringify(currentVisited)
    ) {
      return;
    }

    saveCampaignProgress({
      chapterId: currentPhase.chapterId,
      phaseId: currentPhase.id,
      unlockedChapterIds,
      completedPhaseKeys: currentCompleted,
      visitedPhaseKeys: currentVisited,
      totalPhases: phases.length,
      totalChapters: chapters.length
    }).catch(() => null);
  }, [chapters.length, currentIndex, currentPhase, persistedCampaignProgress, phases, saveCampaignProgress, unlockedChapterIds]);

  async function goToNextPhase() {
    const completedPhaseKeys = Array.from(new Set([
      ...phases.slice(0, currentIndex).map((phase) => makePhaseKey(phase.chapterId, phase.id)),
      makePhaseKey(currentPhase?.chapterId, currentPhase?.id)
    ].filter(Boolean)));
    const visitedPhaseKeys = Array.from(new Set([
      ...phases.slice(0, currentIndex + 1).map((phase) => makePhaseKey(phase.chapterId, phase.id)),
      makePhaseKey(currentPhase?.chapterId, currentPhase?.id)
    ].filter(Boolean)));

    if (nextPhase) {
      navigate(nextPhase.route);
      return;
    }

    const currentChapterIndex = chapters.findIndex((chapter) => chapter.id === currentPhase?.chapterId);
    const nextChapter = chapters[currentChapterIndex + 1] || null;
    const alreadyUnlocked = nextChapter ? unlockedChapterIds.includes(nextChapter.id) : false;

    if (nextChapter && !alreadyUnlocked) {
      const nextUnlockedChapters = [...unlockedChapterIds, nextChapter.id];
      const nextFirstPhase = nextChapter.phases[0];
      await saveCampaignProgress({
        chapterId: nextChapter.id,
        phaseId: nextFirstPhase.id,
        unlockedChapterIds: nextUnlockedChapters,
        completedPhaseKeys,
        visitedPhaseKeys: [
          ...visitedPhaseKeys,
          makePhaseKey(nextChapter.id, nextFirstPhase.id)
        ],
        totalPhases: nextChapter.phases.length,
        totalChapters: chapters.length
      }).catch(() => null);
      navigate(`/campaign/${nextChapter.id}/${nextFirstPhase.id}`);
      return;
    }

    await saveCampaignProgress({
      chapterId: currentPhase.chapterId,
      phaseId: currentPhase.id,
      unlockedChapterIds,
      completedPhaseKeys,
      visitedPhaseKeys,
      totalPhases: phases.length,
      totalChapters: chapters.length
    }).catch(() => null);
  }

  const value = useMemo(() => ({
    chapters: unlockedChapters,
    availableChapterCount: unlockedChapters.length,
    totalChapterCount: chapters.length,
    phases,
    currentPhase: currentPhase || firstPhase,
    runtimeError: error,
    currentIndex,
    nextPhase,
    previousPhase,
    totalPhases: phases.length,
    progressPercent,
    isLastPhase: !nextPhase && !hasLockedNextChapter,
    hasLockedNextChapter,
    goToNextPhase,
    goToPreviousPhase() {
      if (previousPhase) navigate(previousPhase.route);
    },
    goToPhase(targetPhase) {
      if (targetPhase?.route) navigate(targetPhase.route);
    }
  }), [chapters.length, currentIndex, currentPhase, error, firstPhase, goToNextPhase, hasLockedNextChapter, navigate, nextPhase, phases, previousPhase, progressPercent, unlockedChapters]);

  return (
    <CampaignRuntimeContext.Provider value={value}>
      {children}
    </CampaignRuntimeContext.Provider>
  );
}

export function useCampaignRuntime() {
  const value = useContext(CampaignRuntimeContext);

  if (!value) {
    throw new Error('useCampaignRuntime precisa ser usado dentro de CampaignRuntimeProvider.');
  }

  return value;
}