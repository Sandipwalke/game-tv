import { useEffect } from 'react';
import { fetchWorld } from '../utils/api';
import { generateFallbackTown } from '../utils/townGenerator';
import { useWorldStore } from '../store/worldStore';

export function useWorldData(): void {
  const setObjects = useWorldStore((state) => state.setObjects);
  const setLoadingProgress = useWorldStore((state) => state.setLoadingProgress);

  useEffect(() => {
    let mounted = true;
    setLoadingProgress(10);

    fetchWorld()
      .then((data) => {
        if (!mounted) return;
        setObjects(data.objects);
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
