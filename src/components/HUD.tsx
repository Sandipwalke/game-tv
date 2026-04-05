import { useMemo } from 'react';
import { useWorldStore } from '../store/worldStore';

export function HUD(): JSX.Element {
  const { objects, selectedObjectId, isNight, controlMode, toggleControlMode, toggleNight } = useWorldStore();

  const selected = useMemo(
    () => objects.find((object) => object.id === selectedObjectId),
    [objects, selectedObjectId],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex justify-between p-4 text-sm text-slate-100">
      <div className="pointer-events-auto w-72 space-y-3 rounded-xl bg-hud p-4 backdrop-blur-md">
        <h1 className="text-lg font-semibold">3D Town Simulation</h1>
        <p className="text-xs text-slate-300">WASD + mouse to move. Click objects to inspect details.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleControlMode}
            className="rounded bg-slate-700 px-3 py-1 text-xs hover:bg-slate-600"
          >
            Mode: {controlMode === 'orbit' ? 'Orbit' : 'First Person'}
          </button>
          <button
            type="button"
            onClick={toggleNight}
            className="rounded bg-indigo-600 px-3 py-1 text-xs hover:bg-indigo-500"
          >
            {isNight ? 'Switch to Day' : 'Switch to Night'}
          </button>
        </div>
      </div>

      <div className="pointer-events-auto w-72 rounded-xl bg-hud p-4 backdrop-blur-md">
        <h2 className="mb-2 font-medium">Object Info</h2>
        {selected ? (
          <dl className="space-y-1 text-xs">
            <div>
              <dt className="inline text-slate-300">Name:</dt> <dd className="inline">{selected.name}</dd>
            </div>
            <div>
              <dt className="inline text-slate-300">Type:</dt> <dd className="inline">{selected.type}</dd>
            </div>
            <div>
              <dt className="inline text-slate-300">Position:</dt>{' '}
              <dd className="inline">{selected.position.map((v) => v.toFixed(1)).join(', ')}</dd>
            </div>
            {selected.metadata && (
              <div>
                <dt className="inline text-slate-300">Metadata:</dt>{' '}
                <dd className="inline">{JSON.stringify(selected.metadata)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-xs text-slate-300">Select any building, tree, road, or vehicle.</p>
        )}
      </div>
    </div>
  );
}
