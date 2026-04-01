import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { modalPresets } from '../../lib/motion/index.js';

/**
 * Modal - Componente de diálogo modal
 * Com animações suaves
 */
const Modal = React.forwardRef(
  (
    {
      isOpen = false,
      onClose,
      title,
      description,
      children,
      actions,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={modalPresets.backdrop.initial}
              animate={modalPresets.backdrop.animate}
              exit={modalPresets.backdrop.exit}
              transition={modalPresets.backdrop.transition}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              ref={ref}
              initial={modalPresets.panel.initial}
              animate={modalPresets.panel.animate}
              exit={modalPresets.panel.exit}
              transition={modalPresets.panel.transition}
              className={cn(
                'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
                'w-full mx-4',
                sizes[size],
                className
              )}
              {...props}
            >
              <div className="rounded-xl bg-white dark:bg-dark-900 shadow-xl overflow-hidden">
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between p-6 border-b border-muted-200 dark:border-dark-700">
                    <div>
                      <h2 className="text-lg font-semibold text-muted-900 dark:text-white">
                        {title}
                      </h2>
                      {description && (
                        <p className="text-sm text-muted-600 dark:text-muted-400 mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-dark-800 transition-colors"
                      aria-label="Fechar modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer with actions */}
                {actions && (
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-muted-200 dark:border-dark-700">
                    {Array.isArray(actions) ? (
                      actions.map((action, idx) => (
                        <div key={idx}>{action}</div>
                      ))
                    ) : (
                      <div>{actions}</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
