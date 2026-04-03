import { useState, useCallback } from 'react';
import * as THREE from 'three';
import type { FileData, ModelInfo } from '@shared/types';
import { loadGltf } from '../loaders/gltf-loader';
import { loadFbx } from '../loaders/fbx-loader';
import { loadObj } from '../loaders/obj-loader';
import { centerOnGround, countGeometry, type BoundsInfo } from '../lib/model-utils';

interface UseModelLoaderResult {
  scene: THREE.Group | null;
  bounds: BoundsInfo | null;
  modelInfo: ModelInfo | null;
  isLoading: boolean;
  progress: number;
  stage: string;
  error: string | null;
  loadModel: (fileData: FileData) => Promise<void>;
  clear: () => void;
}

export function useModelLoader(): UseModelLoaderResult {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [bounds, setBounds] = useState<BoundsInfo | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    setScene(null);
    setBounds(null);
    setModelInfo(null);
    setError(null);
  }, [scene]);

  const loadModel = useCallback(
    async (fileData: FileData) => {
      clear();
      setIsLoading(true);
      setProgress(0);
      setStage('Loading file...');
      setError(null);

      try {
        let loadedScene: THREE.Group;

        const onProgress = (percent: number) => {
          setProgress(percent * 0.8); // 0–80% for file parsing
        };

        switch (fileData.extension) {
          case 'glb':
          case 'gltf':
          case 'vrm': {
            setStage('Parsing model...');
            const result = await loadGltf(fileData.buffer, fileData.extension, onProgress);
            loadedScene = result.scene;
            break;
          }
          case 'fbx':
            setStage('Parsing FBX...');
            loadedScene = await loadFbx(fileData.buffer, onProgress);
            break;
          case 'obj':
            setStage('Parsing OBJ...');
            loadedScene = await loadObj(fileData.buffer);
            setProgress(80);
            break;
          default:
            throw new Error(`Unsupported mesh format: ${fileData.extension}`);
        }

        setProgress(90);
        setStage('Preparing scene...');

        const newBounds = centerOnGround(loadedScene);
        const stats = countGeometry(loadedScene);

        setProgress(100);

        setScene(loadedScene);
        setBounds(newBounds);
        setModelInfo({
          fileName: fileData.fileName,
          format: fileData.extension,
          fileSize: fileData.fileSize,
          vertices: stats.vertices,
          triangles: stats.triangles,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load model';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [clear]
  );

  return { scene, bounds, modelInfo, isLoading, progress, stage, error, loadModel, clear };
}
