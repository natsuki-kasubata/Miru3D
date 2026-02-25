import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export async function loadFbx(buffer: Uint8Array): Promise<THREE.Group> {
  const loader = new FBXLoader();

  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  try {
    const group = await new Promise<THREE.Group>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

    // FBX files are often in cm units (Maya/3ds Max). Auto-scale if too large.
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 100) {
      const scale = 0.01;
      group.scale.setScalar(scale);
    }

    return group;
  } finally {
    URL.revokeObjectURL(url);
  }
}
