import React from 'react';
import { cn } from '../../lib/cn';

const Label = React.forwardRef(
  ({ className, htmlFor, required = false, children, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive-500">*</span>}
    </label>
  )
);

Label.displayName = 'Label';

export default Label;
