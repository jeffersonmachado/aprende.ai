import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { floatingXP } from '../../lib/motion/index.js';

export default function JourneyFloatingXp({ xp }) {
  return (
    <AnimatePresence>
      {xp > 0 && (
        <motion.div
          key={xp}
          className="pointer-events-none fixed right-8 top-20 z-50 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-2xl"
          initial={floatingXP.initial}
          animate={floatingXP.animate}
          exit={floatingXP.exit}
        >
          +{xp} XP
          <Flame className="ml-1 inline-block h-4 w-4" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
