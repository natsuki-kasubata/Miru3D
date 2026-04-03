import * as THREE from 'three';

export interface BlendshapeInfo {
  name: string;
  index: number;
}

/** Collect all unique blendshape names from a scene. */
export function collectBlendshapes(object: THREE.Object3D): BlendshapeInfo[] {
  const seen = new Set<string>();
  const result: BlendshapeInfo[] = [];

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const dict = child.morphTargetDictionary;
    if (!dict) return;

    for (const [name, index] of Object.entries(dict)) {
      if (!seen.has(name)) {
        seen.add(name);
        result.push({ name, index });
      }
    }
  });

  // Sort alphabetically for stable UI order
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

/** Apply a blendshape value (0-1) to all meshes that have it. */
export function applyBlendshapeValue(
  object: THREE.Object3D,
  name: string,
  value: number,
): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const dict = child.morphTargetDictionary;
    const influences = child.morphTargetInfluences;
    if (!dict || !influences) return;

    const index = dict[name];
    if (index !== undefined) {
      influences[index] = value;
    }
  });
}
