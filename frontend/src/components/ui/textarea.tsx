import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-lg px-3 py-2 text-sm text-white/90',
      'placeholder-white/25 outline-none transition-all duration-200 resize-none',
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
));
Textarea.displayName = 'Textarea';

export { Textarea };
