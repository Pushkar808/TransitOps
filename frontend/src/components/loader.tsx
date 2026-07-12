import * as React from 'react';
import { Truck } from 'lucide-react';

export function Loader({ className = '', fullScreen = false }: { className?: string; fullScreen?: boolean }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Glowing backdrop halo */}
        <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-xl animate-pulse" />
        
        {/* Outer clockwise spinning ring */}
        <div className="absolute h-full w-full rounded-full border-4 border-primary/20 border-t-primary animate-spin [animation-duration:1s]" />
        
        {/* Inner counter-clockwise spinning ring */}
        <div className="absolute h-14 w-14 rounded-full border-4 border-primary/10 border-b-primary/60 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        
        {/* Pulse animate transit/truck icon */}
        <Truck className="h-7 w-7 text-primary animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase animate-pulse">
          TransitOps
        </p>
        <p className="text-xs text-muted-foreground">
          Syncing logistics data...
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-12 min-h-[300px]">
      {content}
    </div>
  );
}
