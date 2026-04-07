import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import GlowCard from '../../../components/game/GlowCard.jsx';

const DELTA_META = {
  stakeholder_trust: { label: 'Confiança', positiveGood: true },
  team_alignment: { label: 'Alinhamento', positiveGood: true },
  execution_risk: { label: 'Risco', positiveGood: false },
  budget: { label: 'Budget', positiveGood: true },
  morale: { label: 'Moral', positiveGood: true },
  time_pressure: { label: 'Pressão de Tempo', positiveGood: false },
  learning_confidence: { label: 'Confiança', positiveGood: true },
  market_perception: { label: 'Percepção', positiveGood: true },
  tension_level: { label: 'Tensão', positiveGood: false },
};

function sign(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function DeltaItem({ metaKey, value }) {
  const meta = DELTA_META[metaKey] || { label: metaKey, positiveGood: true };
  const num = Number(value);
  const isGood = meta.positiveGood ? num >= 0 : num <= 0;
  const Icon = num >= 0 ? TrendingUp : TrendingDown;
  const color = isGood ? '#4ade80' : '#f87171';

  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{
        background: isGood ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${isGood ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}
      initial={{ opacity: 0, x: -12, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Icon size={14} style={{ color }} />
      <span className="text-sm" style={{ color: 'rgba(251,207,232,0.7)' }}>{meta.label}</span>
      <span className="ml-auto font-bold tabular-nums text-sm" style={{ color }}>
        {sign(Math.round(num))}
      </span>
    </motion.div>
  );
}

function TwistBanner({ twist }) {
  if (!twist) return null;
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.15))',
        border: '1px solid rgba(239,68,68,0.5)',
        boxShadow: '0 0 60px rgba(239,68,68,0.25)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Flicker overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.08)' }}
        animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
        transition={{ duration: 0.5, delay: 0.4, times: [0, 0.2, 0.4, 0.7, 1] }}
      />

      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          <span
            className="font-black text-sm tracking-widest uppercase"
            style={{ color: '#f87171', letterSpacing: '0.15em' }}
          >
            Plot Twist
          </span>
        </div>
        <h3 className="font-bold text-lg" style={{ color: '#fff' }}>
          {twist.title || 'Evento inesperado'}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {twist.narrative}
        </p>
        {twist.suggestedAction && (
          <div
            className="mt-1 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#fed7aa', border: '1px solid rgba(249,115,22,0.3)' }}
          >
            💡 {twist.suggestedAction}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ConsequenceScene({ consequence, decision, twist, rewards, onContinue, continuing = false }) {
  const narrative = consequence?.narrative || 'Decisão registrada e processada pelo backend.';
  const delta = consequence?.delta || {};
  const deltaEntries = Object.entries(delta).filter(([, v]) => v !== 0);
  const qualityScore = Number(decision?.qualityScore || 0);
  const isSuccess = qualityScore >= 60;
  const xpAwarded = Number(rewards?.xpAwarded || 0);
  const badges = rewards?.badges || rewards?.badgeSummary || [];

  // Map quality to visual state
  const resultType = twist
    ? 'twist'
    : qualityScore >= 75
      ? 'success'
      : qualityScore >= 45
        ? 'neutral'
        : 'failure';

  const RESULT_CONFIGS = {
    success: {
      bg: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.16) 0%, transparent 60%), #090816',
      titleColor: '#4ade80',
      icon: CheckCircle,
      iconColor: '#4ade80',
      label: 'Boa decisão',
    },
    neutral: {
      bg: 'radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.12) 0%, transparent 60%), #090816',
      titleColor: '#fbbf24',
      icon: Zap,
      iconColor: '#fbbf24',
      label: 'Decisão registrada',
    },
    failure: {
      bg: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.14) 0%, transparent 60%), #090816',
      titleColor: '#f87171',
      icon: AlertTriangle,
      iconColor: '#f87171',
      label: 'Decisão de risco',
    },
    twist: {
      bg: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.2) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.12) 0%, transparent 40%), #090816',
      titleColor: '#fca5a5',
      icon: AlertTriangle,
      iconColor: '#ef4444',
      label: 'REVIRAVOLTA',
    },
  };

  const cfg = RESULT_CONFIGS[resultType];
  const Icon = cfg.icon;

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: cfg.bg }}
    >
      <div className="relative z-10 flex flex-col max-w-2xl mx-auto w-full px-5 py-16 pb-8 gap-6">
        {/* Header reveal */}
        <motion.div
          className="flex flex-col items-center text-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `rgba(${resultType === 'success' ? '34,197,94' : resultType === 'twist' ? '239,68,68' : '234,179,8'},0.15)`,
              border: `1px solid ${cfg.iconColor}40`,
              boxShadow: `0 0 40px ${cfg.iconColor}30`,
            }}
            animate={{ rotate: [0, resultType === 'twist' ? -5 : 3, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Icon size={30} style={{ color: cfg.iconColor }} />
          </motion.div>

          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: cfg.iconColor }}
            >
              {cfg.label}
            </div>
            {qualityScore > 0 && (
              <motion.div
                className="text-4xl font-black"
                style={{ color: cfg.titleColor, letterSpacing: '-0.04em' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {qualityScore}
                <span className="text-lg ml-1" style={{ color: `${cfg.titleColor}80` }}>/100</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Twist banner if exists */}
        {twist && <TwistBanner twist={twist} />}

        {/* Narrative */}
        <GlowCard glowColor={resultType === 'success' ? 'cyan' : resultType === 'failure' ? 'red' : 'pink'}>
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
              {narrative}
            </p>
          </motion.div>
        </GlowCard>

        {/* World state delta */}
        {deltaEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(244,114,182,0.5)' }}>
              Impacto no mundo
            </div>
            <div className="grid grid-cols-2 gap-2">
              {deltaEntries.map(([key, val]) => (
                <DeltaItem key={key} metaKey={key} value={val} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Rewards */}
        {(xpAwarded > 0 || badges.length > 0) && (
          <motion.div
            className="flex items-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {xpAwarded > 0 && (
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.18))',
                  border: '1px solid rgba(236,72,153,0.4)',
                  color: '#fce7f3',
                  boxShadow: '0 0 24px rgba(236,72,153,0.2)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <Zap size={14} className="text-pink-400" />
                +{xpAwarded} XP
              </motion.div>
            )}
            {(Array.isArray(badges) ? badges : []).slice(0, 3).map((badge, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
                style={{
                  background: 'rgba(234,179,8,0.12)',
                  border: '1px solid rgba(234,179,8,0.3)',
                  color: '#fef08a',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 + i * 0.1, type: 'spring' }}
              >
                🏅 {typeof badge === 'string' ? badge : badge.label || badge.name || badge.code || 'Badge'}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Continue CTA */}
        <motion.button
          type="button"
          disabled={continuing}
          onClick={onContinue}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(236,72,153,0.35)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {continuing ? 'Processando…' : (
            <>
              Continuar jornada
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
