import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { Group } from 'three';

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(draco);

const cache = new Map<string, Promise<Group>>();

export function loadModel(url: string): Promise<Group> {
  if (!cache.has(url)) {
    const task = new Promise<Group>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error),
      );
    });
    cache.set(url, task);
  }

  return cache.get(url)!;
}
