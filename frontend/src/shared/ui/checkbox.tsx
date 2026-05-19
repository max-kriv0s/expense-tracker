'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          ref={ref}
          id={id}
          className={cn(
            'h-4 w-4 shrink-0 rounded border border-input accent-foreground cursor-pointer',
            className,
          )}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm leading-snug cursor-pointer [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80">
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
