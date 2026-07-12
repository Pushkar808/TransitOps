'use client';

import * as React from 'react';

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
        <p className="text-[10px] text-white/30 font-semibold tracking-widest uppercase">
          Loading screen...
        </p>
      </div>
    </div>
  );
}
