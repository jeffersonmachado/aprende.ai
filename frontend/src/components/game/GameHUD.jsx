import { motion } from 'framer-motion';
import { Flame, Star, Zap } from 'lucide-react';

export default function GameHUD({ level = 1, xp = 0, maxXp = 100, streak = 0, sceneLabel = '' }) {
  const xpPct = Math.min(100, Math.round((xp / Math.max(maxXp, 1)) * 100));

  return (
    <div className="fixed top-2 inset-x-0 z-50 px-3 pointer-events-none">
      <div
        className="mx-auto max-w-5xl h-12 px-3 sm:px-4 rounded-2xl border flex items-center gap-3 pointer-events-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15,12,32,0.9), rgba(11,9,26,0.86))',
          borderColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 12px 34px rgba(4,3,14,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        {/* Level badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.26), rgba(168,85,247,0.2))',
            border: '1px solid rgba(236,72,153,0.38)',
            color: '#fce7f3',
          }}
        >
          <Star size={10} className="text-pink-400" />
          <span>Nv {level}</span>
        </div>

        {/* XP bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Zap size={12} className="text-pink-400 shrink-0" />
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.09)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[11px] text-pink-200/70 shrink-0 tabular-nums">{xp}/{maxXp}</span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0"
            style={{
              background: 'rgba(249,115,22,0.2)',
              border: '1px solid rgba(249,115,22,0.35)',
              color: '#fed7aa',
            }}
          >
            <Flame size={10} className="text-orange-400" />
            <span>{streak}</span>
          </div>
        )}

        {/* Scene label */}
        {sceneLabel && (
          <span className="text-[11px] text-pink-200/55 hidden md:block shrink-0">{sceneLabel}</span>
        )}
      </div>
    </div>
  );
}
