import { motion } from 'framer-motion';
import { CheckCircle, Lock, Star, Zap } from 'lucide-react';

const STATUS_CONFIG = {
  locked: {
    bg: 'radial-gradient(circle at 35% 30%, rgba(38,30,62,0.95), rgba(17,13,30,0.98))',
    border: 'rgba(255,255,255,0.08)',
    glow: 'none',
    connector: 'rgba(255,255,255,0.1)',
    icon: Lock,
    iconColor: '#6b4f6b',
    labelColor: '#9d809d',
  },
  available: {
    bg: 'radial-gradient(circle at 35% 30%, rgba(248,126,195,0.92), rgba(182,66,255,0.92) 62%, rgba(73,22,108,0.98))',
    border: 'rgba(236,72,153,0.5)',
    glow: '0 0 28px rgba(236,72,153,0.3), 0 0 60px rgba(236,72,153,0.1)',
    connector: 'rgba(236,72,153,0.4)',
    icon: Star,
    iconColor: '#f472b6',
    labelColor: '#fce7f3',
  },
  active: {
    bg: 'radial-gradient(circle at 32% 26%, rgba(255,187,228,0.95), rgba(236,72,153,0.96) 52%, rgba(112,38,170,0.98))',
    border: 'rgba(236,72,153,0.8)',
    glow: '0 0 40px rgba(236,72,153,0.45), 0 0 80px rgba(168,85,247,0.2)',
    connector: 'rgba(236,72,153,0.6)',
    icon: Zap,
    iconColor: '#ec4899',
    labelColor: '#ffffff',
  },
  completed: {
    bg: 'radial-gradient(circle at 35% 28%, rgba(148,255,191,0.9), rgba(38,194,115,0.94) 60%, rgba(19,86,58,0.96))',
    border: 'rgba(34,197,94,0.4)',
    glow: '0 0 20px rgba(34,197,94,0.18)',
    connector: 'rgba(34,197,94,0.4)',
    icon: CheckCircle,
    iconColor: '#4ade80',
    labelColor: '#d1fae5',
  },
  reinforcement: {
    bg: 'radial-gradient(circle at 35% 30%, rgba(255,209,124,0.92), rgba(249,115,22,0.93) 56%, rgba(115,48,16,0.96))',
    border: 'rgba(249,115,22,0.55)',
    glow: '0 0 30px rgba(249,115,22,0.28)',
    connector: 'rgba(249,115,22,0.4)',
    icon: Star,
    iconColor: '#fb923c',
    labelColor: '#fed7aa',
  },
};

export default function JourneyNode({
  status = 'locked',
  title = '',
  subtitle = '',
  onClick,
  showConnectorTop = true,
  showConnectorBottom = true,
  index = 0,
}) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.locked;
  const Icon = cfg.icon;
  const isClickable = status !== 'locked' && !!onClick;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
    >
      {/* Top connector */}
      {showConnectorTop && (
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: `linear-gradient(180deg, transparent, ${cfg.connector})` }}
        />
      )}

      {/* Node */}
      <motion.button
        type="button"
        disabled={!isClickable}
        onClick={isClickable ? onClick : undefined}
        className="relative flex items-center justify-center w-24 h-24 rounded-full focus:outline-none"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          boxShadow: cfg.glow,
          cursor: isClickable ? 'pointer' : 'default',
        }}
        whileHover={isClickable ? { scale: 1.04 } : {}}
        whileTap={isClickable ? { scale: 0.97 } : {}}
        transition={{ duration: 0.18 }}
        aria-label={title}
      >
        {/* Active pulse ring */}
        {status === 'active' && (
          <motion.div
            className="absolute inset-[-6px] rounded-full"
            style={{ border: '1px solid rgba(236,72,153,0.6)' }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.03, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div
          className="flex items-center justify-center w-12 h-12 rounded-full"
          style={{
            background: 'rgba(9,8,22,0.25)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: 'inset 0 1px 6px rgba(255,255,255,0.12)',
          }}
        >
          <Icon size={20} style={{ color: cfg.iconColor }} />
        </div>

        {status === 'active' && (
          <motion.span
            className="absolute -right-2 -top-2 text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(236,72,153,0.9)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: '0 0 14px rgba(236,72,153,0.65)',
            }}
            animate={{ y: [0, -1.5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            ATIVO
          </motion.span>
        )}
      </motion.button>

      <div className="mt-2 flex flex-col items-center gap-0.5 max-w-44 text-center px-1">
        <span className="font-bold text-xs sm:text-sm leading-tight truncate w-full" style={{ color: cfg.labelColor }}>
          {title || 'Missão'}
        </span>
        {subtitle && (
          <span className="text-[11px] truncate w-full" style={{ color: cfg.labelColor, opacity: 0.62 }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Bottom connector */}
      {showConnectorBottom && (
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: `linear-gradient(180deg, ${cfg.connector}, transparent)` }}
        />
      )}
    </motion.div>
  );
}
