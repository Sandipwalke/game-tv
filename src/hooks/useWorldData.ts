import { useEffect } from 'react';
import { fetchAssets, fetchWorld } from '../utils/api';
import { generateFallbackTown } from '../utils/townGenerator';
import { useWorldStore } from '../store/worldStore';
import type { WorldObject } from '../types/world';

export function useWorldData(): void {
  const setObjects = useWorldStore((state) => state.setObjects);
  const setLoadingProgress = useWorldStore((state) => state.setLoadingProgress);

  useEffect(() => {
    let mounted = true;
    setLoadingProgress(10);

    Promise.all([fetchWorld(), fetchAssets().catch(() => ({ assets: [] }))])
      .then(([data, assetPayload]) => {
        if (!mounted) return;
        const knownIds = new Set(data.objects.map((object) => object.id));
        const assetObjects: WorldObject[] = assetPayload.assets
          .filter((asset) => !knownIds.has(asset.id))
          .map((asset, index) => ({
            id: asset.id,
            name: asset.name,
            type: 'asset',
            modelUrl: asset.model_url,
            position: [((index % 8) - 3.5) * 12, 0, 70 + Math.floor(index / 8) * 12],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            metadata: { source: 'assets-api' },
          }));

        setObjects([...data.objects, ...assetObjects]);
        setLoadingProgress(100);
      })
      .catch(() => {
        if (!mounted) return;
        setObjects(generateFallbackTown());
        setLoadingProgress(100);
      });

    return () => {
      mounted = false;
    };
  }, [setLoadingProgress, setObjects]);
}
