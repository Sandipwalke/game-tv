import type { JSX } from 'react';
import { HUD } from './components/HUD';
import { LoadingOverlay } from './components/LoadingOverlay';
import { useWorldData } from './hooks/useWorldData';
import { TownScene } from './scene/TownScene';

export default function App(): JSX.Element {
  useWorldData();

  return (
    <main className="relative h-full w-full">
      <TownScene />
      <HUD />
      <LoadingOverlay />
    </main>
  );
}
