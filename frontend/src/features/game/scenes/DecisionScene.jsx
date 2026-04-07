import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import GlowCard from '../../../components/game/GlowCard.jsx';

const CHOICE_GRADIENTS = [
  'linear-gradient(135deg, rgba(236,72,153,0.22), rgba(168,85,247,0.16))',
  'linear-gradient(135deg, rgba(249,115,22,0.22), rgba(234,179,8,0.14))',
  'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(56,189,248,0.14))',
  'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(99,102,241,0.16))',
];

const CHOICE_GLOW_COLORS = ['pink', 'orange', 'cyan', 'purple'];
const CHOICE_BORDER_ACTIVE = [
  'rgba(236,72,153,0.8)',
  'rgba(249,115,22,0.8)',
  'rgba(6,182,212,0.8)',
  'rgba(168,85,247,0.8)',
];

function WorldStateMini({ worldState = {} }) {
  const metrics = [
    { key: 'stakeholder_trust', label: 'Confiança', icon: '🤝' },
    { key: 'team_alignment', label: 'Alinhamento', icon: '⚙️' },
    { key: 'execution_risk', label: 'Risco', icon: '⚠️' },
  ];

  const relevant = metrics.filter((m) => worldState[m.key] !== undefined);
  if (!relevant.length) return null;

  return (
    <div
      className="flex gap-3 flex-wrap px-4 py-3 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {relevant.map((m) => {
        const val = Math.round(Number(worldState[m.key]));
        const isRisk = m.key === 'execution_risk';
        const color = isRisk
          ? val > 60 ? '#f87171' : '#fbbf24'
          : val > 60 ? '#4ade80' : '#f87171';
        return (
          <div key={m.key} className="flex items-center gap-1.5 text-xs">
            <span>{m.icon}</span>
            <span style={{ color: 'rgba(251,207,232,0.55)' }}>{m.label}</span>
            <span className="font-bold tabular-nums" style={{ color }}>{val}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DecisionScene({ mission, worldState = {}, onDecide, deciding = false }) {
  const [selected, setSelected] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showRationale, setShowRationale] = useState(false);
  const [error, setError] = useState('');

  const choices = mission?.choices || [];
  const prompt = mission?.title || 'Qual é a sua decisão?';
  const objective = mission?.objective || '';

  async function handleConfirm() {
    if (!selected) return;
    setError('');
    try {
      await onDecide({
        choiceId: selected.id,
        responseText: responseText.trim() || undefined,
      });
    } catch (err) {
      setError(err?.message || 'Falha ao registrar decisão.');
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 30% 0%, rgba(236,72,153,0.12) 0%, transparent 45%), radial-gradient(ellipse at 70% 100%, rgba(168,85,247,0.1) 0%, transparent 45%), #090816',
      }}
    >
      {/* Atmosphere lines */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute inset-x-0"
          style={{
            top: `${20 + i * 25}%`,
            height: '1px',
            background: `linear-gradient(90deg, transparent, rgba(236,72,153,${0.04 + i * 0.02}), transparent)`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col max-w-2xl mx-auto w-full px-5 py-16 pb-8 gap-6">
        {/* Prompt */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col gap-3"
        >
          <div
            className="inline-flex self-center items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(236,72,153,0.12)',
              border: '1px solid rgba(236,72,153,0.25)',
              color: '#f9a8d4',
            }}
          >
            <AlertCircle size={11} />
            Momento de decisão
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black leading-tight"
            style={{ color: '#ffffff', letterSpacing: '-0.02em' }}
          >
            {prompt}
          </h2>
          {objective && (
            <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(251,207,232,0.55)' }}>
              {objective}
            </p>
          )}
        </motion.div>

        {/* World state mini */}
        <WorldStateMini worldState={worldState} />

        {/* Choices */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {choices.length > 0 ? choices.map((choice, i) => {
              const isSelected = selected?.id === choice.id;
              return (
                <GlowCard
                  key={choice.id || i}
                  glowColor={CHOICE_GLOW_COLORS[i % CHOICE_GLOW_COLORS.length]}
                  active={isSelected}
                  onClick={() => setSelected(choice)}
                  style={isSelected ? { background: CHOICE_GRADIENTS[i % CHOICE_GRADIENTS.length] } : {}}
                >
                  <motion.div
                    className="p-5 flex items-start gap-4"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                  >
                    {/* Choice letter */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{
                        background: isSelected
                          ? CHOICE_GRADIENTS[i % CHOICE_GRADIENTS.length]
                          : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? CHOICE_BORDER_ACTIVE[i % CHOICE_BORDER_ACTIVE.length] : 'rgba(255,255,255,0.1)'}`,
                        color: isSelected ? '#fff' : 'rgba(251,207,232,0.5)',
                        boxShadow: isSelected ? `0 0 16px ${CHOICE_BORDER_ACTIVE[i % CHOICE_BORDER_ACTIVE.length]}60` : 'none',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-sm leading-snug"
                        style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)' }}
                      >
                        {choice.label}
                      </div>
                      {(choice.impact || choice.consequence) && (
                        <div
                          className="text-xs mt-1.5 leading-snug"
                          style={{ color: 'rgba(251,207,232,0.45)' }}
                        >
                          {choice.impact || choice.consequence}
                        </div>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="shrink-0"
                      >
                        <CheckCircle size={20} className="text-pink-400" />
                      </motion.div>
                    )}
                  </motion.div>
                </GlowCard>
              );
            }) : (
              <div
                className="text-center py-8 text-sm"
                style={{ color: 'rgba(251,207,232,0.4)' }}
              >
                Carregando opções do backend…
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Optional rationale */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-2"
          >
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-medium"
              style={{ color: 'rgba(244,114,182,0.6)', background: 'none', padding: 0 }}
              onClick={() => setShowRationale((v) => !v)}
            >
              <MessageSquare size={13} />
              {showRationale ? 'Ocultar raciocínio' : 'Adicionar raciocínio (opcional)'}
            </button>
            {showRationale && (
              <motion.textarea
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Explique seu raciocínio, trade-off e condição de sucesso…"
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(236,72,153,0.2)',
                  color: 'rgba(255,255,255,0.8)',
                  minHeight: '80px',
                  outline: 'none',
                }}
                rows={3}
              />
            )}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        {/* CTA */}
        <motion.button
          type="button"
          disabled={!selected || deciding}
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base disabled:opacity-40"
          style={{
            background: selected ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'rgba(255,255,255,0.06)',
            color: selected ? '#fff' : 'rgba(251,207,232,0.4)',
            border: selected ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selected ? '0 8px 32px rgba(236,72,153,0.35)' : 'none',
          }}
          whileHover={selected ? { scale: 1.02 } : {}}
          whileTap={selected ? { scale: 0.97 } : {}}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {deciding ? 'Processando decisão…' : (
            <>
              Confirmar decisão
              <ChevronRight size={18} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
