import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../lib/cn.js';
import { getMentorMessage } from '../../lib/ai/mentorEngine.js';
import JourneyHeader from './JourneyHeader.jsx';
import JourneyMapCanvas from './JourneyMapCanvas.jsx';
import JourneyMentorPanel from './JourneyMentorPanel.jsx';
import JourneyRewardPanel from './JourneyRewardPanel.jsx';
import JourneyProgressBar from './JourneyProgressBar.jsx';
import JourneyFloatingXp from './JourneyFloatingXp.jsx';
import { normalizeJourneyUiState } from './journeyEngine.utils.js';

export default function JourneyEngine({
  className,
  initialState,
  journeyState,
  mode = 'map',
  selectedStepId,
  onSelectedStepChange,
  onStateChange,
  onStepComplete,
  onStepSelect,
  onTelemetryEvent
}) {
  const controlled = Boolean(journeyState);
  const [internalState, setInternalState] = useState(() => normalizeJourneyUiState(initialState));
  const [localSelectedStepId, setLocalSelectedStepId] = useState(() => {
    const baseline = normalizeJourneyUiState(initialState);
    return baseline.steps.find((step) => step.status === 'active')?.id || baseline.steps[0]?.id;
  });
  const [mentorMessage, setMentorMessage] = useState('Prepare-se para uma jornada de progressao cognitiva guiada por IA.');
  const [isCompleting, setIsCompleting] = useState(false);
  const [fx, setFx] = useState({ xp: 0, unlocked: [] });

  const state = useMemo(() => normalizeJourneyUiState(controlled ? journeyState : internalState), [controlled, internalState, journeyState]);

  const activeId = selectedStepId || localSelectedStepId || state.steps.find((step) => step.status === 'active')?.id;
  const selectedStep = state.steps.find((step) => step.id === activeId) || state.steps[0];
  const selectedReward = useMemo(() => {
    if (!selectedStep) return null;
    const stepReward = state.rewards.find((item) => String(item.stepId) === String(selectedStep.id));
    return stepReward || state.rewards.find((item) => !item.claimed) || null;
  }, [selectedStep, state.rewards]);

  useEffect(() => {
    if (!selectedStep) return;
    setMentorMessage(getMentorMessage(selectedStep, state, 'step_active'));
  }, [selectedStep?.id, state.level, state.progress]);

  function pushState(next) {
    if (!controlled) {
      setInternalState(normalizeJourneyUiState(next));
    }
    onStateChange?.(next);
  }

  function selectStep(step) {
    if (!step || step.status === 'locked') return;

    setLocalSelectedStepId(step.id);
    onSelectedStepChange?.(step.id);
    onStepSelect?.(step);
    onTelemetryEvent?.({
      eventType: 'step_selected',
      stepId: step.id,
      level: state.level,
      streak: state.streak,
      metadata: {
        status: step.status,
        xp: step.xp
      },
      createdAt: new Date().toISOString()
    });
    setMentorMessage(getMentorMessage(step, state, 'step_active'));
  }

  async function handleCompleteStep() {
    if (!selectedStep || selectedStep.status === 'locked' || selectedStep.status === 'completed' || isCompleting) {
      return;
    }

    setIsCompleting(true);
    try {
      const response = await onStepComplete?.(selectedStep);
      const nextState = response?.journeyState || response?.nextState || response?.result?.nextState;
      const result = response?.result || response || {};

      if (nextState) {
        pushState(nextState);
        const nextActive = nextState.steps?.find((step) => step.status === 'active') || nextState.steps?.find((step) => step.status === 'available');
        if (nextActive?.id) {
          setLocalSelectedStepId(nextActive.id);
          onSelectedStepChange?.(nextActive.id);
        }
      }

      setFx({
        xp: Number(result?.xpGained || 0),
        unlocked: Array.isArray(result?.unlocked) ? result.unlocked : []
      });
      setTimeout(() => setFx({ xp: 0, unlocked: [] }), 1100);

      if (result?.leveledUp) {
        setMentorMessage(getMentorMessage(selectedStep, { ...state, level: result.newLevel }, 'level_up'));
      } else {
        setMentorMessage(getMentorMessage(selectedStep, nextState || state, 'step_completed'));
      }

      onTelemetryEvent?.({
        eventType: 'step_completed',
        stepId: selectedStep.id,
        xpGained: Number(result?.xpGained || 0),
        level: Number(result?.newLevel || state.level),
        streak: Number(result?.streak || state.streak),
        metadata: {
          leveledUp: Boolean(result?.leveledUp),
          unlocked: Array.isArray(result?.unlocked) ? result.unlocked : []
        },
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsCompleting(false);
    }
  }

  const compact = mode === 'compact';
  const mobile = mode === 'mobile';

  return (
    <section
      className={cn(
        'rounded-3xl border border-primary-100/80 bg-gradient-to-br from-primary-50/80 via-orange-50/50 to-rose-100/50 p-4 shadow-2xl shadow-primary-500/10 backdrop-blur-sm',
        compact && 'rounded-2xl p-3',
        mobile && 'p-3',
        className
      )}
    >
      <JourneyHeader compact={compact} level={state.level} xpTotal={state.xpTotal} streak={state.streak} />
      <JourneyProgressBar progress={state.progress} />

      <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-[1.2fr_0.8fr]')}>
        <JourneyMapCanvas
          steps={state.steps}
          selectedStepId={selectedStep?.id}
          onSelectStep={selectStep}
          compact={compact}
          mobile={mobile}
          progress={state.progress}
        />

        <div className="space-y-4">
          <JourneyMentorPanel
            selectedStep={selectedStep}
            mentorMessage={mentorMessage}
            onCompleteStep={handleCompleteStep}
            isCompleting={isCompleting}
          />
          <JourneyRewardPanel selectedReward={selectedReward} unlocked={fx.unlocked} />
        </div>
      </div>

      <JourneyFloatingXp xp={fx.xp} />
    </section>
  );
}
