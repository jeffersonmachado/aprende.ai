import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, ExperienceCard, StageWrapper } from '../../components';
import { saveOnboarding } from '../../services/profileApi.js';

const PROFILE_OPTIONS = [
  {
    key: 'profissional',
    label: 'Profissional',
    avatar: '💼',
    archetype: 'Operacao em campo',
    contextType: 'B2B',
    area: 'Operacoes',
    experienceLevel: 'intermediario',
    primaryObjective: 'Executar com consistencia em contexto de alta pressao.',
    mentorTone: 'pratico',
    openingScenario: 'Crise com cliente enterprise e necessidade de plano em fases.',
    competencies: ['tomada de decisao', 'comunicacao', 'consistencia']
  },
  {
    key: 'estudante',
    label: 'Estudante',
    avatar: '🎓',
    archetype: 'Exploracao guiada',
    contextType: 'B2C',
    area: 'Produto',
    experienceLevel: 'iniciante',
    primaryObjective: 'Explorar cenarios novos e reduzir incerteza com criterio.',
    mentorTone: 'socratico',
    openingScenario: 'Primeira missao com ambiguidade alta e pouco historico para apoiar a escolha.',
    competencies: ['analise critica', 'aprendizado', 'curiosidade aplicada']
  },
  {
    key: 'lider',
    label: 'Lider',
    avatar: '🏆',
    archetype: 'Comando e alinhamento',
    contextType: 'B2B',
    area: 'Lideranca',
    experienceLevel: 'avancado',
    primaryObjective: 'Conduzir decisao por storytelling estrategico e alinhamento.',
    mentorTone: 'narrativo',
    openingScenario: 'Negociacao de escopo com pressao politica e conflito entre liderancas.',
    competencies: ['lideranca', 'negociacao', 'comunicacao']
  },
  {
    key: 'empreendedor',
    label: 'Empreendedor',
    avatar: '🚀',
    archetype: 'Hipotese e risco',
    contextType: 'B2C',
    area: 'Dados',
    experienceLevel: 'avancado',
    primaryObjective: 'Elevar qualidade de decisao com evidencias e analise de risco.',
    mentorTone: 'analitico',
    openingScenario: 'Priorizacao sob risco com capital curto e impacto imediato no crescimento.',
    competencies: ['analise de risco', 'priorizacao', 'visao estrategica']
  }
];

const GOAL_OPTIONS = [
  {
    goalType: 'melhorar performance',
    goalTitle: 'Tomar decisoes sob pressao com clareza',
    goalDescription: 'Quero responder mais rapido sem comprometer qualidade da escolha.',
    payoff: 'Prioriza velocidade com consistencia operacional.',
    tradeoff: 'Vai exigir cortar ruído e sustentar critério sob tensão.',
    openingFocus: 'Resposta executiva em janela curta.'
  },
  {
    goalType: 'desenvolver habilidade',
    goalTitle: 'Evoluir em negociacao e alinhamento',
    goalDescription: 'Quero reduzir conflito e transformar impasse em plano executavel.',
    payoff: 'Fortalece influência e alinhamento entre áreas.',
    tradeoff: 'Vai exigir exposição de trade-offs e gestão de fricção política.',
    openingFocus: 'Conflito entre stakeholders com pressão por consenso.'
  },
  {
    goalType: 'resolver problema',
    goalTitle: 'Estruturar resposta para cenarios criticos',
    goalDescription: 'Quero organizar decisao por risco, impacto e sequencia de acao.',
    payoff: 'Eleva repertório para incidentes e cenários voláteis.',
    tradeoff: 'Vai exigir disciplina para priorizar evidência sobre impulso.',
    openingFocus: 'Ambiente crítico com múltiplos caminhos de contenção.'
  }
];

const STYLE_OPTIONS = [
  {
    key: 'explorador',
    label: 'Explorador',
    summary: 'Aprende testando caminhos e variacoes de cenario.',
    mentorMode: 'socratico',
    feedbackStyle: 'Perguntas curtas para abrir hipóteses e caminhos.',
    mentorSample: 'O que você ainda não sabe e precisaria validar antes de agir?'
  },
  {
    key: 'pratico',
    label: 'Pratico',
    summary: 'Prefere orientacao direta, acao curta e feedback objetivo.',
    mentorMode: 'pratico',
    feedbackStyle: 'Direção operacional com próximo passo imediato.',
    mentorSample: 'Escolha uma ação de alto impacto para executar nas próximas 2 horas.'
  },
  {
    key: 'narrativo',
    label: 'Narrativo',
    summary: 'Conecta aprendizado a contexto, personagens e impacto humano.',
    mentorMode: 'narrativo',
    feedbackStyle: 'Leitura de contexto, tensão e consequência humana.',
    mentorSample: 'Se você contasse esta decisão como uma história, onde está a tensão principal?'
  },
  {
    key: 'analitico',
    label: 'Analitico',
    summary: 'Valoriza criterio, dado e decomposicao de trade-offs.',
    mentorMode: 'analitico',
    feedbackStyle: 'Critério, hipótese e evidência antes da execução.',
    mentorSample: 'Liste critério, risco e ganho esperado antes de confirmar o movimento.'
  }
];

const STEP_META = {
  1: { title: 'Escolha seu perfil', subtitle: 'Defina seu papel inicial na campanha.' },
  2: { title: 'Defina a missao principal', subtitle: 'Escolha a meta que orienta suas decisoes.' },
  3: { title: 'Ajuste o estilo de aprendizagem', subtitle: 'Adapte narrativa, objetividade e tom da mentoria.' }
};

const initialForm = {
  displayName: '',
  profileKey: 'estudante',
  contextType: 'B2B',
  area: 'Operacoes',
  experienceLevel: 'intermediario',
  primaryObjective: 'Evoluir tomada de decisão em cenários críticos',
  goalTitle: 'Melhorar tomada de decisão',
  goalType: 'desenvolver habilidade',
  goalDescription: 'Quero decidir melhor em cenários com pressão.',
  dominantStyle: 'pratico'
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedProfile = PROFILE_OPTIONS.find((item) => item.key === form.profileKey) || PROFILE_OPTIONS[1];
  const selectedGoal = GOAL_OPTIONS.find((item) => item.goalTitle === form.goalTitle) || GOAL_OPTIONS[0];
  const selectedStyle = STYLE_OPTIONS.find((item) => item.key === form.dominantStyle) || STYLE_OPTIONS[1];

  function applyProfile(profile) {
    setForm((prev) => ({
      ...prev,
      profileKey: profile.key,
      contextType: profile.contextType,
      area: profile.area,
      experienceLevel: profile.experienceLevel,
      primaryObjective: profile.primaryObjective,
      displayName: prev.displayName || 'Aprendiz estrategista'
    }));
  }

  function applyGoal(goal) {
    setForm((prev) => ({
      ...prev,
      goalType: goal.goalType,
      goalTitle: goal.goalTitle,
      goalDescription: goal.goalDescription
    }));
  }

  function applyStyle(style) {
    setForm((prev) => ({
      ...prev,
      dominantStyle: style.key
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await saveOnboarding(form);
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StageWrapper
      stageKey="onboarding"
      title="Preparacao da campanha"
      subtitle="Monte sua jornada em 3 etapas: perfil, missao e estilo de aprendizagem"
      completed={result ? 3 : step}
      total={3}
      variant="mentor"
      loading={loading}
      stageSemantic="learning"
    >
      <ExperienceCard variant="mentor" className="onboarding-campaign-shell" title={STEP_META[step].title} subtitle={STEP_META[step].subtitle}>
        <div className="onboarding-hero-banner">
          <div>
            <p className="campaign-kicker">Entrada em campanha</p>
            <h3>{step === 1 ? 'Escolha seu papel no campo' : step === 2 ? 'Defina a tensao que vai guiar a jornada' : 'Selecione como voce quer jogar e aprender'}</h3>
            <p>{step === 1 ? 'Cada perfil muda o tom da abertura, a mentoria e o tipo de desafio que chega primeiro.' : step === 2 ? 'A meta define o eixo emocional da campanha e o tipo de trade-off que vai aparecer com mais frequencia.' : 'O estilo afeta linguagem, ritmo e forma como o mentor devolve criterio.'}</p>
          </div>
          <div className="onboarding-hero-aside">
            <span>Preview imediato</span>
            <strong>{selectedProfile.label} · {selectedStyle.label}</strong>
            <p>{selectedGoal.openingFocus || selectedProfile.openingScenario}</p>
          </div>
        </div>
        <div className="onboarding-stepper-hero">
          {[1, 2, 3].map((item) => {
            const active = step === item;
            const done = step > item || result;
            return (
              <div key={item} className={`onboarding-step-chip ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                <span>{item}</span>
                <strong>{item === 1 ? 'Perfil' : item === 2 ? 'Meta' : 'Estilo'}</strong>
              </div>
            );
          })}
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <label>
                Nome de exibicao
                <input value={form.displayName} onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))} />
              </label>
              <div className="onboarding-step-storyboard">
                <div>
                  <span>Leitura do papel</span>
                  <strong>{selectedProfile.archetype}</strong>
                  <p>{selectedProfile.primaryObjective}</p>
                </div>
                <div>
                  <span>Primeira cena provavel</span>
                  <strong>{selectedProfile.openingScenario}</strong>
                  <p>Mentor inicial sugerido: {selectedProfile.mentorTone}.</p>
                </div>
              </div>
              <div className="onboarding-profile-grid">
                {PROFILE_OPTIONS.map((profile) => {
                  const isSelected = selectedProfile.key === profile.key;
                  return (
                    <motion.button
                      key={profile.key}
                      type="button"
                      className={`campaign-onboarding-card onboarding-profile-card ${isSelected ? 'active' : ''}`}
                      onClick={() => applyProfile(profile)}
                      whileHover={{ y: -4, scale: 1.025 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="onboarding-profile-visual">
                        <div className="onboarding-avatar">{profile.avatar}</div>
                        <div className="onboarding-profile-frame" />
                      </div>
                      <strong>{profile.label}</strong>
                      <span className="onboarding-card-eyebrow">{profile.archetype}</span>
                      <p>{profile.primaryObjective}</p>
                      <div className="campaign-tag-cloud compact">
                        {profile.competencies.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
                      </div>
                      <div className="onboarding-card-footer">
                        <span>{profile.area}</span>
                        <strong>{profile.experienceLevel}</strong>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <div className="campaign-choice-list">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoal.goalTitle === goal.goalTitle;
                return (
                  <motion.button
                    key={goal.goalTitle}
                    type="button"
                    className={`campaign-choice-card campaign-onboarding-card ${isSelected ? 'active' : ''}`}
                    onClick={() => applyGoal(goal)}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <span className="campaign-choice-kicker">Meta</span>
                    <strong>{goal.goalTitle}</strong>
                    <p>{goal.goalDescription}</p>
                    <div className="onboarding-goal-meta">
                      <div>
                        <span>Ganho esperado</span>
                        <strong>{goal.payoff}</strong>
                      </div>
                      <div>
                        <span>Primeiro teste</span>
                        <strong>{goal.openingFocus}</strong>
                      </div>
                    </div>
                    <div className="onboarding-choice-footer">
                      <span>Trade-off</span>
                      <strong>{goal.tradeoff}</strong>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : null}

          {step === 3 ? (
            <>
              <div className="campaign-choice-list">
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = form.dominantStyle === style.key;
                  return (
                    <motion.button
                      key={style.key}
                      type="button"
                      className={`campaign-choice-card campaign-onboarding-card ${isSelected ? 'active' : ''}`}
                      onClick={() => applyStyle(style)}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <span className="campaign-choice-kicker">Estilo</span>
                      <strong>{style.label}</strong>
                      <p>{style.summary}</p>
                      <div className="onboarding-style-meta">
                        <span>Mentor</span>
                        <strong>{style.mentorMode}</strong>
                        <p>{style.feedbackStyle}</p>
                      </div>
                      <div className="onboarding-choice-footer">
                        <span>Exemplo do mentor</span>
                        <strong>{style.mentorSample}</strong>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <p className="onboarding-seed-text">
                Seed da jornada: perfil {selectedProfile.label.toLowerCase()} · meta {form.goalType} · estilo {form.dominantStyle}
              </p>
              <div className="onboarding-mentor-preview">
                <span>Preview do mentor</span>
                <strong>{selectedStyle.feedbackStyle}</strong>
                <p>{selectedStyle.mentorSample}</p>
              </div>
            </>
          ) : null}

          <div className="onboarding-preview-panel">
            <p className="campaign-kicker">Preview da campanha</p>
            <h4>{form.displayName || 'Aprendiz estrategista'}</h4>
            <p><strong>Perfil:</strong> {selectedProfile.label}</p>
            <p><strong>Meta:</strong> {selectedGoal.goalTitle}</p>
            <p><strong>Estilo:</strong> {selectedStyle.label}</p>
            <div className="onboarding-preview-grid">
              <div>
                <span>Primeira missao</span>
                <strong>{selectedGoal.openingFocus || selectedProfile.openingScenario}</strong>
              </div>
              <div>
                <span>Mentoria esperada</span>
                <strong>{selectedStyle.feedbackStyle}</strong>
              </div>
              <div>
                <span>Competencias iniciais</span>
                <strong>{selectedProfile.competencies.join(' · ')}</strong>
              </div>
            </div>
            <p className="muted-text">Trade-off inicial: {selectedGoal.tradeoff}</p>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <div className="campaign-actions">
            <Button type="button" variant="secondary" onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
              Voltar
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={() => setStep((prev) => Math.min(3, prev + 1))}>Avancar etapa</Button>
            ) : (
              <Button type="submit" disabled={loading}>{loading ? 'Gerando campanha...' : 'Gerar jornada personalizada'}</Button>
            )}
          </div>
        </form>
      </ExperienceCard>

      {result ? (
        <ExperienceCard variant="result" title="Jornada gerada" className="mt-4">
          <div className="list-item onboarding-result-shell">
            <strong>{result.journey?.title}</strong>
            <p>Passos gerados: {result.journey?.steps?.length || 0}</p>
            <p>Dificuldade inicial: {result?.journeyShape?.difficulty || 'medium'}</p>
            <p>Mentoria: {result?.journeyShape?.mentorshipStyle || form.dominantStyle}</p>
            <p>O fluxo agora segue em modo de jogo: cada fase libera a próxima sem depender de menu lateral.</p>
            <div className="campaign-actions">
              <Button type="button" onClick={() => navigate('/campaign')}>
                Entrar na campanha
              </Button>
            </div>
          </div>
        </ExperienceCard>
      ) : null}
    </StageWrapper>
  );
}
