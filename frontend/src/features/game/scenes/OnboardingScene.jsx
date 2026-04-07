import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2,
  BookOpen,
  Brain,
  Briefcase,
  Compass,
  GraduationCap,
  Lightbulb,
  Rocket,
  Target,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import GlowCard from '../../../components/game/GlowCard.jsx';

const PROFILES = [
  {
    key: 'explorador',
    label: 'Explorador',
    icon: Compass,
    color: 'cyan',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.22), rgba(56,189,248,0.14))',
    glowColor: '#06b6d4',
    description: 'Aprende testando caminhos e explorando possibilidades.',
    dominantStyle: 'explorador',
    contextType: 'B2C',
    area: 'Produto',
    experienceLevel: 'iniciante',
    primaryObjective: 'Explorar cenários novos e reduzir incerteza com critério.',
    mentorMode: 'socratico',
  },
  {
    key: 'pratico',
    label: 'Prático',
    icon: Zap,
    color: 'orange',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.22), rgba(234,179,8,0.14))',
    glowColor: '#f97316',
    description: 'Prefere orientação direta, ação curta e feedback objetivo.',
    dominantStyle: 'pratico',
    contextType: 'B2B',
    area: 'Operacoes',
    experienceLevel: 'intermediario',
    primaryObjective: 'Executar com consistência em contexto de alta pressão.',
    mentorMode: 'pratico',
  },
  {
    key: 'narrativo',
    label: 'Narrativo',
    icon: BookOpen,
    color: 'purple',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(236,72,153,0.14))',
    glowColor: '#a855f7',
    description: 'Conecta aprendizado a contexto, personagens e impacto humano.',
    dominantStyle: 'narrativo',
    contextType: 'B2B',
    area: 'Lideranca',
    experienceLevel: 'avancado',
    primaryObjective: 'Conduzir decisão por storytelling estratégico e alinhamento.',
    mentorMode: 'narrativo',
  },
  {
    key: 'analitico',
    label: 'Analítico',
    icon: Brain,
    color: 'pink',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.22), rgba(168,85,247,0.14))',
    glowColor: '#ec4899',
    description: 'Valoriza critério, dado e decomposição de trade-offs.',
    dominantStyle: 'analitico',
    contextType: 'B2C',
    area: 'Dados',
    experienceLevel: 'avancado',
    primaryObjective: 'Elevar qualidade de decisão com evidências e análise de risco.',
    mentorMode: 'analitico',
  },
];

const GOALS = [
  {
    key: 'resolver-problema',
    goalType: 'resolver problema',
    goalTitle: 'Resolver um problema crítico',
    goalDescription: 'Quero estruturar resposta para cenários críticos com risco e impacto.',
    icon: Target,
    color: 'pink',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(251,113,133,0.14))',
    payoff: 'Eleva repertório para incidentes e cenários voláteis.',
  },
  {
    key: 'aprender-conceito',
    goalType: 'melhorar performance',
    goalTitle: 'Aprender tomando decisões',
    goalDescription: 'Quero decidir melhor em cenários com pressão e ambiguidade.',
    icon: Lightbulb,
    color: 'orange',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,179,8,0.14))',
    payoff: 'Prioriza velocidade com consistência operacional.',
  },
  {
    key: 'desenvolver-habilidade',
    goalType: 'desenvolver habilidade',
    goalTitle: 'Desenvolver uma competência',
    goalDescription: 'Quero evoluir em negociação, liderança ou análise estratégica.',
    icon: BarChart2,
    color: 'purple',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.14))',
    payoff: 'Fortalece influência e alinhamento entre áreas.',
  },
];

const EXPERIENCE_LEVELS = [
  { key: 'iniciante', label: 'Iniciante', icon: GraduationCap, desc: 'Primeira vez no tema' },
  { key: 'intermediario', label: 'Intermediário', icon: Briefcase, desc: 'Alguma experiência prática' },
  { key: 'avancado', label: 'Avançado', icon: Rocket, desc: 'Domínio consolidado' },
];

