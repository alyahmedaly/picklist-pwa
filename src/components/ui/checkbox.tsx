/**
 * Checkbox Component
 * Checkbox input component
 */

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<'input'>,
  CheckboxProps
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(event.target.checked);
  };

  return (
    <div className="relative">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={handleChange}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'appearance-none cursor-pointer',
          className
        )}
        {...props}
      />
      <div className={cn(
        'absolute inset-0 flex items-center justify-center text-current',
        'pointer-events-none opacity-0 peer-checked:opacity-100'
      )}>
        <Check className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className={cn(
        'absolute inset-0 rounded-sm bg-primary opacity-0 peer-checked:opacity-100',
        'pointer-events-none'
      )} />
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };