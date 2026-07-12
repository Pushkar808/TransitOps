'use client';

import * as React from 'react';

interface AnimatedHeadingProps {
  text: string;           // Use literal \n for line breaks
  className?: string;
  style?: React.CSSProperties;
  initialDelay?: number;  // ms before animation begins
  charDelay?: number;     // ms stagger between characters
}

/**
 * Splits text by newline into lines, then animates each character
 * individually with staggered opacity + translateX transitions.
 */
export function AnimatedHeading({
  text,
  className = '',
  style,
  initialDelay = 200,
  charDelay = 30,
}: AnimatedHeadingProps) {
  const [animated, setAnimated] = React.useState(false);
  const lines = text.split('\n');

  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), initialDelay);
    return () => clearTimeout(t);
  }, [initialDelay]);

  // Pre-compute offsets for per-character delays
  const lineLengths = lines.map((l) => l.length);

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split('').map((char, charIndex) => {
            const offset =
              lineLengths
                .slice(0, lineIndex)
                .reduce((acc, len) => acc + len * charDelay, 0) +
              charIndex * charDelay;

            return (
              <span
                key={charIndex}
                style={{
                  display: 'inline-block',
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'translateX(0)' : 'translateX(-18px)',
                  transition: `opacity 500ms ease ${offset}ms, transform 500ms ease ${offset}ms`,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </React.Fragment>
      ))}
    </h1>
  );
}
