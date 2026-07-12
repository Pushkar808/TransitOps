import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-[11px] font-semibold uppercase tracking-wide leading-none',
      className
    )}
    style={{ color: 'rgba(255,255,255,0.45)' }}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
