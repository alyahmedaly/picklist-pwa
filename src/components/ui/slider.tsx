/**
 * Slider Component
 * Range input slider component
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<
  React.ElementRef<'input'>,
  SliderProps
>(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onValueChange([newValue]);
  };

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || min}
        onChange={handleChange}
        className={cn(
          'relative h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2',
          '[&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary',
          '[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none'
        )}
        {...props}
      />
    </div>
  );
});
Slider.displayName = 'Slider';

export { Slider };