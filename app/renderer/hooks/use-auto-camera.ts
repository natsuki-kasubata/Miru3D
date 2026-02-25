import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { BoundsInfo } from '../lib/model-utils';

export function useAutoCamera(bounds: BoundsInfo | null): void {
  const { camera } = useThree();

  useEffect(() => {
    if (!bounds) return;

    const distance = bounds.radius * 2.5;
    const heightOffset = bounds.size.y * 0.3;

    camera.position.set(
      distance * 0.7,
      heightOffset + distance * 0.5,
      distance * 0.7
    );
    camera.lookAt(0, bounds.size.y * 0.4, 0);
    camera.updateProjectionMatrix();
  }, [bounds, camera]);
}
