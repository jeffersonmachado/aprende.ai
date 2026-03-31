import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CompetencyMeter,
  DiagnosticMiniCard,
  JourneyStageCard,
  JourneySummaryCard,
  MentorCard,
  RewardPill,
  ScenarioOptionCard,
  TimelineStep
} from '../../components/DomainComponents.jsx';
import SkeletonBlock from '../../components/SkeletonBlock.jsx';
import { getJourneyFlowState, saveJourneyFlowState } from '../../services/journeyFlowApi.js';

const goalCards = [
  { id: 'resolver', title: 'Resolver um problema', description: 'Aplicar a jornada para um desafio concreto do seu contexto.' },
  { id: 'aprender', title: 'Aprender algo novo', description: 'Expandir repertorio para agir com mais confianca.' },
  { id: 'habilidade', title: 'Desenvolver habilidade', description: 'Treinar uma competencia critica com pratica guiada.' },
  { id: 'performance', title: 'Melhorar performance', description: 'Aumentar consistencia e qualidade das decisoes.' },
  { id: 'desafio', title: 'Preparar para novo desafio', description: 'Ganhar prontidao para um ciclo de maior responsabilidade.' }
];

const personaCards = [
  { id: 'profissional em desenvolvimento', title: 'Profissional em desenvolvimento', subtitle: 'Evolucao acelerada', description: 'Quer consistencia em decisoes e clareza de prioridades.' },
  { id: 'lider iniciante', title: 'Lider iniciante', subtitle: 'Gestao sob pressao', description: 'Precisa equilibrar entrega, pessoas e risco operacional.' },
  { id: 'estudante', title: 'Estudante', subtitle: 'Base e aplicacao', description: 'Busca transformar teoria em pratica orientada por contexto.' },
  { id: 'empreendedor', title: 'Empreendedor', subtitle: 'Decisao com impacto', description: 'Toma decisoes frequentes em ambientes ambiguos e dinamicos.' }
];

const learningStyleCards = {
  explorador: {
    icon: 'Explorador',
    description: 'Aprende por descoberta e experimentacao.',
    learnsHow: 'Prefere testar caminhos alternativos em ciclos curtos.',
    mentorStyle: 'Socratico'
  },
  pratico: {
    icon: 'Pratico',
    description: 'Aprende aplicando no contexto real.',
    learnsHow: 'Valoriza exemplos objetivos e acao imediata.',
    mentorStyle: 'Direto'
  },
  narrativo: {
    icon: 'Narrativo',
    description: 'Aprende por historias e contexto.',
    learnsHow: 'Retem melhor quando entende causa, conflito e desfecho.',
    mentorStyle: 'Reflexivo'
  },
  analitico: {
    icon: 'Analitico',
    description: 'Aprende por evidencia e estrutura.',
    learnsHow: 'Compara hipoteses e busca criterio de decisao.',
    mentorStyle: 'Analitico'
  }
};

const scenarioDecisionOptions = [
  {
    id: 'a',
    title: 'Executar entregas criticas imediatamente',
    rationale: 'Protege prazo de curto prazo com checkpoints rapidos.',
    risk: 'medio-alto',
    consequence: 'ganho de velocidade com aumento de exposicao operacional',
    impact: { velocidade: 8, assertividade: 4, analiseRisco: -3, consistencia: 1 }
  },
  {
    id: 'b',
    title: 'Consolidar dados e alinhar riscos primeiro',
    rationale: 'Reduz retrabalho e melhora consistencia da decisao.',
    risk: 'medio',
    consequence: 'decisao mais robusta com atraso moderado',
    impact: { velocidade: -2, assertividade: 5, analiseRisco: 8, consistencia: 6 }
  }
];

function estimateCompetencies({ experience, learningStyle }) {
  const base = experience === 'iniciante' ? 30 : experience === 'avancado' ? 65 : 45;
  const styleBonus = learningStyle === 'analitico' ? 6 : learningStyle === 'pratico' ? 4 : 3;

  return {
    velocidade: Math.min(100, base + 5),
    assertividade: Math.min(100, base + styleBonus),
    analiseRisco: Math.min(100, base + (learningStyle === 'analitico' ? 10 : 2)),
    consistencia: Math.min(100, base + 4)
  };
}

