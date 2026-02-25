import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export async function loadObj(buffer: Uint8Array): Promise<THREE.Group> {
  const loader = new OBJLoader();

  const text = new TextDecoder().decode(buffer);
  const group = loader.parse(text);

  // Apply default material if none exists
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && !child.material) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.6,
        metalness: 0.1,
      });
    }
  });

  return group;
}
