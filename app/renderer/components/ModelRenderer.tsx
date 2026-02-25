import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SceneEnvironment } from './SceneEnvironment';
import { useAutoCamera } from '../hooks/use-auto-camera';
import type { BoundsInfo } from '../lib/model-utils';

interface ModelRendererProps {
  scene: THREE.Group;
  bounds: BoundsInfo;
  showGrid: boolean;
  resetTrigger: number;
}

export const ModelRenderer: React.FC<ModelRendererProps> = ({
  scene,
  bounds,
  showGrid,
  resetTrigger,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useAutoCamera(bounds);

  // Add model to scene
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    group.clear();
    group.add(scene);

    return () => {
      group.clear();
    };
  }, [scene]);

  // Camera reset
  useEffect(() => {
    if (resetTrigger === 0) return;
    controlsRef.current?.reset();
  }, [resetTrigger]);

  return (
    <>
      <SceneEnvironment showGrid={showGrid} />
      <group ref={groupRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, bounds.size.y * 0.4, 0]}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  );
};
