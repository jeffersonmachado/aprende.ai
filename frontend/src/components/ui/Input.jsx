import React from 'react';
import { cn } from '../../lib/cn';

const Input = React.forwardRef(
  (
    {
      className,
      type = 'text',
      placeholder,
      disabled = false,
      error = false,
      icon: Icon,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const isTextarea = type === 'textarea';

    const baseStyles =
      'state-field-shell w-full px-4 py-2 rounded-lg border border-muted-300 bg-white text-muted-900 placeholder:text-muted-400 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-muted-100 disabled:text-muted-500 disabled:cursor-not-allowed dark:bg-dark-800 dark:border-dark-600 dark:text-muted-50 dark:placeholder:text-muted-600 dark:focus:ring-primary-900/30';

    const errorStyles = error
      ? 'state-field-error border-destructive-500 focus:border-destructive-500 focus:ring-destructive-100 dark:focus:ring-destructive-900/30'
      : '';

    const sharedProps = {
      ref,
      placeholder,
      disabled,
      className: cn(baseStyles, errorStyles, Icon && !isTextarea && 'pl-10', disabled && 'state-field-disabled', className),
      onChange: (e) => {
        props.onChange?.(e);
        onValueChange?.(e.target.value);
      },
      ...props,
    };

    return (
      <div className="relative w-full">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-400 dark:text-muted-600 pointer-events-none" />
        )}
        {isTextarea ? (
          <textarea {...sharedProps} />
        ) : (
          <input
            type={type}
            {...sharedProps}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
