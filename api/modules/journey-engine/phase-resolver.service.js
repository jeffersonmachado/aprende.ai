export const ENGINE_PHASE_SEQUENCE = [
  'briefing',
  'mission',
  'consequence',
  'plot-twist',
  'reflection',
  'phase-result',
  'progression'
];

const PHASE_LABELS = {
  briefing: 'Briefing',
  mission: 'Missao',
  consequence: 'Consequencia',
  'plot-twist': 'Plot Twist',
  reflection: 'Reflexao',
  'phase-result': 'Resultado',
  progression: 'Proximo Passo'
};

export function getPhaseDefinition(phaseId) {
  const id = ENGINE_PHASE_SEQUENCE.includes(String(phaseId || '').trim())
    ? String(phaseId).trim()
    : ENGINE_PHASE_SEQUENCE[0];

  return {
    id,
    index: ENGINE_PHASE_SEQUENCE.indexOf(id),
    label: PHASE_LABELS[id] || id
  };
}

export function resolveNextPhaseId(phaseId) {
  const current = getPhaseDefinition(phaseId);
  return ENGINE_PHASE_SEQUENCE[current.index + 1] || null;
}

export function resolvePhaseTimeline(activePhaseId, completedPhaseIds = []) {
  const completed = new Set(Array.isArray(completedPhaseIds) ? completedPhaseIds : []);
  const active = getPhaseDefinition(activePhaseId).id;

  return ENGINE_PHASE_SEQUENCE.map((phaseId, index) => ({
    id: phaseId,
    label: PHASE_LABELS[phaseId] || phaseId,
    index,
    status: completed.has(phaseId) ? 'completed' : phaseId === active ? 'active' : 'pending',
    unlocked: completed.has(phaseId) || phaseId === active || index === 0
  }));
}