export default function JourneyFlowPage() {
  const navigate = useNavigate();
  const { step: stepParam } = useParams();
  const currentStep = Math.max(1, Math.min(15, Number(stepParam || 1)));
  const hasLoadedRef = useRef(false);

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAltFeedback, setShowAltFeedback] = useState(false);
  const [form, setForm] = useState({
    contextType: 'Individual',
    who: personaCards[0].id,
    area: 'Produto',
    experience: 'intermediario',
    goal: goalCards[2].title,
    learningStyle: 'pratico'
  });

  const competencies = useMemo(() => estimateCompetencies(form), [form]);

  const journeySummary = useMemo(() => {
    return {
      perfil: `${form.who} · ${form.area} · ${form.experience}`,
      objetivo: form.goal,
      estilo: form.learningStyle,
      mentorStyle: learningStyleCards[form.learningStyle]?.mentorStyle,
      competencias: competencies
    };
  }, [form, competencies]);

  const decisionResult = useMemo(() => {
    if (!decision) return null;
    const picked = scenarioDecisionOptions.find((item) => item.id === decision);
    if (!picked) return null;

    return {
      ...picked,
      recommendation: picked.id === 'a'
        ? 'Mantenha checkpoints de risco a cada bloco de entrega para evitar efeito cascata.'
        : 'Defina janela maxima para analise e execute com criterio explicito de priorizacao.'
    };
  }, [decision]);

  function persistState(nextStep = currentStep) {
    return saveJourneyFlowState({ step: nextStep, decision, form }).catch(() => null);
  }

  function goToStep(nextStep) {
    const safeStep = Math.max(1, Math.min(15, nextStep));
    persistState(safeStep);
    navigate(`/journey-flow/${safeStep}`);
  }

  function next() {
    goToStep(currentStep + 1);
  }

  function prev() {
    goToStep(currentStep - 1);
  }

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    getJourneyFlowState()
      .then((data) => {
        if (data?.form) setForm(data.form);
        if (data?.decision) setDecision(data.decision);
        if (!stepParam && data?.step) {
          navigate(`/journey-flow/${Math.max(1, Math.min(15, Number(data.step || 1)))}`, { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, stepParam]);

  const feedbackByStyle = {
    socratico: 'Quais sinais voce usou para validar a decisao e o que mudaria com mais contexto?',
    direto: 'Mantenha um criterio objetivo de risco antes da proxima rodada para ganhar consistencia.',
    reflexivo: 'Sua decisao mostra maturidade para equilibrar urgencia e robustez em contexto de pressao.',
    analitico: 'Causalidade principal: pressao de prazo elevou velocidade e reduziu profundidade de analise.'
  };

  const selectedFeedbackStyle = (journeySummary.mentorStyle || 'Direto').toLowerCase();

  if (loading) {
    return (
      <div className="page-stack">
        <div className="row-between wrap gap-sm">
          <h2>Minha Jornada</h2>
          <strong>Preparando fluxo...</strong>
        </div>
        <div className="grid-two">
          <SkeletonBlock className="skeleton-card" />
          <SkeletonBlock className="skeleton-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="row-between wrap gap-sm">
        <h2>Minha Jornada</h2>
        <strong>Tela {currentStep} de 15</strong>
      </div>

      {currentStep === 1 ? (
        <section className="journey-landing">
          <div>
            <h3>Aprendizagem por decisoes em cenarios reais</h3>
            <p>
              Simulacoes adaptativas, mentoria contextual e evolucao por competencia em um fluxo unico.
            </p>
            <div className="inline-pills">
              <RewardPill label="Simulacao" value="adaptativa" />
              <RewardPill label="Mentoria" value="contextual" />
              <RewardPill label="Progressao" value="competencias" />
            </div>
          </div>
          <div className="journey-summary-card">
            <h4>Beneficios principais</h4>
            <p>1. Cenarios praticos para decisoes de alto impacto.</p>
            <p>2. Feedback orientado ao seu estilo de aprendizagem.</p>
            <p>3. Evolucao clara com reforco e recomendacoes de proximo passo.</p>
          </div>
        </section>
      ) : null}

      {currentStep === 2 ? (
        <div className="grid-two">
          <JourneyStageCard
            title="Individual"
            subtitle="Contexto"
            description="Foco em evolucao pessoal e decisoes do seu papel atual."
            selected={form.contextType === 'Individual'}
            onClick={() => setForm((prev) => ({ ...prev, contextType: 'Individual' }))}
          />
          <JourneyStageCard
            title="Time / Empresa"
            subtitle="Contexto"
            description="Foco em impacto coletivo, alinhamento e resultado organizacional."
            selected={form.contextType === 'Time / empresa'}
            onClick={() => setForm((prev) => ({ ...prev, contextType: 'Time / empresa' }))}
          />
        </div>
      ) : null}

      {currentStep === 3 ? (
        <>
          <div className="grid-two">
            {personaCards.map((persona) => (
              <JourneyStageCard
                key={persona.id}
                title={persona.title}
                subtitle={persona.subtitle}
                description={persona.description}
                selected={form.who === persona.id}
                onClick={() => setForm((prev) => ({ ...prev, who: persona.id }))}
              />
            ))}
          </div>
          <div className="grid-two">
            <label>
              Area de atuacao
              <input value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
            </label>
            <label>
              Nivel de experiencia
              <select value={form.experience} onChange={(event) => setForm((prev) => ({ ...prev, experience: event.target.value }))}>
                <option value="iniciante">iniciante</option>
                <option value="intermediario">intermediario</option>
                <option value="avancado">avancado</option>
              </select>
            </label>
          </div>
        </>
      ) : null}

      {currentStep === 4 ? (
        <div className="grid-two">
          {goalCards.map((goal) => (
            <JourneyStageCard
              key={goal.id}
              title={goal.title}
              subtitle="Objetivo"
              description={goal.description}
              selected={form.goal === goal.title}
              onClick={() => setForm((prev) => ({ ...prev, goal: goal.title }))}
            />
          ))}
        </div>
      ) : null}

      {currentStep === 5 ? (
        <div className="grid-two">
          {Object.entries(learningStyleCards).map(([key, value]) => (
            <JourneyStageCard
              key={key}
              title={key}
              subtitle={value.icon}
              description={value.description}
              details={[
                `Como aprende: ${value.learnsHow}`,
                `Mentoria ideal: ${value.mentorStyle}`
              ]}
              selected={form.learningStyle === key}
              onClick={() => setForm((prev) => ({ ...prev, learningStyle: key }))}
            />
          ))}
        </div>
      ) : null}

      {currentStep === 6 ? (
        <div className="grid-two">
          <DiagnosticMiniCard label="Perfil identificado" value={journeySummary.perfil} />
          <DiagnosticMiniCard label="Objetivo principal" value={journeySummary.objetivo} />
          <DiagnosticMiniCard label="Estilo de aprendizagem" value={journeySummary.estilo} />
          <DiagnosticMiniCard label="Mentoria prioritara" value={journeySummary.mentorStyle} />
        </div>
      ) : null}

      {currentStep === 7 ? (
        <div className="grid-two">
          <JourneySummaryCard title="Trilha recomendada">
            <p>Diagnostico -&gt; Simulacao -&gt; Feedback -&gt; Evolucao</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Foco atual">
            <p>Tomada de decisao sob pressao com consistencia.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Competencias prioritarias">
            <p>Assertividade, analise de risco e consistencia.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Primeira missao">
            <p>Priorizar backlog critico com restricao de tempo e equipe.</p>
          </JourneySummaryCard>
        </div>
      ) : null}

      {currentStep === 8 ? (
        <div className="list">
          {['Cenario 1', 'Cenario 2', 'Cenario 3', 'Cenario 4'].map((name, index) => (
            <TimelineStep
              key={name}
              title={name}
              status={index === 0 ? 'em andamento' : index === 1 ? 'disponivel' : 'bloqueado'}
              difficulty={index < 2 ? 'media' : 'alta'}
              competencies="decisao, risco e consistencia"
              current={index === 0}
            />
          ))}
        </div>
      ) : null}

      {currentStep === 9 ? (
        <div className="scenario-frame">
          <JourneySummaryCard title="Contexto">
            <p>Sprint final com risco de atraso e dependencia externa.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Tensao do problema">
            <p>Equilibrar entrega rapida e confiabilidade operacional.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Stakeholders">
            <div className="inline-pills">
              <span className="reward-pill">Cliente</span>
              <span className="reward-pill">Lider tecnico</span>
              <span className="reward-pill">Produto</span>
              <span className="reward-pill">Operacao</span>
            </div>
          </JourneySummaryCard>
          <JourneySummaryCard title="Restricoes">
            <p>Prazo curto, equipe reduzida e dependencias fora do controle direto.</p>
          </JourneySummaryCard>

          <div className="grid-two">
            {scenarioDecisionOptions.map((option) => (
              <ScenarioOptionCard
                key={option.id}
                title={option.title}
                rationale={option.rationale}
                risk={option.risk}
                consequence={option.consequence}
                selected={decision === option.id}
                onClick={() => {
                  setDecision(option.id);
                  saveJourneyFlowState({ step: currentStep, decision: option.id, form }).catch(() => null);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 10 ? (
        <div className="page-stack">
          {decisionResult ? (
            <>
              <div className="journey-summary-card">
                <h4>Consequencia imediata</h4>
                <p>{decisionResult.consequence}</p>
                <div className="inline-pills">
                  <RewardPill label="XP" value="+40" />
                  <RewardPill label="Streak" value="+1" />
                  <RewardPill label="Badge" value="Decisao sob pressao" />
                </div>
              </div>
              <div className="grid-two">
                <DiagnosticMiniCard label="Velocidade" value={`${decisionResult.impact.velocidade > 0 ? '+' : ''}${decisionResult.impact.velocidade}`} />
                <DiagnosticMiniCard label="Assertividade" value={`${decisionResult.impact.assertividade > 0 ? '+' : ''}${decisionResult.impact.assertividade}`} />
                <DiagnosticMiniCard label="Analise de risco" value={`${decisionResult.impact.analiseRisco > 0 ? '+' : ''}${decisionResult.impact.analiseRisco}`} />
                <DiagnosticMiniCard label="Consistencia" value={`${decisionResult.impact.consistencia > 0 ? '+' : ''}${decisionResult.impact.consistencia}`} />
              </div>
              <JourneySummaryCard title="Recomendacao">
                <p>{decisionResult.recommendation}</p>
              </JourneySummaryCard>
            </>
          ) : (
            <p>Selecione uma opcao estrategica na etapa anterior para ver o resultado.</p>
          )}
        </div>
      ) : null}

      {currentStep === 11 ? (
        <div className="page-stack">
          <JourneySummaryCard title="O que voce fez">
            <p>{decisionResult?.title || 'Decisao ainda nao registrada.'}</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Impacto da decisao">
            <p>{decisionResult?.consequence || 'Impacto aparece apos escolher uma opcao.'}</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Competencias afetadas">
            <p>Velocidade, assertividade, analise de risco e consistencia.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title={`Insight do mentor (${journeySummary.mentorStyle})`}>
            <p>{feedbackByStyle[selectedFeedbackStyle]}</p>
            <button type="button" className="secondary-button" onClick={() => setShowAltFeedback((prev) => !prev)}>
              {showAltFeedback ? 'Ocultar outras leituras' : 'Ver outras leituras'}
            </button>
            {showAltFeedback ? (
              <div className="list compact-list">
                {Object.entries(feedbackByStyle)
                  .filter(([style]) => style !== selectedFeedbackStyle)
                  .map(([style, text]) => (
                    <div className="list-item" key={style}>
                      <strong>{style}</strong>
                      <p>{text}</p>
                    </div>
                  ))}
              </div>
            ) : null}
          </JourneySummaryCard>
        </div>
      ) : null}

      {currentStep === 12 ? (
        <div className="grid-two">
          <JourneySummaryCard title="Conceito">
            <p>Matriz impacto x urgencia para decidir sob pressao sem perder criterio.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Exemplo">
            <p>Priorizacao de backlog com dependencias externas e janela curta de entrega.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Ferramenta">
            <p>Checklist de risco critico com checkpoints no meio do ciclo.</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Recomendacao complementar">
            <p>Revisar decisoes com mentor antes da proxima missao de alta incerteza.</p>
          </JourneySummaryCard>
        </div>
      ) : null}

      {currentStep === 13 ? (
        <div className="grid-two">
          {Object.entries(journeySummary.competencias).map(([key, value]) => (
            <CompetencyMeter key={key} label={key} value={value} baseline={Math.max(0, value - 12)} />
          ))}
        </div>
      ) : null}

      {currentStep === 14 ? (
        <div className="journey-summary-card">
          <h4>Proximo passo</h4>
          <p>Avance para o proximo cenario para consolidar competencias em contexto novo.</p>
          <div className="list compact-list">
            <button type="button" onClick={() => goToStep(8)}>Avancar para proximo cenario</button>
            <button type="button" className="secondary-button" onClick={() => goToStep(10)}>Revisar decisao</button>
            <button type="button" className="secondary-button" onClick={() => goToStep(11)}>Falar com mentor</button>
            <button type="button" className="secondary-button">Encerrar por hoje</button>
          </div>
        </div>
      ) : null}

      {currentStep === 15 ? (
        <div className="journey-summary-card celebratory">
          <h4>Resumo final da jornada</h4>
          <p>Voce concluiu um ciclo de decisao com evolucao observavel em competencias-chave.</p>
          <div className="inline-pills">
            <RewardPill label="Competencias desenvolvidas" value="assertividade, risco e consistencia" />
            <RewardPill label="XP ganho" value="+180" />
            <RewardPill label="Badge" value="Estrategista em formacao" />
          </div>
          <p>Proxima trilha recomendada: negociacao com stakeholders em ambiente ambiguo.</p>
        </div>
      ) : null}

      <div className="row-between wrap gap-sm">
        <button type="button" className="secondary-button" onClick={prev} disabled={currentStep === 1}>Voltar</button>
        {currentStep < 15 ? (
          <button type="button" onClick={next}>Avancar</button>
        ) : (
          <button type="button" onClick={() => goToStep(1)}>Reiniciar fluxo</button>
        )}
      </div>

      <div className="grid-two">
        <MentorCard title="Cenario atual" value="Priorizacao critica em sprint" />
        <MentorCard title="Estilo de mentoria" value={journeySummary.mentorStyle} />
      </div>
    </div>
  );
}
