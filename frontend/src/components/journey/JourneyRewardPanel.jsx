import { AnimatePresence, motion } from 'framer-motion';
import { Gem } from 'lucide-react';
import { rewardBurst } from '../../lib/motion/index.js';
import { rarityClass } from './journeyEngine.utils.js';

export default function JourneyRewardPanel({ selectedReward, unlocked = [] }) {
  const rarity = selectedReward?.rarity || 'common';

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-4 shadow-xl ${rarityClass(rarity)}`}
      initial={rewardBurst.container.initial}
      animate={rewardBurst.container.animate}
      exit={rewardBurst.container.exit}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">Reward Box</p>
        <Gem className="h-5 w-5 text-amber-600" />
      </div>

      <p className="mt-1 text-sm font-semibold text-muted-800">
        {selectedReward?.title || 'Nova recompensa pronta para desbloqueio.'}
      </p>
      <p className="text-xs text-muted-600">
        {selectedReward
          ? `${selectedReward.description || 'Recompensa conectada ao gameEngine.'} (${selectedReward.claimed ? 'claimed' : selectedReward.unlockedAt ? 'unlocked' : 'locked'})`
          : 'Concluir etapas ativa desbloqueios reais de progressao, nao apenas visual.'}
      </p>

      <AnimatePresence>
        {unlocked.length > 0 && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={rewardBurst.container.initial}
            animate={rewardBurst.container.animate}
            exit={rewardBurst.container.exit}
          >
            {[...Array(8)].map((_, index) => (
              <motion.span
                key={index}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-amber-300"
                style={{ transform: `rotate(${index * 45}deg) translateY(-24px)` }}
                variants={rewardBurst.sparkle}
                initial="initial"
                animate="animate"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {unlocked.length > 0 ? (
        <p className="mt-2 text-xs font-semibold text-rose-700">Desbloqueado: {unlocked.join(', ')}</p>
      ) : null}
      {selectedReward?.rarity ? (
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-700">Raridade: {selectedReward.rarity}</p>
      ) : null}
    </motion.div>
  );
}
