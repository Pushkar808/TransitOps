'use client';

import * as React from 'react';

let frames: any[] = [];
try {
  // @ts-ignore
  const context = (require as any).context('./Logistics hero', false, /frame_\d{3}\.jpg$/);
  frames = context.keys().sort().map(context);
} catch (e) {
  console.error('Failed to load frames using require.context', e);
}

export function LogisticsHeroPlayer() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imagesRef = React.useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);
  const totalFrames = frames.length || 240;

  React.useEffect(() => {
    if (frames.length === 0) return;

    let loaded = 0;
    const loadedImages: HTMLImageElement[] = [];

    frames.forEach((frameModule, index) => {
      const img = new Image();
      const src = typeof frameModule === 'string' ? frameModule : frameModule.default?.src || frameModule.src;
      img.src = src;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === totalFrames) {
          setIsReady(true);
        }
      };
      loadedImages[index] = img;
    });

    imagesRef.current = loadedImages;
  }, [totalFrames]);

  React.useEffect(() => {
    if (!isReady || imagesRef.current.length === 0) return;

    let animationId: number;
    let lastTime = performance.now();
    let currentFrame = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const render = (time: number) => {
      const delta = time - lastTime;
      if (delta >= interval) {
        const framesToAdvance = Math.floor(delta / interval);
        currentFrame = (currentFrame + framesToAdvance) % totalFrames;
        lastTime = time - (delta % interval);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = imagesRef.current[currentFrame];
          if (ctx && img && img.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const canvasAspect = canvas.width / canvas.height;
            const imgAspect = img.naturalWidth / img.naturalHeight;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;

            if (canvasAspect > imgAspect) {
              drawHeight = canvas.width / imgAspect;
              offsetY = (canvas.height - drawHeight) / 2;
            } else {
              drawWidth = canvas.height * imgAspect;
              offsetX = (canvas.width - drawWidth) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isReady, totalFrames]);

  React.useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="w-full h-full block object-cover" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white/50 text-sm">
          Loading background ({Math.round((loadedCount / totalFrames) * 100)}%)...
        </div>
      )}
    </div>
  );
}
