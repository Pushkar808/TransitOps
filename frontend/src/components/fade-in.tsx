'use client';

import * as React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;       // ms before fade starts
  duration?: number;    // ms for the fade transition
  className?: string;
}

/**
 * Wrapper that starts at opacity 0 and fades to opacity 1 after `delay` ms.
 */
export function FadeIn({ children, delay = 0, duration = 1000, className = '' }: FadeInProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
