import React from 'react';
import Label from './Label';
import Input from './Input';
import { cn } from '../../lib/cn';

/**
 * FormField - Componente que encapsula Input com Label e validação
 */
const FormField = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      ...inputProps
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <Label required={required} htmlFor={inputProps.id}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          disabled={disabled}
          error={!!error}
          {...inputProps}
        />
        {error && (
          <p className="state-field-message-error mt-2 text-sm text-destructive-600 dark:text-destructive-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="state-field-message-helper mt-2 text-sm text-muted-500 dark:text-muted-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
