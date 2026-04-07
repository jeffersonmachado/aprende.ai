import { motion } from 'framer-motion';
import { ArrowRight, Award, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import CompetencyRadar from '../../../components/game/CompetencyRadar.jsx';
import GlowCard from '../../../components/game/GlowCard.jsx';
import { getJourneyEngineCompetencies } from '../../../services/journeyEngineApi.js';

function CompetencyBar({ label, value, delay = 0 }) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(value))));
  const color = pct >= 75 ? '#4ade80' : pct >= 50 ? '#f472b6' : '#fbbf24';

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'rgba(251,207,232,0.8)' }}>{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #ec4899, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: delay + 0.15 }}
        />
      </div>
    </motion.div>
  );
}

function buildCompetenciesFromRuntime(engineRuntime) {
  const dashboard = engineRuntime?.competencyDashboard;
  if (Array.isArray(dashboard)) return dashboard;
  if (dashboard?.competencies) return dashboard.competencies;
  return [];
}

export default function EvaluationScene({ engineRuntime, onContinue }) {
  const [competencies, setCompetencies] = useState(() => buildCompetenciesFromRuntime(engineRuntime));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const built = buildCompetenciesFromRuntime(engineRuntime);
    if (built.length) {
      setCompetencies(built);
      return;
    }
    // Fetch from backend if not in runtime
    setLoading(true);
    getJourneyEngineCompetencies()
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : data?.competencies || data?.items || [];
        setCompetencies(items);
      })
      .catch(() => {
        // Non-critical: keep empty state
      })
      .finally(() => setLoading(false));
  }, [engineRuntime]);

  const topCompetency = [...competencies]
    .sort((a, b) => Number(b.value ?? b.score ?? 0) - Number(a.value ?? a.score ?? 0))[0];

  const normalised = competencies.map((c) => ({
    name: c.name || c.label || c.competencyId || c.code || 'Competência',
    value: Number(c.value ?? c.score ?? c.metrics?.mastery ?? 0),
    score: Number(c.value ?? c.score ?? c.metrics?.mastery ?? 0),
  }));

  const barsToShow = normalised.slice(0, 5);
  const radarData = normalised.slice(0, 6);

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.14) 0%, transparent 55%), #090816',
      }}
    >
      <div className="relative z-10 flex flex-col max-w-2xl mx-auto w-full px-5 py-16 pb-8 gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold self-start"
            style={{
              background: 'rgba(168,85,247,0.14)',
              border: '1px solid rgba(168,85,247,0.3)',
              color: '#c4b5fd',
            }}
          >
            <Award size={11} />
            Avaliação de competências
          </div>
          <h2 className="text-3xl font-black" style={{ color: '#fff', letterSpacing: '-0.03em' }}>
            Seu perfil de competências
          </h2>
          {topCompetency && (
            <p className="text-sm" style={{ color: 'rgba(251,207,232,0.55)' }}>
              Destaque em{' '}
              <span style={{ color: '#c4b5fd' }}>
                {topCompetency.name || topCompetency.label || topCompetency.competencyId || 'competência'}
              </span>
            </p>
          )}
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-pink-500/50 border-t-pink-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {!loading && radarData.length >= 3 && (
          <GlowCard glowColor="purple">
            <div className="p-6 flex flex-col items-center gap-4">
              <CompetencyRadar competencies={radarData} size={200} />
            </div>
          </GlowCard>
        )}

        {!loading && barsToShow.length > 0 && (
          <GlowCard glowColor="pink">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-pink-400" />
                <span className="text-sm font-bold" style={{ color: 'rgba(244,114,182,0.8)' }}>
                  Scores por competência
                </span>
              </div>
              {barsToShow.map((c, i) => (
                <CompetencyBar key={c.name || i} label={c.name} value={c.value} delay={0.2 + i * 0.1} />
              ))}
            </div>
          </GlowCard>
        )}

        {!loading && competencies.length === 0 && (
          <GlowCard glowColor="purple">
            <div className="p-6 text-center text-sm" style={{ color: 'rgba(251,207,232,0.5)' }}>
              As competências serão atualizadas após mais decisões na jornada.
            </div>
          </GlowCard>
        )}

        {/* Continue */}
        <motion.button
          type="button"
          onClick={onContinue}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Ver evolução
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
