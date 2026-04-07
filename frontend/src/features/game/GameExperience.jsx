import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import GameHUD from '../../components/game/GameHUD.jsx';
import { useJourneyRuntime } from '../../context/JourneyRuntimeContext.jsx';
import {
  finalizeJourneyEnginePhase,
  getJourneyEngineRuntime,
  resolveJourneyEngineTwist,
  startJourneyEnginePhase,
  submitJourneyEngineDecision,
} from '../../services/journeyEngineApi.js';
import { saveOnboarding } from '../../services/profileApi.js';
import ConsequenceScene from './scenes/ConsequenceScene.jsx';
import DecisionScene from './scenes/DecisionScene.jsx';
import EvaluationScene from './scenes/EvaluationScene.jsx';
import EvolutionScene from './scenes/EvolutionScene.jsx';
import JourneyMapScene from './scenes/JourneyMapScene.jsx';
import MissionScene from './scenes/MissionScene.jsx';
import OnboardingScene from './scenes/OnboardingScene.jsx';

const SCENES = {
  LOADING: 'loading',
  ONBOARDING: 'onboarding',
  MAP: 'map',
  MISSION: 'mission',
  DECISION: 'decision',
  CONSEQUENCE: 'consequence',
  EVALUATION: 'evaluation',
  EVOLUTION: 'evolution',
};

const PAGE_TITLES = {
  [SCENES.LOADING]: 'Carregando',
  [SCENES.ONBOARDING]: '1. Perfil',
  [SCENES.MAP]: '2. Mapa',
  [SCENES.MISSION]: '3. Missão',
  [SCENES.DECISION]: '4. Decisão',
  [SCENES.CONSEQUENCE]: '5. Consequência',
  [SCENES.EVALUATION]: '6. Avaliação',
  [SCENES.EVOLUTION]: '7. Evolução',
};

