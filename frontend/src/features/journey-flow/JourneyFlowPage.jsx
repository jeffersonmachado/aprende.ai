import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JourneyEngine from '../../components/journey/JourneyEngine.jsx';
import {
  claimJourneyReward,
  completeJourneyStep,
  getJourneyFlowState,
  saveJourneyFlowState
} from '../../services/journeyFlowApi.js';
import { postJourneyTelemetryEvent } from '../../services/journeyTelemetryApi.js';

function getActiveStep(state) {
  return state?.steps?.find((item) => item.status === 'active')?.id || state?.steps?.[0]?.id || '1';
}

export default function JourneyFlowPage() {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [journeyState, setJourneyState] = useState(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let mounted = true;

    getJourneyFlowState()
      .then((payload) => {
        if (!mounted) return;

        const nextState = payload?.journeyState;
        if (nextState) {
          setJourneyState(nextState);
          const active = getActiveStep(nextState);
          if (stepParam !== String(active)) {
            navigate(`/journey-flow/${active}`, { replace: true });
          }
          return;
        }

        navigate('/journey-flow/1', { replace: true });
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate, stepParam]);

  const selectedStepId = useMemo(() => {
    if (stepParam) return stepParam;
    return getActiveStep(journeyState);
  }, [stepParam, journeyState]);

  async function handleStateChange(nextState) {
    setJourneyState(nextState);
    const active = getActiveStep(nextState);

    saveJourneyFlowState({
      step: Number(active),
      journeyState: nextState,
      journeyTelemetry: {
        eventType: 'journey_synced',
        stepId: active,
        level: nextState.level,
        streak: nextState.streak,
        metadata: {
          progress: nextState.progress,
          xpTotal: nextState.xpTotal
        },
        createdAt: new Date().toISOString()
      }
    }).catch(() => null);
  }

  function handleSelect(step) {
    if (!step?.id) return;
    navigate(`/journey-flow/${step.id}`);
  }

  const selectedReward = useMemo(() => {
    const rewardKey = `step-${selectedStepId}`;
    return (journeyState?.rewards || journeyState?.rewardsState?.items || []).find((item) => item.key === rewardKey || item.id === rewardKey) || null;
  }, [journeyState, selectedStepId]);

  async function handleClaimReward() {
    if (!selectedReward || selectedReward.claimed || !selectedReward.unlockedAt) return;

    setIsClaimingReward(true);
    setClaimError('');

    try {
      const response = await claimJourneyReward(selectedReward.key || selectedReward.id);
      if (response?.rewardsState) {
        setJourneyState((previous) => ({
          ...(previous || {}),
          rewards: response.rewardsState.items,
          rewardsState: response.rewardsState
        }));
      }
    } catch (error) {
      setClaimError(error?.message || 'Nao foi possivel resgatar a recompensa agora.');
    } finally {
      setIsClaimingReward(false);
    }
  }

  if (isLoading || !journeyState) {
    return (
      <div className="page-stack">
        <h2 className="text-2xl font-semibold text-muted-900">Carregando jornada imersiva...</h2>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">aprende.ai</p>
        <h2 className="text-3xl font-semibold tracking-tight text-muted-900">Jornada Cognitiva Masterclass</h2>
        <p className="text-sm text-muted-600">Gamificacao real, mentor IA protagonista e progressao por evidencias em cada etapa.</p>
      </div>

      <JourneyEngine
        mode={isMobile ? 'mobile' : 'map'}
        journeyState={journeyState}
        selectedStepId={selectedStepId}
        onStepSelect={handleSelect}
        onTelemetryEvent={(event) => {
          postJourneyTelemetryEvent(event).catch(() => null);
        }}
        onStateChange={handleStateChange}
        onStepComplete={async (step) => {
          const response = await completeJourneyStep(step.id, {
            eventType: 'step_completed',
            stepId: step.id,
            metadata: {
              fromRouteStep: selectedStepId
            }
          });

          const nextState = response?.journeyState;
          if (nextState) {
            setJourneyState(nextState);
            const nextActive = getActiveStep(nextState);
            if (nextActive) {
              navigate(`/journey-flow/${nextActive}`);
            }
          }

          if (response?.result) {
            postJourneyTelemetryEvent({
              eventType: 'journey_synced',
              stepId: step.id,
              level: response.result.newLevel,
              streak: response.result.streak,
              xpGained: response.result.xpGained,
              metadata: {
                fromStep: selectedStepId,
                toStep: getActiveStep(nextState),
                unlocked: response.result.unlocked,
                leveledUp: response.result.leveledUp
              },
              createdAt: new Date().toISOString()
            }).catch(() => null);
          }

          return response;
        }}
      />

      <div className="rounded-2xl border border-primary-100 bg-white/80 p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Recompensa da etapa atual</p>
        <p className="mt-1 text-sm text-muted-700">
          {selectedReward
            ? `${selectedReward.title} (${selectedReward.claimed ? 'claimed' : selectedReward.unlockedAt ? 'unlocked' : 'locked'})`
            : 'Nenhuma recompensa mapeada para esta etapa ainda.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedReward || selectedReward.claimed || !selectedReward.unlockedAt || isClaimingReward}
            onClick={handleClaimReward}
          >
            {isClaimingReward ? 'Resgatando...' : 'Resgatar recompensa'}
          </button>
          {selectedReward?.claimed ? (
            <span className="text-xs font-semibold text-emerald-700">Recompensa ja resgatada</span>
          ) : null}
          {claimError ? <span className="text-xs font-semibold text-red-600">{claimError}</span> : null}
        </div>
      </div>
    </div>
  );
}
