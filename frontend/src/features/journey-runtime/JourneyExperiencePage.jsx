import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import JourneyEngine from '../../components/journey/JourneyEngine.jsx';
import { completeJourneyStep } from '../../services/journeyFlowApi.js';
import { useJourneyRuntime } from '../../context/JourneyRuntimeContext.jsx';
import { startSimulation, submitDecision } from '../../services/simulationApi.js';

const TWIST_MISSION_LABELS = {
  context_reframed: 'reposicionamento completo do contexto',
  stakeholder_added: 'entrada de um novo decisor com restricoes adicionais',
  urgency_boost: 'aumento de urgencia competitiva',
  deadline_cut: 'compressao do prazo de execucao',
  alignment_required: 'alinhamento entre liderancas com conflito ativo',
  hypothesis_invalidated: 'invalidacao das hipoteses usadas ate aqui'
};

function getRuntimeItemLabel(item, fallback = 'Item sem rotulo') {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (!item || typeof item !== 'object') return fallback;

  return item.title
    || item.name
    || item.label
    || item.description
    || item.code
    || item.competencyName
    || item.achievement?.title
    || item.achievement?.name
    || fallback;
}

function getRuntimeItemKey(item, index, prefix) {
  if (typeof item === 'string' || typeof item === 'number') return `${prefix}-${item}-${index}`;
  if (!item || typeof item !== 'object') return `${prefix}-${index}`;

  return item.id
    || item.code
    || item.slug
    || item.achievementId
    || item.achievement?.id
    || `${prefix}-${getRuntimeItemLabel(item, 'item').replace(/\s+/g, '-').toLowerCase()}-${index}`;
}

function getCompetencyKey(item, index, prefix = 'competency') {
  if (!item || typeof item !== 'object') return `${prefix}-${index}`;
  return item.id || item.competencyId || item.name || `${prefix}-${index}`;
}

function getChoicePosture(choice) {
  const text = `${choice?.label || ''} ${choice?.consequence || ''} ${choice?.impact || ''}`.toLowerCase();

  if (/matriz|dados|analis|criter|evidenc|valid/.test(text)) return 'Leitura analitica';
  if (/negoci|alinh|checkpoint|fases|transparen/.test(text)) return 'Alinhamento estruturado';
  if (/prometer|agressiv|paralelo|integral|escalar/.test(text)) return 'Pressao de execucao';
  if (/adiar|aguardar|conserv/.test(text)) return 'Preservacao de opcionalidade';
  return 'Resposta tatico-estrategica';
}

function getChoiceRisk(choice, missionRisk = 'medio') {
  const text = `${choice?.label || ''} ${choice?.consequence || ''}`.toLowerCase();

  if (/sem validar|sem plano|paralelo|integral|ignora|ruido politico|rompimento/.test(text)) return 'alto';
  if (/adiar|aguardar|opcionalidade|medio prazo/.test(text)) return 'medio';
  return missionRisk || 'medio';
}

function getTwistCauseLabel(twist) {
  if (!twist) return 'Sem sinal de reconfiguracao narrativa nesta fase.';

  const missionShift = TWIST_MISSION_LABELS[twist?.impact?.mission] || 'mudanca operacional na missao';
  return `Gatilho identificado: ${twist.kind || 'runtime'} conduziu ${missionShift}.`;
}

function getTwistStatusLabel(twist) {
  if (!twist) return 'Sem evento ativo';
  if (twist.status === 'resolved') return 'Resolvido';
  return 'Ativo';
}

function getMissionPressureCopy(riskLevel, activeStepId) {
  const risk = String(riskLevel || 'medio').toLowerCase();
  if (risk === 'alto') return `Janela critica na etapa ${activeStepId || 'atual'}: margem curta para erro e alto custo de retrabalho.`;
  if (risk === 'baixo') return `Momento de calibracao na etapa ${activeStepId || 'atual'}: ainda ha espaco para explorar alternativas.`;
  return `Missao em tensao moderada na etapa ${activeStepId || 'atual'}: a decisao pede criterio e alinhamento.`;
}

