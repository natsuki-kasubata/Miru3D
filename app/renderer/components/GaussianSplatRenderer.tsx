import React, { useRef, useEffect, useState } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import type { FileData } from '@shared/types';

interface GaussianSplatRendererProps {
  fileData: FileData;
  showGrid: boolean;
}

export const GaussianSplatRenderer: React.FC<GaussianSplatRendererProps> = ({
  fileData,
  showGrid,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<InstanceType<typeof GaussianSplats3D.Viewer> | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewer = new GaussianSplats3D.Viewer({
      cameraUp: [0, 1, 0],
      initialCameraPosition: [0, 2, 5],
      initialCameraLookAt: [0, 0, 0],
      rootElement: container,
      dynamicScene: false,
      sharedMemoryForWorkers: false,
    });
    viewerRef.current = viewer;

    const blob = new Blob([fileData.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    let formatNum = 0; // auto-detect
    if (fileData.extension === 'ply') formatNum = 0;
    else if (fileData.extension === 'splat') formatNum = 1;
    else if (fileData.extension === 'ksplat') formatNum = 2;

    viewer
      .addSplatScene(url, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        progressiveLoad: true,
        format: formatNum,
      })
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err: unknown) => {
        console.error('Failed to load splat:', err);
      })
      .finally(() => {
        URL.revokeObjectURL(url);
      });

    viewer.start();

    return () => {
      viewer.stop();
      viewer.dispose();
      viewerRef.current = null;
    };
  }, [fileData]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-neutral-600 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">Loading Gaussian Splat...</p>
          </div>
        </div>
      )}
    </div>
  );
};
