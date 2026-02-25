import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import type { ModelFormat } from '@shared/types';

export interface GltfLoadResult {
  scene: THREE.Group;
  isVrm: boolean;
  vrm?: unknown;
}

export async function loadGltf(
  buffer: Uint8Array,
  format: ModelFormat
): Promise<GltfLoadResult> {
  const loader = new GLTFLoader();

  const isVrm = format === 'vrm';
  if (isVrm) {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  }

  const blob = new Blob([buffer], {
    type: format === 'glb' || format === 'vrm' ? 'model/gltf-binary' : 'model/gltf+json',
  });
  const url = URL.createObjectURL(blob);

  try {
    const gltf = await new Promise<{ scene: THREE.Group; userData: Record<string, unknown> }>(
      (resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      }
    );

    const scene = gltf.scene;

    // VRM models face -Z by default; rotate 180 degrees so they face the camera
    if (isVrm) {
      scene.rotation.y = Math.PI;
    }

    return {
      scene,
      isVrm,
      vrm: isVrm ? gltf.userData.vrm : undefined,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
