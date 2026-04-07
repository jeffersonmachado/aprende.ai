function clamp(value, min = -100, max = 100) {
  const parsed = Number(value);
  const safe = Number.isFinite(parsed) ? parsed : 0;
  return Math.min(max, Math.max(min, safe));
}

function normalizeText(input) {
  return String(input || '').trim().toLowerCase();
}

export function buildConsequenceFromChoice({ choice, mission, worldState }) {
  const text = normalizeText(`${choice?.label || ''} ${choice?.consequence || ''} ${choice?.impact || ''}`);
  const risk = normalizeText(mission?.riskLevel || 'medio');
  const baseScale = risk === 'alto' ? 9 : risk === 'baixo' ? 5 : 7;

  const delta = {
    tension_level: /agressiv|pressao|integral|sem validar/.test(text) ? baseScale : -2,
    stakeholder_trust: /transparen|checkpoint|alinh|evidenc|criter/.test(text) ? 8 : /defens|bloquear|ignora/.test(text) ? -9 : 2,
    budget: /integral|paralelo|escalar/.test(text) ? -8 : /fases|priori|wip|corte/.test(text) ? 4 : -2,
    morale: /alinh|coletiv|time|checkpoint/.test(text) ? 6 : /defens|pressao|agressiv/.test(text) ? -7 : 1,
    time_pressure: /adiar|aguardar|conserv/.test(text) ? 6 : /wip|fases|checkpoint|agil|rapido/.test(text) ? -7 : -2,
    learning_confidence: /criter|evidenc|trade-off|explicar/.test(text) ? 7 : 1,
    team_alignment: /alinh|negoci|checkpoint|fases/.test(text) ? 8 : /bloquear|rompimento/.test(text) ? -8 : 0,
    market_perception: /transparen|solucao|plano/.test(text) ? 6 : /falha|defens|rompimento/.test(text) ? -7 : 0,
    execution_risk: /sem validar|paralelo|integral|agressiv/.test(text) ? 9 : /criter|fases|checkpoint|matriz|dados/.test(text) ? -8 : -2
  };

  const narrative = [
    `A escolha "${choice?.label || 'sem rotulo'}" reposicionou a fase atual.`,
    delta.stakeholder_trust >= 0 ? 'A confianca dos stakeholders ganhou tracao.' : 'A confianca dos stakeholders ficou sob pressao.',
    delta.execution_risk <= 0 ? 'O risco de execucao ficou mais controlado.' : 'O risco de execucao aumentou e exige mitigacao.',
    `Tensao atual do mundo: ${Math.max(0, Math.min(100, Number(worldState?.tension_level || 0) + delta.tension_level))}.`
  ].join(' ');

  return {
    delta: Object.fromEntries(Object.entries(delta).map(([key, value]) => [key, clamp(value)])),
    narrative,
    outcomeTone: delta.execution_risk > 0 || delta.stakeholder_trust < 0 ? 'warning' : 'positive'
  };
}