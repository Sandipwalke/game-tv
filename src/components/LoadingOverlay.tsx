import type { JSX } from 'react';
import { useWorldStore } from '../store/worldStore';

export function LoadingOverlay(): JSX.Element | null {
  const loadingProgress = useWorldStore((state) => state.loadingProgress);

  if (loadingProgress >= 100) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 text-white">
      <div className="w-80 space-y-3 rounded-xl bg-slate-900 p-5 shadow-lg">
        <p className="text-sm uppercase tracking-wider text-slate-300">Loading town assets...</p>
        <div className="h-3 rounded bg-slate-700">
          <div className="h-full rounded bg-cyan-400 transition-all" style={{ width: `${loadingProgress}%` }} />
        </div>
        <p className="text-right text-xs text-slate-300">{Math.round(loadingProgress)}%</p>
      </div>
    </div>
  );
}
