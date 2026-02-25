import React, { useState, useCallback, useEffect } from 'react';
import type { FileData } from '@shared/types';
import { useFileDrop } from './hooks/use-file-drop';
import { useModelLoader } from './hooks/use-model-loader';
import { isSplatFormat } from './loaders/loader-registry';
import { DropZone } from './components/DropZone';
import { Viewer3D } from './components/Viewer3D';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorOverlay } from './components/ErrorOverlay';

export const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { scene, bounds, modelInfo, isLoading, error: loadError, loadModel, clear } =
    useModelLoader();

  const handleFileLoaded = useCallback(
    async (data: FileData) => {
      setError(null);
      setFileData(data);

      if (data.category === 'mesh') {
        await loadModel(data);
      }
    },
    [loadModel]
  );

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const { isDragging, onDragOver, onDragLeave, onDrop } = useFileDrop(
    handleFileLoaded,
    handleError
  );

  // Listen for file-loaded event from DropZone's open dialog
  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent<FileData>).detail;
      handleFileLoaded(data);
    };
    window.addEventListener('miru3d:file-loaded', handler);
    return () => window.removeEventListener('miru3d:file-loaded', handler);
  }, [handleFileLoaded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          setResetTrigger((n) => n + 1);
        }
      }
      if (e.key === 'g' || e.key === 'G') {
        if (!e.ctrlKey && !e.metaKey) {
          setShowGrid((v) => !v);
        }
      }
      if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.electronAPI.openDialog().then((data) => {
          if (data) handleFileLoaded(data);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFileLoaded]);

  const displayError = error || loadError;
  const hasFile = fileData !== null;
  const showViewer = hasFile && !isLoading;

  return (
    <div
      className="w-full h-full relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {!hasFile && <DropZone isDragging={isDragging} />}

      {showViewer && fileData && (
        <Viewer3D
          fileData={fileData}
          scene={scene}
          bounds={bounds}
          modelInfo={modelInfo}
          showGrid={showGrid}
          resetTrigger={resetTrigger}
        />
      )}

      {isLoading && <LoadingOverlay />}

      {displayError && (
        <ErrorOverlay
          message={displayError}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Drag overlay when file is already loaded */}
      {hasFile && isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-blue-400 rounded-2xl p-8">
            <p className="text-blue-300 text-lg font-medium">Drop to replace model</p>
          </div>
        </div>
      )}
    </div>
  );
};
