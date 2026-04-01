import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { cardMotion, entryPresets, microInteraction, motionSprings } from '../../lib/motion/index.js';

/**
 * CardBase - Componente card reutilizável com animações
 * Suporta ícone, título, descrição, ações, variações e interações
 */
const CardBase = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      icon: Icon,
      title,
      description,
      footer,
      actions,
      onClick,
      disabled = false,
      highlight = false,
      motionRole = 'static',
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        'bg-white border border-muted-200 dark:bg-dark-800 dark:border-dark-700',
      highlight:
        'bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 dark:from-primary-900/20 dark:to-primary-800/10 dark:border-primary-800',
      progress:
        'bg-gradient-to-r from-secondary-50 to-primary-50 border border-secondary-200 dark:from-secondary-900/20 dark:to-primary-900/20 dark:border-secondary-800',
    };

    const hoverClass = onClick && !disabled ? 'cursor-pointer' : '';
    const resolvedRole = onClick && !disabled ? (motionRole === 'static' ? 'interactive' : motionRole) : 'static';
    const resolvedMotion = cardMotion[resolvedRole] || cardMotion.static;

    const containerVariants = {
      rest: { scale: 1 },
      hover: resolvedMotion.whileHover || {},
      tap: resolvedMotion.whileTap || {},
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl p-4 transition-all duration-300',
          variants[variant],
          hoverClass,
          disabled && 'opacity-60 cursor-not-allowed',
          'hover:shadow-xl dark:hover:shadow-primary-900/20',
          'hover:border-primary-300 dark:hover:border-primary-700',
          className
        )}
        onClick={onClick}
        initial={entryPresets.fadeUp.initial}
        animate={entryPresets.fadeUp.animate}
        exit={entryPresets.fadeUp.exit}
        transition={entryPresets.fadeUp.transition}
        variants={containerVariants}
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {/* Header com ícone e título */}
        {(Icon || title) && (
          <div className="flex items-start gap-3 mb-3">
            {Icon && (
              <motion.div 
                className="flex-shrink-0 p-2 rounded-lg bg-primary-100/50 dark:bg-primary-900/30"
                whileHover={{ scale: 1.06, rotate: 3 }}
                whileTap={microInteraction.buttonTap}
                transition={motionSprings.gentle}
              >
                <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </motion.div>
            )}
            {title && (
              <div className="flex-1">
                <h3 className="font-semibold text-muted-900 dark:text-muted-50">
                  {title}
                </h3>
              </div>
            )}
            {highlight && (
              <motion.div
                className="flex-shrink-0 px-2 py-1 rounded-full bg-primary-600 text-xs font-medium text-white"
                animate={microInteraction.rewardPop}
                transition={{ duration: 0.5 }}
              >
                Destaque
              </motion.div>
            )}
          </div>
        )}

        {/* Descrição */}
        {description && (
          <p className="text-sm text-muted-600 dark:text-muted-400 mb-4">
            {description}
          </p>
        )}

        {/* Conteúdo */}
        {children && <div className="mb-4">{children}</div>}

        {/* Footer */}
        {footer && <div className="mb-3">{footer}</div>}

        {/* Ações */}
        {actions && (
          <div className="flex gap-2 pt-3 border-t border-muted-200 dark:border-dark-700">
            {Array.isArray(actions) ? (
              actions.map((action, idx) => (
                <div key={idx}>{action}</div>
              ))
            ) : (
              <div>{actions}</div>
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

CardBase.displayName = 'CardBase';

export default CardBase;
