import { AnimatePresence, motion } from 'framer-motion';
import JourneyNode from './JourneyNode.jsx';

function resolveNodeStatus(chapter, progressData) {
  if (!chapter) return 'locked';
  const completedIds = progressData?.completedChapterIds || [];
  const unlockedIds = progressData?.unlockedChapterIds || [];
  const activeId = progressData?.chapterId;

  if (completedIds.includes(chapter.id)) return 'completed';
  if (chapter.id === activeId) return 'active';
  if (unlockedIds.includes(chapter.id)) return 'available';
  return 'locked';
}

function resolveNodeOffset(index) {
  const pattern = [0, 88, -88, 62, -62, 36, -36];
  return pattern[index % pattern.length];
}

export default function JourneyMap({ chapters = [], progressData = null, onNodeClick }) {
  if (!chapters.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="text-sm px-4 py-2 rounded-full"
          style={{
            color: 'rgba(251,207,232,0.5)',
            background: 'rgba(236,72,153,0.08)',
            border: '1px solid rgba(236,72,153,0.15)',
          }}
        >
          Jornada em preparação pelo backend...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-2">
      <div
        className="mb-4 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{
          color: 'rgba(251,207,232,0.75)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        Toque no nó ATIVO para iniciar a missão
      </div>

      <AnimatePresence>
        {chapters.map((chapter, index) => {
          const status = resolveNodeStatus(chapter, progressData);
          const phases = chapter.phases || [];
          const subtitle = phases.length
            ? phases.map((p) => p.title || p.type).join(' · ')
            : chapter.description || '';
          const offset = resolveNodeOffset(index);

          return (
            <motion.div
              key={chapter.id}
              className="w-full flex justify-center"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: offset }}
              transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
            >
              <JourneyNode
                index={index}
                status={status}
                title={chapter.title}
                subtitle={subtitle}
                showConnectorTop={index > 0}
                showConnectorBottom={index < chapters.length - 1}
                onClick={status !== 'locked' ? () => onNodeClick?.(chapter) : undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* End of path marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: chapters.length * 0.08 + 0.3 }}
        className="mt-2 flex flex-col items-center gap-1.5"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(249,115,22,0.15))',
            border: '1px solid rgba(234,179,8,0.3)',
            boxShadow: '0 0 20px rgba(234,179,8,0.15)',
          }}
        >
          🏆
        </div>
        <span className="text-xs" style={{ color: 'rgba(251,207,232,0.4)' }}>Meta final</span>
      </motion.div>
    </div>
  );
}
