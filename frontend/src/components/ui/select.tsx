import * as React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-lg px-3 py-2 text-sm text-white/80',
      'outline-none transition-all duration-200 cursor-pointer',
      'focus:ring-1 focus:ring-white/20 focus:border-white/25',
      'disabled:cursor-not-allowed disabled:opacity-40',
      className
    )}
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export { Select };
