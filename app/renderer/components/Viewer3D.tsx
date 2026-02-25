import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { FileData, ModelInfo } from '@shared/types';
import type { BoundsInfo } from '../lib/model-utils';
import { ModelRenderer } from './ModelRenderer';
import { GaussianSplatRenderer } from './GaussianSplatRenderer';
import { FileInfoOverlay } from './FileInfoOverlay';

interface Viewer3DProps {
  fileData: FileData;
  scene: THREE.Group | null;
  bounds: BoundsInfo | null;
  modelInfo: ModelInfo | null;
  showGrid: boolean;
  resetTrigger: number;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  fileData,
  scene,
  bounds,
  modelInfo,
  showGrid,
  resetTrigger,
}) => {
  const isSplat = fileData.category === 'splat';

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
      {modelInfo && <FileInfoOverlay info={modelInfo} />}
      {isSplat && (
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
