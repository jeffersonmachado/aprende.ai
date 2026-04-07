import { motion } from 'framer-motion';
import { Map, RefreshCw, Sparkles, Trophy, Zap } from 'lucide-react';
import { useMemo } from 'react';
import JourneyMap from '../../../components/game/JourneyMap.jsx';

const BG_STARS = Array.from({ length: 30 }, (_, i) => ({
  left: `${3 + (i * 3.3) % 94}%`,
  top: `${5 + (i * 6.1) % 90}%`,
  size: 1 + (i % 4) * 1.1,
  opacity: 0.1 + (i % 7) * 0.06,
  delay: (i % 9) * 0.35,
}));

function StarBg() {
  return (
    <div className="pointer-events-none fixed inset-0">
      {BG_STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}
          animate={{ opacity: [s.opacity, s.opacity * 3, s.opacity] }}
          transition={{ duration: 3 + (i % 5), delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function buildMapProgress(runtime) {
  const journey = runtime?.journey;
  const progress = journey?.campaignProgress || {};
  return {
    chapterId: progress.chapterId || null,
    unlockedChapterIds: progress.unlockedChapterIds || [],
    completedChapterIds: progress.completedChapterIds || [],
    progressPercent: Number(journey?.progressPercent || 0),
    level: Number(journey?.level || 1),
    xp: Number(journey?.xp || 0),
    streak: Number(journey?.streak || 0),
  };
}

export default function JourneyMapScene({ runtime, onSelectChapter, onRefresh, refreshing = false }) {
  const chapters = useMemo(() => runtime?.campaign?.chapters || [], [runtime]);
  const progressData = useMemo(() => buildMapProgress(runtime), [runtime]);
  const { progressPercent, level, xp, streak } = progressData;
  const missionTitle = runtime?.mission?.title || runtime?.campaign?.title || 'Jornada adaptativa';

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 0%, rgba(236,72,153,0.14) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(168,85,247,0.12) 0%, transparent 50%), #090816',
      }}
    >
      <StarBg />

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-4 pt-16"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Map size={16} className="text-pink-400" />
            <span className="text-sm font-bold" style={{ color: '#fce7f3' }}>Mapa da jornada</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(251,207,232,0.45)' }}>{missionTitle}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2.5">
          {streak > 0 && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.3)',
                color: '#fed7aa',
              }}
            >
              🔥 {streak}
            </div>
          )}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(236,72,153,0.15)',
              border: '1px solid rgba(236,72,153,0.3)',
              color: '#f9a8d4',
            }}
          >
            <Zap size={10} />
            Nv {level}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(251,207,232,0.5)',
            }}
            aria-label="Atualizar jornada"
          >
            <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={14} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-5 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'rgba(251,207,232,0.5)' }}>
          <span className="flex items-center gap-1">
            <Sparkles size={10} className="text-pink-400" />
            Progresso geral
          </span>
          <span className="font-bold" style={{ color: '#f9a8d4' }}>{progressPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      {/* Map */}
      <div className="relative z-10 flex-1 px-4 pt-2 pb-5 flex items-center justify-center">
        {chapters.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(236,72,153,0.1)',
                border: '1px solid rgba(236,72,153,0.2)',
              }}
            >
              <Trophy size={28} className="text-pink-400" />
            </div>
            <div className="text-center">
              <p className="font-bold" style={{ color: '#fce7f3' }}>Jornada sendo montada</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(251,207,232,0.5)' }}>
                A IA está preparando os capítulos para você.
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(236,72,153,0.3)',
              }}
            >
              Verificar novamente
            </button>
          </motion.div>
        ) : (
          <div className="w-full max-w-5xl">
            <JourneyMap
              chapters={chapters}
              progressData={progressData}
              onNodeClick={onSelectChapter}
            />
          </div>
        )}
      </div>

      {/* Bottom legend */}
      <div
        className="relative z-10 px-5 py-4 flex items-center justify-center gap-6 flex-wrap"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {[
          { color: '#ec4899', label: 'Disponível' },
          { color: '#4ade80', label: 'Concluído' },
          { color: '#fb923c', label: 'Reforço IA' },
          { color: 'rgba(255,255,255,0.15)', label: 'Bloqueado' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: item.color, boxShadow: item.color !== 'rgba(255,255,255,0.15)' ? `0 0 8px ${item.color}` : 'none' }}
            />
            <span className="text-xs" style={{ color: 'rgba(251,207,232,0.4)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
