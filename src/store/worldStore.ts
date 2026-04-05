import { create } from 'zustand';
import type { WorldObject } from '../types/world';

type ControlMode = 'orbit' | 'firstPerson';

interface WorldState {
  objects: WorldObject[];
  selectedObjectId?: string;
  isNight: boolean;
  loadingProgress: number;
  controlMode: ControlMode;
  setObjects: (objects: WorldObject[]) => void;
  setSelectedObjectId: (id?: string) => void;
  toggleNight: () => void;
  setLoadingProgress: (value: number) => void;
  toggleControlMode: () => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  objects: [],
  selectedObjectId: undefined,
  isNight: false,
  loadingProgress: 0,
  controlMode: 'orbit',
  setObjects: (objects) => set({ objects }),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  toggleNight: () => set((state) => ({ isNight: !state.isNight })),
  setLoadingProgress: (value) => set({ loadingProgress: value }),
  toggleControlMode: () =>
    set((state) => ({ controlMode: state.controlMode === 'orbit' ? 'firstPerson' : 'orbit' })),
}));
