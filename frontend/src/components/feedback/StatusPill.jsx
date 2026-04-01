import React from 'react';
import { Badge } from '../ui/index.js';

/**
 * StatusPill - Componente para exibir status com variações automáticas
 * Mapeia valores para cores automaticamente
 */
const StatusPill = React.forwardRef(({ value, className, ...props }, ref) => {
  const normalized = String(value || 'unknown').toLowerCase();

  // Mapa de status para variantes de badge
  const statusMap = {
    // Status de jornada
    initiated: 'primary',
    ongoing: 'primary',
    completed: 'success',
    archived: 'muted',
    
    // Status de estrutura
    draft: 'muted',
    published: 'success',
    deprecated: 'destructive',
    
    // Visibilidade
    private: 'muted',
    public: 'success',
    
    // Estados genéricos
    active: 'success',
    inactive: 'muted',
    pending: 'warning',
    error: 'destructive',
    success: 'success',
    warning: 'warning',
  };

  const variant = statusMap[normalized] || 'muted';

  return (
    <Badge ref={ref} variant={variant} {...props}>
      {value || 'Unknown'}
    </Badge>
  );
});

StatusPill.displayName = 'StatusPill';

export default StatusPill;
