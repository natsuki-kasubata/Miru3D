import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { FileData, ModelInfo } from '@shared/types';
import type { BoundsInfo } from '../lib/model-utils';
import { collectBlendshapes } from '../lib/blendshape-utils';
import { ModelRenderer } from './ModelRenderer';
import { GaussianSplatRenderer } from './GaussianSplatRenderer';
import { FileInfoOverlay } from './FileInfoOverlay';
import { LoadingOverlay } from './LoadingOverlay';
import { BlendshapePanel } from './BlendshapePanel';

interface Viewer3DProps {
  fileData: FileData;
  scene: THREE.Group | null;
  bounds: BoundsInfo | null;
  modelInfo: ModelInfo | null;
  isLoading: boolean;
  progress: number;
  stage: string;
  showGrid: boolean;
  resetTrigger: number;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  fileData,
  scene,
  bounds,
  modelInfo,
  isLoading,
  progress,
  stage,
  showGrid,
  resetTrigger,
}) => {
  const isSplat = fileData.category === 'splat';
  const [canvasReady, setCanvasReady] = useState(false);

  // Reset ready state when fileData changes (new model loaded)
  useEffect(() => {
    setCanvasReady(false);
  }, [fileData]);

  const handleCreated = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const blendshapes = useMemo(
    () => (scene ? collectBlendshapes(scene) : []),
    [scene],
  );

  const showLoading = isLoading || (!isSplat && !canvasReady);

  return (
    <div className="relative w-full h-full">
      {isSplat ? (
        <GaussianSplatRenderer fileData={fileData} showGrid={showGrid} />
      ) : (
        scene && bounds && (
          <Canvas
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            camera={{ fov: 50, near: 0.01, far: 1000 }}
            className="w-full h-full"
            onCreated={handleCreated}
          >
            <ModelRenderer
              scene={scene}
              bounds={bounds}
              showGrid={showGrid}
              resetTrigger={resetTrigger}
            />
          </Canvas>
        )
      )}
      {showLoading && (
        <LoadingOverlay
          progress={isLoading ? progress : undefined}
          stage={isLoading ? stage : 'Rendering...'}
        />
      )}
      {!showLoading && modelInfo && <FileInfoOverlay info={modelInfo} />}
      {!showLoading && scene && blendshapes.length > 0 && (
        <BlendshapePanel blendshapes={blendshapes} scene={scene} />
      )}
      {!showLoading && isSplat && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 pointer-events-none">
          <p className="font-medium text-sm">{fileData.fileName}</p>
          <p className="text-neutral-400">
            3D Gaussian Splat &middot;{' '}
            {(fileData.fileSize / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
      )}
    </div>
  );
};
