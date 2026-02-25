import * as THREE from 'three';

export interface BoundsInfo {
  center: THREE.Vector3;
  size: THREE.Vector3;
  radius: number;
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export function computeBounds(object: THREE.Object3D): BoundsInfo {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);

  return {
    center,
    size,
    radius: sphere.radius,
    min: box.min,
    max: box.max,
  };
}

/** Move object so its bottom sits at Y=0 and center at X=0, Z=0 */
export function centerOnGround(object: THREE.Object3D): BoundsInfo {
  const bounds = computeBounds(object);
  object.position.x -= bounds.center.x;
  object.position.y -= bounds.min.y;
  object.position.z -= bounds.center.z;
  return computeBounds(object);
}

export interface ModelStats {
  vertices: number;
  triangles: number;
}

export function countGeometry(object: THREE.Object3D): ModelStats {
  let vertices = 0;
  let triangles = 0;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      if (geometry.index) {
        triangles += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        triangles += geometry.attributes.position.count / 3;
      }
      if (geometry.attributes.position) {
        vertices += geometry.attributes.position.count;
      }
    }
  });

  return { vertices, triangles: Math.floor(triangles) };
}
