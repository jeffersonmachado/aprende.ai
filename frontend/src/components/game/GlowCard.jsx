import { motion } from 'framer-motion';

const GLOW_VARIANTS = {
  pink: {
    border: 'rgba(236,72,153,0.35)',
    shadow: '0 0 40px rgba(236,72,153,0.18), 0 24px 48px rgba(9,4,26,0.55)',
    activeBorder: 'rgba(236,72,153,0.7)',
    activeShadow: '0 0 60px rgba(236,72,153,0.35), 0 24px 48px rgba(9,4,26,0.6)',
  },
  purple: {
    border: 'rgba(168,85,247,0.35)',
    shadow: '0 0 40px rgba(168,85,247,0.18), 0 24px 48px rgba(9,4,26,0.55)',
    activeBorder: 'rgba(168,85,247,0.7)',
    activeShadow: '0 0 60px rgba(168,85,247,0.35), 0 24px 48px rgba(9,4,26,0.6)',
  },
  orange: {
    border: 'rgba(249,115,22,0.35)',
    shadow: '0 0 40px rgba(249,115,22,0.18), 0 24px 48px rgba(9,4,26,0.55)',
    activeBorder: 'rgba(249,115,22,0.7)',
    activeShadow: '0 0 60px rgba(249,115,22,0.35), 0 24px 48px rgba(9,4,26,0.6)',
  },
  cyan: {
    border: 'rgba(6,182,212,0.35)',
    shadow: '0 0 40px rgba(6,182,212,0.18), 0 24px 48px rgba(9,4,26,0.55)',
    activeBorder: 'rgba(6,182,212,0.7)',
    activeShadow: '0 0 60px rgba(6,182,212,0.35), 0 24px 48px rgba(9,4,26,0.6)',
  },
  red: {
    border: 'rgba(239,68,68,0.4)',
    shadow: '0 0 50px rgba(239,68,68,0.22), 0 24px 48px rgba(9,4,26,0.55)',
    activeBorder: 'rgba(239,68,68,0.8)',
    activeShadow: '0 0 80px rgba(239,68,68,0.4), 0 24px 48px rgba(9,4,26,0.6)',
  },
};

export default function GlowCard({
  children,
  className = '',
  glowColor = 'pink',
  onClick,
  active = false,
  style = {},
  as = 'div',
}) {
  const glow = GLOW_VARIANTS[glowColor] || GLOW_VARIANTS.pink;
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={`relative rounded-2xl overflow-hidden backdrop-blur-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(22,14,48,0.88) 0%, rgba(12,8,30,0.92) 100%)',
        border: `1px solid ${active ? glow.activeBorder : glow.border}`,
        boxShadow: active ? glow.activeShadow : glow.shadow,
        ...style,
      }}
      whileHover={onClick ? { scale: 1.02, transition: { duration: 0.18 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