const STAR_FIELD = Array.from({ length: 24 }, (_, i) => ({
  left: `${4 + (i * 4.1) % 92}%`,
  top: `${8 + (i * 7.3) % 84}%`,
  size: 1.5 + (i % 3) * 1.2,
  opacity: 0.15 + (i % 5) * 0.08,
  delay: (i % 8) * 0.4,
}));

function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {STAR_FIELD.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, opacity: star.opacity }}
          animate={{ opacity: [star.opacity, star.opacity * 2.5, star.opacity] }}
          transition={{ duration: 2.5 + (i % 4), delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i === current
              ? 'linear-gradient(90deg, #ec4899, #8b5cf6)'
              : i < current
                ? 'rgba(236,72,153,0.5)'
                : 'rgba(255,255,255,0.12)',
          }}
          animate={{ width: i === current ? 20 : 6 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

export default function OnboardingScene({ onComplete }) {
  const [step, setStep] = useState(0); // 0=profile, 1=goal, 2=experience
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const TOTAL_STEPS = 3;

  async function handleComplete() {
    if (!selectedProfile || !selectedGoal || !selectedLevel) return;
    setLoading(true);
    setError('');
    try {
      await onComplete({
        profile: selectedProfile,
        goal: selectedGoal,
        experienceLevel: selectedLevel.key,
      });
    } catch (err) {
      setError(err?.message || 'Erro ao salvar perfil.');
      setLoading(false);
    }
  }

  const canAdvanceStep0 = step === 0 && !!selectedProfile;
  const canAdvanceStep1 = step === 1 && !!selectedGoal;
  const canFinish = step === 2 && !!selectedLevel;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.18) 0%, rgba(9,8,22,1) 60%)' }}
    >
      <StarField />

      {/* Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3 mb-10 text-center"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: 'rgba(236,72,153,0.15)',
            border: '1px solid rgba(236,72,153,0.3)',
            color: '#f9a8d4',
          }}
        >
          aprende.ai
        </div>
        <h1 className="text-3xl sm:text-4xl font-black" style={{ color: '#ffffff', letterSpacing: '-0.03em' }}>
          {step === 0 && 'Qual é o seu perfil?'}
          {step === 1 && 'Qual é seu objetivo?'}
          {step === 2 && 'Seu nível de experiência?'}
        </h1>
        <p className="text-sm max-w-md" style={{ color: 'rgba(251,207,232,0.65)' }}>
          {step === 0 && 'Escolha o estilo de aprendizagem que mais combina com você.'}
          {step === 1 && 'A IA vai adaptar a jornada ao seu foco principal.'}
          {step === 2 && 'Definimos a dificuldade inicial e o ritmo de progressão.'}
        </p>
        <StepIndicator current={step} total={TOTAL_STEPS} />
      </motion.div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        {/* Step 0 — Profile selection */}
        {step === 0 && (
          <motion.div
            key="step-profile"
            className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {PROFILES.map((p, i) => {
              const Icon = p.icon;
              const isSelected = selectedProfile?.key === p.key;
              return (
                <GlowCard
                  key={p.key}
                  glowColor={p.color}
                  active={isSelected}
                  onClick={() => setSelectedProfile(p)}
                  style={{ background: isSelected ? p.gradient : undefined }}
                >
                  <motion.div
                    className="p-5 flex flex-col gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: isSelected
                          ? `radial-gradient(circle, ${p.glowColor}40, ${p.glowColor}10)`
                          : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? p.glowColor + '60' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isSelected ? `0 0 20px ${p.glowColor}40` : 'none',
                      }}
                    >
                      <Icon size={22} style={{ color: isSelected ? p.glowColor : 'rgba(251,207,232,0.6)' }} />
                    </div>
                    <div>
                      <div className="font-bold text-base" style={{ color: isSelected ? '#fff' : 'rgba(251,207,232,0.85)' }}>
                        {p.label}
                      </div>
                      <div className="text-xs mt-1 leading-snug" style={{ color: 'rgba(251,207,232,0.5)' }}>
                        {p.description}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-0.5 rounded-full"
                        style={{ background: `linear-gradient(90deg, ${p.glowColor}, transparent)` }}
                      />
                    )}
                  </motion.div>
                </GlowCard>
              );
            })}
          </motion.div>
        )}

        {/* Step 1 — Goal selection */}
        {step === 1 && (
          <motion.div
            key="step-goal"
            className="relative z-10 flex flex-col gap-4 w-full max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {GOALS.map((g, i) => {
              const Icon = g.icon;
              const isSelected = selectedGoal?.key === g.key;
              return (
                <GlowCard
                  key={g.key}
                  glowColor={g.color}
                  active={isSelected}
                  onClick={() => setSelectedGoal(g)}
                  style={{ background: isSelected ? g.gradient : undefined }}
                >
                  <motion.div
                    className="p-5 flex items-start gap-4"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <Icon size={20} style={{ color: isSelected ? '#fff' : 'rgba(251,207,232,0.55)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color: isSelected ? '#fff' : 'rgba(251,207,232,0.85)' }}>
                        {g.goalTitle}
                      </div>
                      <div className="text-xs mt-1 leading-snug" style={{ color: 'rgba(251,207,232,0.48)' }}>
                        {g.goalDescription}
                      </div>
                      {isSelected && (
                        <div className="text-xs mt-2 font-medium" style={{ color: '#f9a8d4' }}>
                          → {g.payoff}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </GlowCard>
              );
            })}
          </motion.div>
        )}

        {/* Step 2 — Experience level */}
        {step === 2 && (
          <motion.div
            key="step-level"
            className="relative z-10 flex flex-col gap-4 w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {EXPERIENCE_LEVELS.map((lvl, i) => {
              const Icon = lvl.icon;
              const isSelected = selectedLevel?.key === lvl.key;
              return (
                <GlowCard
                  key={lvl.key}
                  glowColor="pink"
                  active={isSelected}
                  onClick={() => setSelectedLevel(lvl)}
                >
                  <motion.div
                    className="px-5 py-4 flex items-center gap-4"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Icon size={22} style={{ color: isSelected ? '#ec4899' : 'rgba(251,207,232,0.5)' }} />
                    <div>
                      <div className="font-bold text-sm" style={{ color: isSelected ? '#fff' : 'rgba(251,207,232,0.85)' }}>
                        {lvl.label}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(251,207,232,0.45)' }}>{lvl.desc}</div>
                    </div>
                    {isSelected && (
                      <motion.div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ background: 'rgba(236,72,153,0.3)', border: '1px solid rgba(236,72,153,0.6)' }}
                      >
                        <div className="w-2 h-2 rounded-full bg-pink-400" />
                      </motion.div>
                    )}
                  </motion.div>
                </GlowCard>
              );
            })}

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm text-center"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
              >
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.div
        className="relative z-10 mt-8 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          type="button"
          disabled={(!canAdvanceStep0 && !canAdvanceStep1 && !canFinish) || loading}
          onClick={() => {
            if (step === 0 && canAdvanceStep0) setStep(1);
            else if (step === 1 && canAdvanceStep1) setStep(2);
            else if (step === 2 && canFinish) handleComplete();
          }}
          className="px-10 py-3.5 rounded-2xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(236,72,153,0.35)',
          }}
          whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(236,72,153,0.5)' }}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? 'Iniciando jornada…' : step < 2 ? 'Continuar →' : 'Entrar na jornada'}
        </motion.button>

        {step > 0 && (
          <button
            type="button"
            className="text-xs"
            style={{ color: 'rgba(251,207,232,0.35)', background: 'none', padding: '4px 8px' }}
            onClick={() => setStep((s) => s - 1)}
          >
            ← Voltar
          </button>
        )}
      </motion.div>
    </div>
  );
}
