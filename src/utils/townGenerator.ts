import type { WorldObject } from '../types/world';

export function generateFallbackTown(): WorldObject[] {
  const roads: WorldObject[] = Array.from({ length: 6 }).flatMap((_, idx) => [
    {
      id: `road-h-${idx}`,
      name: `Horizontal Road ${idx}`,
      type: 'road',
      position: [0, 0.01, -45 + idx * 18],
      rotation: [0, 0, 0],
      scale: [160, 0.1, 4],
    },
    {
      id: `road-v-${idx}`,
      name: `Vertical Road ${idx}`,
      type: 'road',
      position: [-45 + idx * 18, 0.01, 0],
      rotation: [0, Math.PI / 2, 0],
      scale: [160, 0.1, 4],
    },
  ]);

  const buildings: WorldObject[] = Array.from({ length: 24 }).map((_, idx) => {
    const x = ((idx % 6) - 2.5) * 16;
    const z = (Math.floor(idx / 6) - 1.5) * 20;
    const height = 5 + (idx % 4) * 3;
    return {
      id: `building-${idx}`,
      name: `Building ${idx + 1}`,
      type: 'building',
      position: [x, height / 2, z],
      rotation: [0, (idx % 3) * 0.3, 0],
      scale: [10, height, 10],
      metadata: { occupancy: 20 + idx * 3, category: idx % 2 ? 'office' : 'retail' },
    };
  });

  const trees: WorldObject[] = Array.from({ length: 48 }).map((_, idx) => ({
    id: `tree-${idx}`,
    name: `Tree ${idx + 1}`,
    type: 'tree',
    position: [((idx % 12) - 6) * 12, 1.2, (Math.floor(idx / 12) - 2) * 14],
    rotation: [0, (idx % 7) * 0.4, 0],
    scale: [1, 1, 1],
  }));

  const vehicles: WorldObject[] = Array.from({ length: 8 }).map((_, idx) => ({
    id: `vehicle-${idx}`,
    name: `Car ${idx + 1}`,
    type: 'vehicle',
    position: [-50 + idx * 12, 0.8, -30 + (idx % 2) * 30],
    rotation: [0, idx % 2 ? Math.PI : 0, 0],
    scale: [2, 1.6, 4],
    metadata: { speed: 5 + idx },
  }));

  return [...roads, ...buildings, ...trees, ...vehicles];
}
