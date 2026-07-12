import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/25',
        'outline-none transition-all duration-200',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus:ring-1 focus:ring-white/20 focus:border-white/25',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
