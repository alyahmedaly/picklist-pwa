/**
 * Dropdown Menu Component
 * Based on Radix UI Dropdown Menu primitive
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

const DropdownMenu = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('relative inline-block text-left', className)} {...props} />
));
DropdownMenu.displayName = 'DropdownMenu';

interface DropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<'button'>,
  DropdownMenuTriggerProps
>(({ className, children, asChild = false, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: cn((children.props as any).className, className),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & {
    align?: 'start' | 'center' | 'end';
  }
>(({ className, align = 'center', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      align === 'end' && 'right-0',
      align === 'start' && 'left-0',
      align === 'center' && 'left-1/2 -translate-x-1/2',
      'top-full mt-1',
      className
    )}
    {...props}
  />
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};