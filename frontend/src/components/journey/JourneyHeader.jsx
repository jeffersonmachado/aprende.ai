import { Badge } from '../ui/index.js';
import { cn } from '../../lib/cn.js';

export default function JourneyHeader({ compact, level, xpTotal, streak }) {
  return (
    <header className={cn('mb-4 flex flex-wrap items-center justify-between gap-3', compact && 'mb-3')}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Journey Engine</p>
        <h3 className="text-lg font-semibold text-muted-900">Progressao cognitiva com mentor IA</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="level">Nivel {level}</Badge>
        <Badge variant="xp">XP {xpTotal}</Badge>
        <Badge variant="streak">Streak {streak} dias</Badge>
      </div>
    </header>
  );
}
