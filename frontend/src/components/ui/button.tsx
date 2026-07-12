import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black hover:bg-white/90 active:scale-[0.98]',
        destructive:
          'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25',
        outline:
          'border border-white/12 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
        secondary:
          'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white',
        ghost:
          'text-white/50 hover:bg-white/8 hover:text-white/85',
        link: 'text-white/70 underline-offset-4 hover:underline hover:text-white',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, onClick, disabled, ...props }, ref) => {
    const [isPending, setIsPending] = React.useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isPending) {
        e.preventDefault();
        return;
      }
      
      // Defer disabling the button so the browser can fire the native submit event
      setTimeout(() => setIsPending(true), 0);
      
      try {
        if (onClick) {
          await Promise.resolve(onClick(e));
        }
      } finally {
        setTimeout(() => {
          setIsPending(false);
        }, 500);
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isPending}
        onClick={handleClick}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
