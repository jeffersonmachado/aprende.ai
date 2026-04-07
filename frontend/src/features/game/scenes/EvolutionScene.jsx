import { motion } from 'framer-motion';
import { ArrowRight, Compass, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import GlowCard from '../../../components/game/GlowCard.jsx';

function XPBar({ xp, maxXp, leveledUp }) {
  const pct = Math.min(100, Math.round((xp / Math.max(maxXp, 1)) * 100));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-pink-400" />
          <span style={{ color: 'rgba(251,207,232,0.65)' }}>Experiência</span>
        </div>
        <div className="flex items-center gap-2">
          {leveledUp && (
            <motion.span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(234,179,8,0.2)', color: '#fef08a', border: '1px solid rgba(234,179,8,0.3)' }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.6 }}
            >
              NÍVEL ACIMA! 🌟
            </motion.span>
          )}
          <span className="font-bold tabular-nums" style={{ color: '#f9a8d4' }}>{xp}/{maxXp}</span>
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.2, delay: 1.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function EvolutionScene({ progression, rewards, onContinue }) {
  const xp = Number(rewards?.xpAwarded || progression?.xpGained || 0);
  const totalXp = Number(progression?.totalXp || 100);
  const maxXp = Number(progression?.xpToNextLevel || 200);
  const level = Number(progression?.level || 1);
  const leveledUp = Boolean(progression?.leveledUp);
  const nextFocus = progression?.nextFocus || progression?.recommendation || '';
  const badges = rewards?.badges || rewards?.badgeSummary || [];
  const unlock = progression?.nextUnlock || progression?.unlocks?.[0] || null;
  const adaptiveNote = progression?.adaptiveNote || progression?.aiNote || '';

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% -5%, rgba(236,72,153,0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 110%, rgba(168,85,247,0.12) 0%, transparent 45%), #090816',
      }}
    >
      {/* Celebration particles */}
      {leveledUp && (
        <>
          {Array.from({ length: 16 }, (_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${10 + (i * 5.5) % 80}%`,
                top: '10%',
                background: i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#8b5cf6' : '#f97316',
              }}
              animate={{ y: [0, 100 + (i % 5) * 30, 200], opacity: [0.9, 0.5, 0], rotate: [0, (i % 2 === 0 ? 360 : -360)] }}
              transition={{ duration: 1.5 + (i % 4) * 0.2, delay: 0.2 + (i % 6) * 0.1 }}
            />
          ))}
        </>
      )}

      <div className="relative z-10 flex flex-col max-w-2xl mx-auto w-full px-5 py-16 pb-8 gap-6">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center gap-3"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
        >
          {/* Level badge */}
          <motion.div
            className="flex items-center justify-center w-20 h-20 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.2))',
              border: '2px solid rgba(236,72,153,0.5)',
              boxShadow: '0 0 60px rgba(236,72,153,0.3)',
            }}
            animate={leveledUp ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col items-center">
              <Star size={22} className="text-pink-400 mb-0.5" />
              <span className="font-black text-xl" style={{ color: '#fff', letterSpacing: '-0.04em' }}>{level}</span>
            </div>
          </motion.div>

          <div>
            <h2 className="text-3xl font-black" style={{ color: '#fff', letterSpacing: '-0.03em' }}>
              {leveledUp ? '🌟 Subiu de nível!' : 'Evolução registrada'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(251,207,232,0.5)' }}>
              {leveledUp ? `Agora você está no nível ${level}` : `Nível ${level} · continuando na jornada`}
            </p>
          </div>
        </motion.div>

        {/* XP Bar */}
        <GlowCard glowColor="pink">
          <div className="p-6">
            <XPBar xp={xp > 0 ? xp : totalXp} maxXp={maxXp} leveledUp={leveledUp} />
            {xp > 0 && (
              <motion.p
                className="text-center text-xs mt-3 font-bold"
                style={{ color: '#f9a8d4' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                +{xp} XP conquistados nesta fase
              </motion.p>
            )}
          </div>
        </GlowCard>

        {/* Badges */}
        {Array.isArray(badges) && badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {badges.slice(0, 4).map((badge, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(249,115,22,0.14))',
                    border: '1px solid rgba(234,179,8,0.35)',
                    color: '#fef08a',
                    boxShadow: '0 0 20px rgba(234,179,8,0.15)',
                  }}
                  initial={{ opacity: 0, scale: 0, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.12, type: 'spring' }}
                >
                  🏅 {typeof badge === 'string' ? badge : badge.label || badge.name || badge.code || 'Badge'}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next focus (AI recommendation) */}
        {nextFocus && (
          <GlowCard glowColor="purple">
            <motion.div
              className="p-5 flex items-start gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(168,85,247,0.18)',
                  border: '1px solid rgba(168,85,247,0.3)',
                }}
              >
                <Compass size={18} className="text-purple-400" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(196,181,253,0.6)' }}>
                  Próximo foco
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {nextFocus}
                </p>
              </div>
            </motion.div>
          </GlowCard>
        )}

        {/* IA note */}
        {adaptiveNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="flex items-start gap-3"
          >
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.3), rgba(168,85,247,0.2))',
                border: '1px solid rgba(236,72,153,0.3)',
              }}
            >
              🧠
            </div>
            <div
              className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed italic"
              style={{
                background: 'rgba(236,72,153,0.07)',
                border: '1px solid rgba(236,72,153,0.18)',
                color: 'rgba(251,207,232,0.7)',
              }}
            >
              "{adaptiveNote}"
            </div>
          </motion.div>
        )}

        {/* Unlock */}
        {unlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.14), rgba(56,189,248,0.1))',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            <Sparkles size={16} className="text-cyan-400" />
            <div>
              <div className="text-xs font-bold" style={{ color: '#67e8f9' }}>Desbloqueado</div>
              <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {typeof unlock === 'string' ? unlock : unlock.title || unlock.label || unlock.name || 'Novo conteúdo'}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.button
          type="button"
          onClick={onContinue}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base mt-2"
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(236,72,153,0.35)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <TrendingUp size={18} />
          Continuar jornada
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
