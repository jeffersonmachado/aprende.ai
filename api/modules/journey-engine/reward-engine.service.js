function clamp(value, min = 0, max = 100) {
  const parsed = Number(value);
  const safe = Number.isFinite(parsed) ? parsed : 0;
  return Math.min(max, Math.max(min, safe));
}

export function buildRewardPackage({ worldDelta = {}, mastery = 0, phaseId = 'mission' }) {
  const positiveMomentum = Object.values(worldDelta).reduce((acc, value) => acc + Math.max(0, Number(value || 0)), 0);
  const negativeMomentum = Object.values(worldDelta).reduce((acc, value) => acc + Math.max(0, -Number(value || 0)), 0);
  const xp = clamp(Math.round((positiveMomentum * 0.7) + (mastery * 0.18) - (negativeMomentum * 0.25)), 8, 90);
  const badges = [];

  if (mastery >= 70) badges.push('mastery_pulse');
  if (positiveMomentum >= 20) badges.push('world_stabilizer');
  if (phaseId === 'progression') badges.push('phase_clear');

  return {
    xpAwarded: xp,
    badges,
    badgeSummary: badges.length ? badges.join(' · ') : 'Sem nova badge nesta rodada.'
  };
}