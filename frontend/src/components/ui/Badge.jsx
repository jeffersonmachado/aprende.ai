import React from 'react';
import { cn } from '../../lib/cn';

const Badge = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    destructive: 'badge-destructive',
    xp: 'badge-xp',
    streak: 'badge-streak',
    level: 'badge-level',
    achieved: 'badge-achieved',
    locked: 'badge-locked',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