const SCENE_VARIANTS = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#090816' }}
    >
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(236,72,153,0.15)', borderTopColor: '#ec4899' }}
        />
      </motion.div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-bold" style={{ color: 'rgba(251,207,232,0.7)' }}>Sincronizando com o backend</p>
        <p className="text-sm" style={{ color: 'rgba(251,207,232,0.35)' }}>Carregando estado da jornada…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: '#090816' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        ⚠️
      </div>
      <div>
        <p className="font-bold" style={{ color: '#fca5a5' }}>Falha de sincronização</p>
        <p className="text-sm mt-1" style={{ color: 'rgba(251,207,232,0.45)' }}>{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-3 rounded-xl font-bold text-sm"
        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

function needsOnboarding(journeyRuntime) {
  // Check if the user has set up a profile / started a campaign
  const chapters = journeyRuntime?.campaign?.chapters;
  const hasChapters = Array.isArray(chapters) && chapters.length > 0;
  const hasProgress = Boolean(journeyRuntime?.journey?.progressPercent);
  return !hasChapters && !hasProgress;
}

function resolveActivePhase(runtime, selectedChapter) {
  if (!selectedChapter) return null;
  const phases = selectedChapter.phases || [];
  return phases[0] || null;
}

export default function GameExperience() {
  const { runtime: journeyRuntime, loading: journeyLoading, error: journeyError, refreshRuntime } = useJourneyRuntime();

  const [scene, setScene] = useState(SCENES.LOADING);
  const [engineRuntime, setEngineRuntime] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const [starting, setStarting] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [sceneError, setSceneError] = useState('');

  const initDone = useRef(false);

  // After journey runtime loads, decide initial scene
  useEffect(() => {
    if (journeyLoading) return;
    if (journeyError) {
      setScene(SCENES.MAP); // show map with error handling
      return;
    }
    if (!journeyRuntime) return;
    if (initDone.current) return;
    initDone.current = true;

    if (needsOnboarding(journeyRuntime)) {
      setScene(SCENES.ONBOARDING);
    } else {
      setScene(SCENES.MAP);
    }
  }, [journeyLoading, journeyError, journeyRuntime]);

  // Load engine runtime in background when needed
  const loadEngineRuntime = useCallback(async () => {
    try {
      const data = await getJourneyEngineRuntime();
      setEngineRuntime(data);
      return data;
    } catch {
      // Non-critical: engine runtime can be null
      return null;
    }
  }, []);

  // Onboarding complete
  const handleOnboardingComplete = useCallback(async ({ profile, goal, experienceLevel }) => {
    await saveOnboarding({
      displayName: 'Aprendiz',
      profileKey: profile.key,
      dominantStyle: profile.dominantStyle,
      contextType: profile.contextType,
      area: profile.area,
      experienceLevel,
      primaryObjective: profile.primaryObjective,
      goalTitle: goal.goalTitle,
      goalType: goal.goalType,
      goalDescription: goal.goalDescription,
    });
    await refreshRuntime();
    initDone.current = false; // allow re-evaluation after onboarding
    setScene(SCENES.MAP);
  }, [refreshRuntime]);

  // Select a chapter from the map
  const handleSelectChapter = useCallback(async (chapter) => {
    setSelectedChapter(chapter);
    const phase = resolveActivePhase(journeyRuntime, chapter);
    setActivePhase(phase);

    // Load engine runtime to get mission details
    const eng = await loadEngineRuntime();

    // If chapter/phase has mission data
    const mission = phase?.content?.mission || eng?.mission || null;
    setScene(SCENES.MISSION);

    // Store resolved mission on engineRuntime
    if (mission && eng) {
      setEngineRuntime((prev) => ({ ...(prev || {}), mission }));
    }
  }, [journeyRuntime, loadEngineRuntime]);

  // Accept mission → start phase
  const handleAcceptMission = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    setSceneError('');
    try {
      const phaseId = activePhase?.id;
      const chapterId = selectedChapter?.id;

      if (phaseId && chapterId) {
        const resp = await startJourneyEnginePhase(phaseId, {
          chapterId,
          missionId: activePhase?.content?.mission?.id || null,
        });
        if (resp?.runtime) setEngineRuntime(resp.runtime);
      } else {
        // Load engine runtime to get mission with choices
        await loadEngineRuntime();
      }
      setScene(SCENES.DECISION);
    } catch (err) {
      setSceneError(err?.message || 'Falha ao iniciar a fase.');
    } finally {
      setStarting(false);
    }
  }, [starting, activePhase, selectedChapter, loadEngineRuntime]);

  // Submit decision
  const handleDecide = useCallback(async ({ choiceId, responseText }) => {
    if (deciding) return;
    setDeciding(true);
    setSceneError('');
    try {
      const resp = await submitJourneyEngineDecision({
        chapterId: selectedChapter?.id,
        choiceId,
        responseText,
        phaseId: activePhase?.id,
      });
      if (resp?.runtime) setEngineRuntime(resp.runtime);
      setScene(SCENES.CONSEQUENCE);
    } catch (err) {
      setSceneError(err?.message || 'Falha ao registrar decisão.');
      throw err;
    } finally {
      setDeciding(false);
    }
  }, [deciding, selectedChapter, activePhase]);

  // Continue from consequence
  const handleConsequenceContinue = useCallback(async () => {
    if (continuing) return;
    setContinuing(true);
    setSceneError('');
    try {
      // Resolve twist if active
      const twist = engineRuntime?.latestTwist;
      if (twist && twist.status !== 'resolved') {
        const resp = await resolveJourneyEngineTwist({
          resolutionNotes: 'Resolvido pela ação do usuário na jornada.',
        });
        if (resp?.runtime) setEngineRuntime(resp.runtime);
      }
      setScene(SCENES.EVALUATION);
    } catch (err) {
      setSceneError(err?.message || 'Falha ao processar consequência.');
    } finally {
      setContinuing(false);
    }
  }, [continuing, engineRuntime]);

  // Continue from evaluation
  const handleEvaluationContinue = useCallback(() => {
    setScene(SCENES.EVOLUTION);
  }, []);

  // Continue from evolution → finalize and back to map
  const handleEvolutionContinue = useCallback(async () => {
    setSceneError('');
    try {
      if (activePhase?.id) {
        const resp = await finalizeJourneyEnginePhase({
          phaseId: activePhase.id,
          chapterId: selectedChapter?.id,
        });
        if (resp?.runtime) setEngineRuntime(resp.runtime);
      }
    } catch {
      // Non-critical: finalize is best-effort
    }

    await refreshRuntime();
    // Reset navigation state
    setSelectedChapter(null);
    setActivePhase(null);
    setScene(SCENES.MAP);
  }, [activePhase, selectedChapter, refreshRuntime]);

  // HUD data
  const level = Number(journeyRuntime?.journey?.level || engineRuntime?.level || 1);
  const xp = Number(journeyRuntime?.journey?.xp || engineRuntime?.xp || 0);
  const maxXp = Number(journeyRuntime?.journey?.xpToNextLevel || 200);
  const streak = Number(journeyRuntime?.journey?.streak || engineRuntime?.streak || 0);
  const showHUD = scene !== SCENES.LOADING && scene !== SCENES.ONBOARDING;

  // Resolved mission & world state from engine runtime
  const mission = engineRuntime?.mission || activePhase?.content?.mission || null;
  const worldState = engineRuntime?.worldState || {};
  const latestDecision = engineRuntime?.latestDecision || null;
  const latestConsequence = engineRuntime?.latestConsequence || null;
  const latestTwist = engineRuntime?.latestTwist || null;
  const rewards = engineRuntime?.rewards || engineRuntime?.lastRewards || null;
  const progression = engineRuntime?.progression || null;

  const currentSceneLabel = PAGE_TITLES[scene] || scene;

  if (journeyLoading && scene === SCENES.LOADING) {
    return <LoadingScreen />;
  }

  if (journeyError && scene === SCENES.LOADING) {
    return <ErrorScreen message={journeyError} onRetry={refreshRuntime} />;
  }

  return (
    <div
      className="relative w-full"
      style={{ fontFamily: '"Sora", "Space Grotesk", sans-serif', minHeight: '100vh' }}
    >
      {/* HUD overlay */}
      {showHUD && (
        <GameHUD
          level={level}
          xp={xp}
          maxXp={maxXp}
          streak={streak}
          sceneLabel={currentSceneLabel}
        />
      )}

      {/* Scenes with AnimatePresence */}
      <AnimatePresence mode="wait">
        {/* LOADING */}
        {scene === SCENES.LOADING && (
          <motion.div key="loading" {...SCENE_VARIANTS} transition={{ duration: 0.3 }}>
            <LoadingScreen />
          </motion.div>
        )}

        {/* ONBOARDING */}
        {scene === SCENES.ONBOARDING && (
          <motion.div key="onboarding" {...SCENE_VARIANTS} transition={{ duration: 0.4 }}>
            <OnboardingScene onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {/* MAP */}
        {scene === SCENES.MAP && (
          <motion.div key="map" {...SCENE_VARIANTS} transition={{ duration: 0.35 }}>
            <JourneyMapScene
              runtime={journeyRuntime}
              onSelectChapter={handleSelectChapter}
              onRefresh={refreshRuntime}
              refreshing={journeyLoading}
            />
          </motion.div>
        )}

        {/* MISSION */}
        {scene === SCENES.MISSION && (
          <motion.div key="mission" {...SCENE_VARIANTS} transition={{ duration: 0.4 }}>
            <MissionScene
              chapter={selectedChapter}
              mission={mission}
              engineRuntime={engineRuntime}
              onAccept={handleAcceptMission}
              onBack={() => setScene(SCENES.MAP)}
              starting={starting}
            />
          </motion.div>
        )}

        {/* DECISION */}
        {scene === SCENES.DECISION && (
          <motion.div key="decision" {...SCENE_VARIANTS} transition={{ duration: 0.4 }}>
            <DecisionScene
              mission={mission}
              worldState={worldState}
              onDecide={handleDecide}
              deciding={deciding}
            />
          </motion.div>
        )}

        {/* CONSEQUENCE */}
        {scene === SCENES.CONSEQUENCE && (
          <motion.div key="consequence" {...SCENE_VARIANTS} transition={{ duration: 0.4 }}>
            <ConsequenceScene
              consequence={latestConsequence}
              decision={latestDecision}
              twist={latestTwist}
              rewards={rewards}
              onContinue={handleConsequenceContinue}
              continuing={continuing}
            />
          </motion.div>
        )}

        {/* EVALUATION */}
        {scene === SCENES.EVALUATION && (
          <motion.div key="evaluation" {...SCENE_VARIANTS} transition={{ duration: 0.4 }}>
            <EvaluationScene
              engineRuntime={engineRuntime}
              onContinue={handleEvaluationContinue}
            />
          </motion.div>
        )}

        {/* EVOLUTION */}
        {scene === SCENES.EVOLUTION && (
          <motion.div key="evolution" {...SCENE_VARIANTS} transition={{ duration: 0.4 }}>
            <EvolutionScene
              progression={progression}
              rewards={rewards}
              onContinue={handleEvolutionContinue}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global scene error */}
      {sceneError && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium"
          style={{
            background: 'rgba(239,68,68,0.9)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth: '90vw',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => setSceneError('')}
        >
          {sceneError} · clique para fechar
        </motion.div>
      )}
    </div>
  );
}
