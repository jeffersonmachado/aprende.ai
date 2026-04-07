import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, MapPin, MessageSquare, Target, Users } from 'lucide-react';
import { useState } from 'react';
import GlowCard from '../../../components/game/GlowCard.jsx';

function MentorBubble({ text }) {
  if (!text) return null;
  return (
    <motion.div
      className="flex items-start gap-3 mb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {/* Mentor avatar */}
      <div
        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-base"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(255,223,238,0.86), rgba(222,105,186,0.9) 58%, rgba(73,19,88,0.95))',
          border: '1px solid rgba(236,72,153,0.4)',
          boxShadow: '0 0 20px rgba(236,72,153,0.25)',
        }}
      >
        🧠
      </div>
      <div
        className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
        style={{
          background: 'rgba(236,72,153,0.08)',
          border: '1px solid rgba(236,72,153,0.2)',
          color: 'rgba(251,207,232,0.8)',
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

function RiskBadge({ level }) {
  if (!level) return null;
  const config = {
    low: { label: 'Risco baixo', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
    medium: { label: 'Risco médio', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
    high: { label: 'Risco alto', color: '#f87171', bg: 'rgba(239,68,68,0.14)' },
  };
  const cfg = config[String(level).toLowerCase()] || config.medium;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color }}
    >
      <AlertCircle size={11} />
      {cfg.label}
    </div>
  );
}

export default function MissionScene({ chapter, mission, engineRuntime, onAccept, onBack, starting = false }) {
  const [showContext, setShowContext] = useState(false);

  const title = mission?.title || engineRuntime?.mission?.title || chapter?.title || 'Missão';
  const objective = mission?.objective || engineRuntime?.mission?.objective || 'Objetivo carregado pelo backend.';
  const context = mission?.context || engineRuntime?.mission?.context || '';
  const riskLevel = mission?.riskLevel || engineRuntime?.mission?.riskLevel || null;
  const stakeholders = mission?.stakeholders || engineRuntime?.mission?.stakeholders || [];
  const competencies = mission?.competenciesImpacted || engineRuntime?.mission?.competenciesImpacted || [];
  const phases = chapter?.phases || [];

  // Mentor message derived from context
  const mentorMsg = context
    ? `"${context.slice(0, 120)}${context.length > 120 ? '…' : ''}"`
    : 'A IA preparou este cenário com base no seu perfil. Avalie o contexto antes de agir.';

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% -10%, rgba(236,72,153,0.16) 0%, transparent 55%), #090816',
      }}
    >
      {/* Decorative beam */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-px h-48 opacity-30"
        style={{ background: 'linear-gradient(180deg, rgba(236,72,153,0.8), transparent)' }}
      />

      <div className="relative z-10 flex flex-col max-w-2xl mx-auto w-full px-5 py-16 pb-8 gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(236,72,153,0.14)',
                border: '1px solid rgba(236,72,153,0.28)',
                color: '#f9a8d4',
              }}
            >
              <Target size={10} />
              {phases.length > 0 ? `${phases.length} fases` : 'Missão'}
            </div>
            {riskLevel && <RiskBadge level={riskLevel} />}
          </div>

          <h1
            className="text-3xl font-black leading-tight"
            style={{ color: '#ffffff', letterSpacing: '-0.03em' }}
          >
            {title}
          </h1>
        </motion.div>

        {/* Mentor bubble */}
        <div>
          <MentorBubble text={mentorMsg} />
        </div>

        {/* Mission card */}
        <GlowCard glowColor="pink">
          <div className="p-6 flex flex-col gap-5">
            {/* Objective */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-pink-400" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(244,114,182,0.7)' }}>
                  Objetivo
                </span>
              </div>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {objective}
              </p>
            </motion.div>

            {/* Context toggle */}
            {context && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  type="button"
                  onClick={() => setShowContext((prev) => !prev)}
                  className="flex items-center gap-2 text-xs font-medium"
                  style={{ color: 'rgba(244,114,182,0.7)', background: 'none', padding: 0 }}
                >
                  <MessageSquare size={13} />
                  {showContext ? 'Ocultar contexto narrativo' : 'Ver contexto completo'}
                </button>
                {showContext && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 text-sm leading-relaxed"
                    style={{
                      color: 'rgba(251,207,232,0.6)',
                      borderLeft: '2px solid rgba(236,72,153,0.3)',
                      paddingLeft: '1rem',
                    }}
                  >
                    {context}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Stakeholders */}
            {stakeholders.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users size={13} className="text-pink-400/70" />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(244,114,182,0.55)' }}>
                    Stakeholders
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stakeholders.slice(0, 4).map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(251,207,232,0.6)',
                      }}
                    >
                      {typeof s === 'string' ? s : s.name || s.role || `Stakeholder ${i + 1}`}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Competencies */}
            {competencies.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-1.5"
              >
                {competencies.slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(168,85,247,0.12)',
                      border: '1px solid rgba(168,85,247,0.25)',
                      color: '#c4b5fd',
                    }}
                  >
                    {typeof c === 'string' ? c : c.name || c.label || c.code || `C${i + 1}`}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Phase preview */}
            {phases.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={13} className="text-pink-400/60" />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(244,114,182,0.5)' }}>
                    Fases do capítulo
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {phases.map((phase, i) => (
                    <div
                      key={phase.id || i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                      style={{
                        background: i === 0 ? 'rgba(236,72,153,0.14)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${i === 0 ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: i === 0 ? '#f9a8d4' : 'rgba(251,207,232,0.45)',
                      }}
                    >
                      <span className="font-mono">{i + 1}</span>
                      <span>{phase.title || phase.type || `Fase ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </GlowCard>

        {/* CTA */}
        <motion.div
          className="flex gap-3 mt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-xl text-sm font-bold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(251,207,232,0.6)',
              }}
            >
              ← Mapa
            </button>
          )}
          <motion.button
            type="button"
            disabled={starting}
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(236,72,153,0.35)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(236,72,153,0.5)' }}
            whileTap={{ scale: 0.97 }}
          >
            {starting ? 'Iniciando fase…' : (
              <>
                Aceitar missão
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
