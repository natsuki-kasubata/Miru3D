import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ScreenshotRequest, ScreenshotAngle, ScreenshotResultItem } from '@shared/types';
import type { BoundsInfo } from '../lib/model-utils';
import { SceneEnvironment } from './SceneEnvironment';

interface ScreenshotCaptureProps {
  request: ScreenshotRequest;
  scene: THREE.Group;
  bounds: BoundsInfo;
}

interface CaptureSceneProps {
  scene: THREE.Group;
  bounds: BoundsInfo;
  angles: ScreenshotAngle[];
  onAllCaptured: (images: Array<{ name: string; dataUrl: string }>) => void;
}

function CaptureScene({ scene, bounds, angles, onAllCaptured }: CaptureSceneProps) {
  const { gl, camera, scene: threeScene } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const captured = useRef<Array<{ name: string; dataUrl: string }>>([]);
  const frameCount = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clear();
    group.add(scene);
    console.log('[capture] Scene added, starting capture in 500ms');
    setTimeout(() => setCurrentIndex(0), 500);
    return () => { group.clear(); };
  }, [scene]);

  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= angles.length) return;

    const angle = angles[currentIndex];
    const distance = bounds.radius * 2.5;
    const azRad = (angle.azimuth * Math.PI) / 180;
    const elRad = (angle.elevation * Math.PI) / 180;

    const x = distance * Math.cos(elRad) * Math.sin(azRad);
    const y = distance * Math.sin(elRad) + bounds.size.y * 0.4;
    const z = distance * Math.cos(elRad) * Math.cos(azRad);

    camera.position.set(x, y, z);
    camera.lookAt(0, bounds.size.y * 0.4, 0);
    camera.updateProjectionMatrix();

    frameCount.current = 0;
    console.log(`[capture] Angle ${currentIndex}: ${angle.name} (az=${angle.azimuth}, el=${angle.elevation})`);
  }, [currentIndex, angles, bounds, camera]);

  useFrame(() => {
    if (done.current || currentIndex < 0 || currentIndex >= angles.length) return;

    frameCount.current++;
    if (frameCount.current < 10) return;
    if (frameCount.current === 10) {
      gl.render(threeScene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');
      console.log(`[capture] Captured ${angles[currentIndex].name} (${dataUrl.length} bytes)`);
      captured.current.push({ name: angles[currentIndex].name, dataUrl });

      if (currentIndex + 1 >= angles.length) {
        done.current = true;
        console.log(`[capture] All ${angles.length} angles captured`);
        onAllCaptured(captured.current);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }
  });

  return (
    <>
      <SceneEnvironment showGrid={false} />
      <group ref={groupRef} />
    </>
  );
}

export const ScreenshotCapture: React.FC<ScreenshotCaptureProps> = ({
  request,
  scene,
  bounds,
}) => {
  const handleCaptured = useCallback(
    (images: Array<{ name: string; dataUrl: string }>) => {
      console.log(`[capture] Sending ${images.length} screenshots to main`);
      const results: (ScreenshotResultItem & { data?: string })[] = images.map((img) => ({
        angle: img.name,
        path: '',
        data: img.dataUrl,
      }));
      window.electronAPI.sendScreenshotResult(results);
    },
    [],
  );

  console.log('[capture] ScreenshotCapture mounted', request.angles.length, 'angles');

  return (
    <div style={{ width: request.width, height: request.height, position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          preserveDrawingBuffer: true,
        }}
        camera={{ fov: 50, near: 0.01, far: 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <CaptureScene
          scene={scene}
          bounds={bounds}
          angles={request.angles}
          onAllCaptured={handleCaptured}
        />
      </Canvas>
    </div>
  );
};
