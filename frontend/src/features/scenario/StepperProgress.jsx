import JourneyEngine from '../../components/journey/JourneyEngine.jsx';

function buildStateFromLegacyProps(steps, currentStep, completedSteps) {
  const completedSet = new Set(completedSteps || []);
  const currentIndex = Math.max(0, (steps || []).findIndex((step) => String(step.id) === String(currentStep)));

  const nextSteps = (steps || []).map((step, index) => {
    const isCompleted = completedSet.has(String(step.id));
    const isActive = String(step.id) === String(currentStep);
    const hasPriorLocked = (steps || []).slice(0, index).some((item) => !completedSet.has(String(item.id)) && String(item.id) !== String(currentStep));

    return {
      id: String(step.id),
      title: step.title,
      description: step.description || 'Etapa da jornada',
      status: isCompleted ? 'completed' : isActive ? 'active' : hasPriorLocked && index > currentIndex ? 'locked' : 'available',
      xp: Number(step.xp || 35),
      unlocked: isCompleted || isActive || !hasPriorLocked,
      reward: step.reward || 'XP extra desbloqueado',
      icon: step.icon || 'star',
      position: step.position,
    };
  });

  return {
    steps: nextSteps,
    progress: nextSteps.length ? Math.round((nextSteps.filter((step) => step.status === 'completed').length / nextSteps.length) * 100) : 0,
    xpTotal: nextSteps.filter((step) => step.status === 'completed').reduce((total, step) => total + Number(step.xp || 0), 0),
    level: 1,
    streak: 1,
  };
}

export default function StepperProgress({
  steps,
  currentStep,
  completedSteps,
  className = '',
  onSelectStep
}) {
  const journeyState = buildStateFromLegacyProps(steps, currentStep, completedSteps);

  return (
    <JourneyEngine
      mode="compact"
      journeyState={journeyState}
      selectedStepId={String(currentStep)}
      className={`scenario-stepper ${className}`.trim()}
      onStepSelect={(step) => onSelectStep?.(String(step.id))}
    />
  );
}
