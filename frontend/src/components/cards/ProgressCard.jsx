import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import CardBase from './CardBase';
import { progressMotion } from '../../lib/motion/index.js';

/**
 * ProgressCard - Card com barra de progresso animada
 * Exibe status e micro animações estilo gamificado
 */
export const ProgressCard = React.forwardRef(
  (
    {
      className,
      title,
      description,
      progress = 0,
      status = 'iniciado', // 'iniciado', 'em-andamento', 'concluido'
      lessons = 0,
      completedLessons = 0,
      icon: Icon,
      onClick,
      ...props
    },
    ref
  ) => {
    const statusConfig = {
      iniciado: {
        badge: 'Não iniciado',
        color: 'warning',
        icon: <Clock className="w-4 h-4" />,
      },
      'em-andamento': {
        badge: 'Em andamento',
        color: 'primary',
        icon: <Clock className="w-4 h-4" />,
      },
      concluido: {
        badge: 'Concluído',
        color: 'success',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.iniciado;

    return (
      <CardBase
        ref={ref}
        className={className}
        variant="progress"
        motionRole={status === 'concluido' ? 'reward' : 'interactive'}
        icon={Icon}
        title={title}
        description={description}
        onClick={onClick}
        {...props}
      >
        {/* Progress section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-600 dark:text-muted-400">
              Progresso: {progress}%
            </span>
            <Badge variant={config.color} size="sm">
              {config.icon}
              {config.badge}
            </Badge>
          </div>

          {/* Progress bar com glow */}
          <div className="w-full h-3 rounded-full bg-muted-200 dark:bg-dark-700 overflow-hidden shadow-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/40"
              initial={progressMotion.fill.initial}
              animate={{ width: `${progress}%` }}
              transition={progressMotion.fill.transition}
            />
          </div>
        </div>

        {/* Lessons info */}
        {lessons > 0 && (
          <div className="text-xs text-muted-600 dark:text-muted-400 flex items-center gap-1">
            <motion.div animate={{ scale: [0.96, 1.04, 1] }} transition={{ duration: 0.5 }} className="inline-block">
              📚
            </motion.div>
            {completedLessons} de {lessons} aulas completadas
          </div>
        )}
      </CardBase>
    );
  }
);

ProgressCard.displayName = 'ProgressCard';

export default ProgressCard;