function MissionChoice({ choice, disabled, onSelect, mission, active, index }) {
  const impactedCompetencies = (mission?.competenciesImpacted || []).slice(0, 2);
  const impactSummary = choice?.impact || choice?.consequence;
  const posture = getChoicePosture(choice);
  const risk = getChoiceRisk(choice, mission?.riskLevel);
  const impactedCompetencyLabels = impactedCompetencies.map((item) => getRuntimeItemLabel(item, 'decisao contextual'));

  return (
    <motion.button
      type="button"
      className={`campaign-choice-card ${active ? 'active' : ''}`}
      disabled={disabled}
      onClick={() => onSelect(choice)}
      whileHover={{ y: -2, scale: 1.008 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="row-between gap-sm wrap">
        <span className="campaign-choice-kicker">Comando estrategico {index + 1}</span>
        <span className={`campaign-risk-pill risk-${risk}`}>{risk}</span>
      </div>
      <div className="campaign-choice-headline">
        <span className="campaign-choice-index">0{index + 1}</span>
        <strong>{choice.label}</strong>
      </div>
      <p>{impactSummary}</p>
      <div className="campaign-choice-meta-grid">
        <div>
          <span>Postura</span>
          <strong>{posture}</strong>
        </div>
        <div>
          <span>Impacto provavel</span>
          <strong>{impactSummary}</strong>
        </div>
        <div>
          <span>Competencia em jogo</span>
          <strong>{impactedCompetencyLabels.length ? impactedCompetencyLabels.join(' · ') : 'decisao contextual'}</strong>
        </div>
      </div>
      <div className="campaign-choice-command-line">Executa uma leitura de {posture.toLowerCase()} com impacto imediato na fase.</div>
      {active ? <div className="campaign-choice-state">Escolha em foco nesta fase</div> : null}
    </motion.button>
  );
}

function CompetencyRow({ item }) {
  const score = Math.max(0, Math.min(100, Number(item.score || 0)));
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#60a5fa' : '#f472b6';
  return (
    <div className="campaign-competency-row">
      <div className="row-between">
        <strong>{item.name}</strong>
        <span style={{ color }}>{score.toFixed(0)}</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
      </div>
      <p>
        Evidências diretas: {item?.evidence?.direct || 0} · inferidas: {item?.evidence?.inferred || 0}
      </p>
    </div>
  );
}

function CompetencyRadar({ items = [] }) {
  const max = 100;
  const radius = 78;
  const center = 100;
  const NUM_AXES = 6;
  const limited = items.slice(0, NUM_AXES);
  const total = NUM_AXES;

  function hexagonPoints(r) {
    return Array.from({ length: NUM_AXES }, (_, i) => {
      const angle = ((Math.PI * 2) / NUM_AXES) * i - Math.PI / 2;
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
    }).join(' ');
  }

  const points = limited.map((item, index) => {
    const angle = ((Math.PI * 2) / total) * index - Math.PI / 2;
    const value = Math.max(0, Math.min(max, Number(item.score || 0)));
    const r = (value / max) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      axisX: center + Math.cos(angle) * radius,
      axisY: center + Math.sin(angle) * radius,
      labelX: center + Math.cos(angle) * (radius + 18),
      labelY: center + Math.sin(angle) * (radius + 18) + 4,
      label: item.name
    };
  });

  const polygon = points.map((item) => `${item.x},${item.y}`).join(' ');

  return (
    <div className="campaign-radar-shell">
      <svg viewBox="0 0 200 200" className="campaign-radar">
        <defs>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <polygon key={ratio} points={hexagonPoints(radius * ratio)} fill="none" stroke="rgba(244,114,182,0.2)" strokeWidth="1" />
        ))}
        {points.map((point) => (
          <line key={`axis-${point.label}`} x1="100" y1="100" x2={point.axisX} y2={point.axisY} stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
        ))}
        <polygon points={polygon} fill="rgba(236,72,153,0.22)" stroke="rgba(251,113,133,0.95)" strokeWidth="2.5" filter="url(#radarGlow)" />
        {points.map((point) => (
          <circle key={`dot-${point.label}`} cx={point.x} cy={point.y} r="4" fill="rgba(251,146,60,1)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        ))}
      </svg>
      <div className="campaign-radar-labels">
        {limited.map((item, index) => (
          <span key={getCompetencyKey(item, index, 'radar-label')}>{item.name} · {Number(item.score || 0).toFixed(0)}</span>
        ))}
      </div>
    </div>
  );
}

const missionGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const missionCardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

export default function JourneyExperiencePage({ campaignMode = false, onAdvance = null, advanceLabel = 'Seguir para a proxima fase', campaignMission = null, campaignPhase = null }) {
  const { runtime, loading, error, refreshRuntime, firePlotTwist, resolveActivePlotTwist } = useJourneyRuntime();
  const [twistFlash, setTwistFlash] = useState(null);
  const [isTriggeringTwist, setIsTriggeringTwist] = useState(false);
  const [isResolvingTwist, setIsResolvingTwist] = useState(false);
  const [isApplyingChoice, setIsApplyingChoice] = useState(false);
  const [choiceFeedback, setChoiceFeedback] = useState('');
  const [choiceError, setChoiceError] = useState('');
  const [lastChoiceLabel, setLastChoiceLabel] = useState('');
  const [isMentorCollapsed, setIsMentorCollapsed] = useState(false);

  const mission = campaignMission || runtime?.mission;
  const mentor = runtime?.mentor;
  const competencyMatrix = runtime?.competencies;
  const phaseResult = runtime?.phaseResult;
  const latestTwist = runtime?.plotTwist?.latest;

  const strengths = useMemo(() => competencyMatrix?.strengths || [], [competencyMatrix]);
  const focus = useMemo(() => competencyMatrix?.focus || [], [competencyMatrix]);
  const missionCompetencies = useMemo(() => mission?.competenciesImpacted || [], [mission]);
  const missionStakeholders = useMemo(() => mission?.stakeholders || [], [mission]);
  const completionCriteria = useMemo(() => mission?.completionCriteria || [], [mission]);
  const strongestCompetency = useMemo(() => phaseResult?.strengths?.[0] || strengths[0] || null, [phaseResult, strengths]);
  const weakestCompetency = useMemo(() => phaseResult?.recurringGaps?.[0] || focus[0] || null, [phaseResult, focus]);
  const badgesUnlocked = useMemo(() => phaseResult?.rewards?.unlockedBadges || [], [phaseResult]);
  const nextBadges = useMemo(() => phaseResult?.rewards?.nextBadges || [], [phaseResult]);
  const missionCompetencyLabels = useMemo(() => missionCompetencies.map((item) => getRuntimeItemLabel(item, 'Competencia')),
    [missionCompetencies]);
  const missionStakeholderLabels = useMemo(() => missionStakeholders.map((item) => getRuntimeItemLabel(item, 'Stakeholder')),
    [missionStakeholders]);
  const completionCriteriaLabels = useMemo(() => completionCriteria.map((item) => getRuntimeItemLabel(item, 'Criterio')),
    [completionCriteria]);
  const badgeUnlockedLabels = useMemo(() => badgesUnlocked.map((item) => getRuntimeItemLabel(item, 'Badge liberada')),
    [badgesUnlocked]);
  const nextBadgeLabels = useMemo(() => nextBadges.map((item) => getRuntimeItemLabel(item, 'Proxima badge')),
    [nextBadges]);
  const competencyMomentum = runtime?.effectiveness?.competencies;
  const missionCoverage = runtime?.effectiveness?.mission;
  const canAdvanceCampaign = campaignMode && Boolean(choiceFeedback || lastChoiceLabel || phaseResult?.phaseStatus === 'completed');
  const currentTwistNarrative = twistFlash?.narrative || latestTwist?.narrative || runtime?.plotTwist?.nextCandidate?.narrative || 'Sem reviravolta ativa no quadro atual.';

  async function handleTriggerTwist() {
    setIsTriggeringTwist(true);
    try {
      const response = await firePlotTwist();
      setTwistFlash(response?.twist || null);
      setTimeout(() => setTwistFlash(null), 7000);
    } finally {
      setIsTriggeringTwist(false);
    }
  }

  async function handleResolveTwist() {
    if (!latestTwist || latestTwist?.status === 'resolved' || isResolvingTwist) return;

    setIsResolvingTwist(true);
    try {
      await resolveActivePlotTwist({
        twistLogId: latestTwist.id,
        resolutionNotes: 'Resolvido no painel da campanha pelo aprendiz.'
      });
    } finally {
      setIsResolvingTwist(false);
    }
  }

  async function handleMissionChoice(choice) {
    if (!mission || isApplyingChoice) return;

    setChoiceError('');
    setChoiceFeedback('');
    setLastChoiceLabel(choice.label);

    if (mission?.sourceType !== 'scenario' || !mission?.scenarioId) {
      setChoiceFeedback('Missao sem cenario vinculado. A decisao foi registrada como exploracao narrativa.');
      return;
    }

    setIsApplyingChoice(true);
    try {
      const run = await startSimulation({ scenarioId: mission.scenarioId });
      const decision = await submitDecision(run.id, { selectedOptionId: choice.id });
      setChoiceFeedback(decision?.feedback || 'Decisao aplicada com sucesso na simulacao.');
      await refreshRuntime();
    } catch (err) {
      setChoiceError(err.message || 'Nao foi possivel aplicar a decisao agora.');
    } finally {
      setIsApplyingChoice(false);
    }
  }

  return (
    <StageWrapper
      stageKey="journey-runtime"
      title={campaignPhase?.title || 'Campanha de aprendizagem'}
      subtitle={campaignPhase?.description || 'Mapa vivo da jornada, missao atual, mentor ativo, competencias e fechamento de fase'}
      completed={Number(runtime?.journey?.progressPercent || 0)}
      total={100}
      variant="mentor"
      loading={loading}
      stageSemantic="challenge"
    >
      {error ? <div className="error-box">{error}</div> : null}

      <AnimatePresence>
        {twistFlash ? (
          <motion.div
            key="twist-flash"
            className="campaign-twist-banner"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="campaign-twist-inner">
              <svg className="campaign-twist-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="rgba(248,113,113,0.22)" />
                <path d="M12 9v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
              <p className="campaign-twist-label">ALERTA!</p>
              <h3>{twistFlash.title}</h3>
              <p>{twistFlash.narrative}</p>
              <p><strong>Ação sugerida:</strong> {twistFlash.suggestedAction}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ExperienceCard variant="mentor" className="campaign-hero" title="HUD da jornada">
        <div className="campaign-hud-primary">
          <div className="campaign-hud-copy">
            <p className="campaign-kicker">Campanha viva</p>
            <h3>{campaignPhase?.content?.headline || mission?.title || 'Missao em andamento'}</h3>
            <p>{mission?.objective || mission?.context || 'Contexto em carregamento para a proxima decisao.'}</p>
          </div>
          <div className="campaign-hud-grid">
            <Badge variant="level">Nível {runtime?.journey?.level || 1}</Badge>
            <Badge variant="xp">XP {runtime?.journey?.xpTotal || 0}</Badge>
            <Badge variant="streak">Streak {runtime?.journey?.streak || 0}d</Badge>
            <Badge variant="achieved">Missões {runtime?.journey?.map?.missionNodes || 0}</Badge>
          </div>
        </div>
        <div className="campaign-hero-summary">
          <div className="campaign-hero-panel campaign-hero-panel-featured">
            <span>Status da fase</span>
            <strong>{phaseResult?.phaseStatus === 'completed' ? 'Climax concluido' : phaseResult?.phaseStatus === 'in_progress' ? 'Fase em escalada' : 'Aquecimento estrategico'}</strong>
            <p>{getMissionPressureCopy(mission?.riskLevel, runtime?.journey?.activeStepId)}</p>
          </div>
          <div className="campaign-hero-panel">
            <span>Competencia central</span>
            <strong>{missionCompetencyLabels[0] || strongestCompetency?.name || 'tomada de decisao'}</strong>
            <p>{missionCompetencyLabels.length ? `Cobertura da missao: ${missionCompetencyLabels.join(' · ')}` : 'A missao ainda nao explicita cobertura de competencias.'}</p>
          </div>
          <div className="campaign-hero-panel">
            <span>Estado do twist</span>
            <strong>{getTwistStatusLabel(latestTwist)}</strong>
            <p>{getTwistCauseLabel(latestTwist)}</p>
          </div>
          <div className="campaign-hero-panel">
            <span>Radar narrativo</span>
            <strong>{latestTwist?.title || runtime?.plotTwist?.nextCandidate?.title || 'Sem ruptura ativa'}</strong>
            <p>{currentTwistNarrative}</p>
          </div>
        </div>
        <div className="campaign-actions">
          <Button type="button" onClick={refreshRuntime} variant="secondary">Atualizar campanha</Button>
          <Button type="button" onClick={handleTriggerTwist} disabled={isTriggeringTwist}>
            {isTriggeringTwist ? 'Acionando...' : 'Acionar plot twist'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleResolveTwist}
            disabled={isResolvingTwist || latestTwist?.status === 'resolved' || !latestTwist}
          >
            {isResolvingTwist ? 'Resolvendo...' : 'Resolver twist ativo'}
          </Button>
        </div>
        {latestTwist ? (
          <div className="campaign-twist-status mt-2">
            <p className="campaign-kicker">Twist atual: {latestTwist.title} · status {latestTwist.status || 'triggered'}</p>
            <p>{getTwistCauseLabel(latestTwist)}</p>
          </div>
        ) : null}
      </ExperienceCard>

      {runtime?.journey?.state ? (
        <JourneyEngine
          journeyState={runtime.journey.state}
          selectedStepId={runtime.journey.activeStepId}
          onStepComplete={async (step) => {
            const response = await completeJourneyStep(step.id, {
              eventType: 'step_completed',
              stepId: step.id
            });
            await refreshRuntime();
            return response;
          }}
        />
      ) : null}

      <motion.div
        className="campaign-mission-grid"
        variants={missionGridVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={missionCardVariant}>
          <ExperienceCard title="1. Sala de situacao" variant="decision" className="campaign-context-card">
            <p className="campaign-kicker">Missão ativa</p>
            <h3>{campaignPhase?.content?.headline || mission?.title || 'Missão em sincronização'}</h3>
            <p>{mission?.context || 'Carregando contexto da missão...'}</p>
            <div className="campaign-scene-banner">
              <div>
                <span>Situacao</span>
                <strong>{mission?.objective || 'Definir objetivo de alto impacto'}</strong>
              </div>
              <div>
                <span>Tensao</span>
                <strong>{mission?.riskLevel || 'medio'}</strong>
              </div>
            </div>
            <div className="campaign-context-grid">
              <div className="campaign-context-panel">
                <span>Objetivo da fase</span>
                <strong>{mission?.objective || 'Definir objetivo'}</strong>
              </div>
              <div className="campaign-context-panel">
                <span>Stakeholders afetados</span>
                <strong>{missionStakeholderLabels.length ? missionStakeholderLabels.join(' · ') : 'Sem stakeholders mapeados'}</strong>
              </div>
              <div className="campaign-context-panel">
                <span>Criterio de conclusao</span>
                <strong>{completionCriteriaLabels[0] || 'Concluir leitura e assumir proximo movimento'}</strong>
              </div>
            </div>
            <div className="inline-pills mt-2">
              <Badge variant="warning">Pressao {mission?.riskLevel || 'medio'}</Badge>
              <Badge variant="primary">Etapa {runtime?.journey?.activeStepId || 'n/d'}</Badge>
              <Badge variant="achieved">Competencias {missionCoverage?.impactedCount || missionCompetencies.length || 0}</Badge>
            </div>
            <div className="campaign-tag-cloud">
              {missionCompetencies.map((item, index) => (
                <span key={getRuntimeItemKey(item, index, 'mission-competency')}>
                  {missionCompetencyLabels[index]}
                </span>
              ))}
            </div>
            <div className="campaign-context-footnote">
              <strong>Leitura de pressao:</strong> {getMissionPressureCopy(mission?.riskLevel, runtime?.journey?.activeStepId)}
            </div>
          </ExperienceCard>
        </motion.div>

        <motion.div variants={missionCardVariant}>
          <ExperienceCard title="2. Decisao estrategica" variant="active" className="campaign-mission-stage campaign-decision-card">
            <p className="campaign-kicker">Escolha com trade-off explicito</p>
            <div className="campaign-choice-list">
              {(mission?.choices || []).map((choice, index) => (
                <MissionChoice
                  key={choice.id}
                  choice={choice}
                  disabled={isApplyingChoice}
                  onSelect={handleMissionChoice}
                  mission={mission}
                  active={lastChoiceLabel === choice.label}
                  index={index}
                />
              ))}
            </div>
            {choiceFeedback ? (
              <div className="campaign-feedback-callout mt-2">
                <span>Leitura de impacto</span>
                <strong>Decisao registrada: {lastChoiceLabel}</strong>
                <p>{choiceFeedback}</p>
                <p>Competencia priorizada: {missionCompetencyLabels[0] || 'tomada de decisao'} · Proximo risco observavel: {mission?.riskLevel || 'medio'}.</p>
              </div>
            ) : null}
            {choiceError ? <div className="error-box mt-2">{choiceError}</div> : null}
          </ExperienceCard>
        </motion.div>

        <motion.div variants={missionCardVariant}>
          <ExperienceCard title="3. Mentor e reflexao" variant="mentor" className="campaign-mentor-stage">
            <button type="button" className="campaign-mentor-toggle" onClick={() => setIsMentorCollapsed((prev) => !prev)}>
              {isMentorCollapsed ? 'Expandir mentor' : 'Recolher mentor'}
            </button>
            <div className={`campaign-mentor-body ${isMentorCollapsed ? 'collapsed' : ''}`}>
              <div className="campaign-mentor-brief">
                <div>
                  <span>Papel ativo</span>
                  <strong>{mentor?.mentorMode || 'socratico'}</strong>
                </div>
                <div>
                  <span>Competencia focal</span>
                  <strong>{missionCompetencyLabels[0] || strongestCompetency?.name || 'decisao contextual'}</strong>
                </div>
              </div>
              <div className="campaign-mentor-chat">
                <div className="campaign-mentor-avatar">
                  {(mentor?.mentorMode || 'S')[0].toUpperCase()}
                </div>
                <div className="campaign-mentor-bubble">
                  <p><strong>{mentor?.contextualMission || mission?.title || 'Mentor'}</strong></p>
                  <p>{mentor?.prompt || 'Mentor preparando leitura de cenario.'}</p>
                </div>
              </div>
              <p className="campaign-mentor-meta"><strong>Modo:</strong> {mentor?.mentorMode || 'socratico'} · <strong>Papéis:</strong> {(mentor?.mentorRoles || []).join(' · ')}</p>
              {latestTwist?.impact?.mentorMode ? (
                <p className="campaign-mentor-meta"><strong>Ajuste pelo twist:</strong> mentor reposicionado para modo {latestTwist.impact.mentorMode}.</p>
              ) : null}
            </div>
          </ExperienceCard>
        </motion.div>

        <motion.div variants={missionCardVariant}>
          <ExperienceCard title="4. Consequencia e feedback" variant="result" className="campaign-feedback-stage">
            <p className="campaign-kicker">Leitura de impacto</p>
            <div className="campaign-consequence-stack">
              <div>
                <span>Resposta registrada</span>
                <strong>{lastChoiceLabel || 'Aguardando decisao'}</strong>
                <p>{choiceFeedback || 'Ao escolher uma estrategia, a simulacao atualiza progresso, evidencia e competencia no runtime.'}</p>
              </div>
              <div>
                <span>Status do twist</span>
                <strong>{getTwistStatusLabel(latestTwist)}</strong>
                <p>{getTwistCauseLabel(latestTwist)}</p>
              </div>
            </div>
            <div className="campaign-tag-cloud compact">
              {completionCriteria.map((item, index) => (
                <span key={getRuntimeItemKey(item, index, 'completion-criteria')}>
                  {completionCriteriaLabels[index]}
                </span>
              ))}
            </div>
          </ExperienceCard>
        </motion.div>
      </motion.div>

      <motion.div
        className="campaign-dashboard-grid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.06 }}
      >
        <ExperienceCard title="Dashboard de competencias" variant="result" className="campaign-competency-hero">
          <p className="campaign-kicker">Seu progresso</p>
          <div className="campaign-competency-vitals">
            <div>
              <span>Score medio</span>
              <strong>{Number(competencyMomentum?.averageScore || 0).toFixed(0)}</strong>
            </div>
            <div>
              <span>Evidencia direta</span>
              <strong>{Math.round(Number(competencyMomentum?.directEvidenceRatio || 0) * 100)}%</strong>
            </div>
            <div>
              <span>Competencias impactadas</span>
              <strong>{missionCoverage?.impactedCount || missionCompetencies.length || 0}</strong>
            </div>
          </div>
          <CompetencyRadar items={competencyMatrix?.items || []} />
          <div className="campaign-competencies-list">
            {(competencyMatrix?.items || []).slice(0, 6).map((item, index) => (
              <CompetencyRow key={getCompetencyKey(item, index, 'competency-row')} item={item} />
            ))}
          </div>
        </ExperienceCard>

        <ExperienceCard title="Forças e focos" variant="default" className="campaign-strength-card">
          <div className="campaign-strength-column">
            <p className="campaign-kicker">Fortes</p>
            {(strengths || []).map((item, index) => (
              <div key={getCompetencyKey(item, index, 'strength')} className="campaign-strength-item">
                <strong>{item.name}</strong>
                <span>{Number(item.score || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="campaign-strength-column">
            <p className="campaign-kicker mt-3">Em desenvolvimento</p>
            {(focus || []).map((item, index) => (
              <div key={getCompetencyKey(item, index, 'focus')} className="campaign-strength-item danger">
                <strong>{item.name}</strong>
                <span>{Number(item.score || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="campaign-effectiveness-strip">
            <div>
              <span>Score medio</span>
              <strong>{Number(competencyMomentum?.averageScore || 0).toFixed(0)}</strong>
            </div>
            <div>
              <span>Evidencia direta</span>
              <strong>{Math.round(Number(competencyMomentum?.directEvidenceRatio || 0) * 100)}%</strong>
            </div>
          </div>
        </ExperienceCard>
      </motion.div>

      <motion.div
        animate={phaseResult?.phaseStatus === 'completed' ? { scale: [1, 1.022, 1] } : {}}
        transition={{ duration: 0.65, delay: 0.15 }}
      >
      <ExperienceCard title="Resultado de fase" variant="resultado" className="campaign-result-card">
        {phaseResult?.phaseStatus === 'completed' ? (
          <div className="campaign-result-parabens">
            <span>🌟</span>
            <h2>Parabéns!</h2>
            <p>Treinamento Concluído</p>
          </div>
        ) : (
          <h3>Fase em andamento</h3>
        )}
        <p className="campaign-result-summary">
          Voce fecha esta fase com {phaseResult?.performance?.progressPercent || 0}% de progresso, nivel {phaseResult?.performance?.level || 1} e {phaseResult?.performance?.xpTotal || 0} XP acumulado.
        </p>
        <div className="campaign-result-metrics">
          <div>
            <span>Avanço</span>
            <strong>{phaseResult?.performance?.progressPercent || 0}%</strong>
          </div>
          <div>
            <span>Erros comuns</span>
            <strong>{(phaseResult?.recurringGaps || []).length || 0}</strong>
          </div>
          <div>
            <span>Nível atual</span>
            <strong>{phaseResult?.performance?.level || runtime?.journey?.level || 1}</strong>
          </div>
        </div>
        <div className="campaign-result-insights">
          <div>
            <span>Competencia dominante</span>
            <strong>{strongestCompetency?.name || 'Em consolidacao'}</strong>
            <p>{strongestCompetency ? `Score ${Number(strongestCompetency.score || 0).toFixed(0)} com evidencias crescentes.` : 'Continue alimentando evidencias para consolidar forca.'}</p>
          </div>
          <div>
            <span>Gap recorrente</span>
            <strong>{weakestCompetency?.name || 'Sem gap dominante'}</strong>
            <p>{weakestCompetency ? `Prioridade de desenvolvimento para a proxima fase com score ${Number(weakestCompetency.score || 0).toFixed(0)}.` : 'A jornada ainda nao sinalizou uma lacuna dominante.'}</p>
          </div>
          <div>
            <span>Badges liberadas</span>
            <strong>{badgesUnlocked.length}</strong>
            <p>{badgeUnlockedLabels.length ? badgeUnlockedLabels.join(' · ') : 'Sem novas badges nesta etapa.'}</p>
          </div>
        </div>
        {phaseResult?.nextTrackRecommendation ? (
          <div className="campaign-next-step">
            <div className="campaign-next-step-icon">🎯</div>
            <div>
              <p className="campaign-kicker">Próximos Passos</p>
              <strong>{weakestCompetency?.name ? `Reforce ${weakestCompetency.name}` : 'Desenvolva sua Lideranca'}</strong>
              <p>{phaseResult.nextTrackRecommendation}</p>
            </div>
          </div>
        ) : null}
        {nextBadges.length ? (
          <div className="campaign-tag-cloud compact">
            {nextBadges.map((item, index) => (
              <span key={getRuntimeItemKey(item, index, 'next-badge')}>
                {`Proxima badge: ${nextBadgeLabels[index]}`}
              </span>
            ))}
          </div>
        ) : null}
        <div className="campaign-result-awards">
          <div>
            <span>Progresso</span>
            <strong>{phaseResult?.performance?.progressPercent || 0}%</strong>
          </div>
          <div>
            <span>Badges novas</span>
            <strong>{badgesUnlocked.length}</strong>
          </div>
          <div>
            <span>XP acumulado</span>
            <strong>{phaseResult?.performance?.xpTotal || runtime?.journey?.xpTotal || 0}</strong>
          </div>
        </div>
        <div className="campaign-actions">
          {canAdvanceCampaign ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : <Button type="button">Iniciar proxima trilha</Button>}
        </div>
      </ExperienceCard>
      </motion.div>
    </StageWrapper>
  );
}
