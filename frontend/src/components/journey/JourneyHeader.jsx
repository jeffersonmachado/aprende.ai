import { Badge } from '../ui/index.js';
import { cn } from '../../lib/cn.js';

export default function JourneyHeader({ compact, level, xpTotal, streak }) {
  return (
    <header className={cn('mb-4 flex flex-wrap items-center justify-between gap-3 journey-engine-header', compact && 'mb-3')}>
      <div className="journey-engine-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">Mapa da Jornada</p>
        <h3 className="text-lg font-semibold text-white">Sua campanha ativa</h3>
        <p className="journey-engine-subtitle">Uma trilha viva de contexto, escolha, reviravolta e fechamento com consequencia.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="level">Nivel {level}</Badge>
        <Badge variant="xp">XP {xpTotal}</Badge>
        <Badge variant="streak">Streak {streak} dias</Badge>
      </div>
    </header>
  );
}
