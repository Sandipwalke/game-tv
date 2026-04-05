import type { AssetPayload, WorldPayload } from '../types/world';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function fetchWorld(): Promise<WorldPayload> {
  const response = await fetch(`${API_URL}/world`);
  if (!response.ok) {
    throw new Error(`Failed to load world (${response.status})`);
  }
  return (await response.json()) as WorldPayload;
}

export async function fetchAssets(): Promise<AssetPayload> {
  const response = await fetch(`${API_URL}/assets`);
  if (!response.ok) {
    throw new Error(`Failed to load assets (${response.status})`);
  }
  return (await response.json()) as AssetPayload;
}

export async function postInteraction(objectId: string, actionType: string): Promise<void> {
  await fetch(`${API_URL}/interaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objectId, actionType, occurredAt: new Date().toISOString() }),
  });
}
