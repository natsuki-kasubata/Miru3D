import { useState, useCallback, useEffect, type DragEvent } from 'react';
import type { FileData } from '@shared/types';

interface UseFileDropResult {
  isDragging: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

export function useFileDrop(
  onFileLoaded: (data: FileData) => void,
  onError: (message: string) => void
): UseFileDropResult {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      const filePath = (file as File & { path?: string }).path;

      if (!filePath) {
        onError('Could not read file path');
        return;
      }

      try {
        const fileData = await window.electronAPI.readFile(filePath);
        onFileLoaded(fileData);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load file');
      }
    },
    [onFileLoaded, onError]
  );

  // Listen for files opened from main process (argv, second-instance)
  useEffect(() => {
    const unsubscribe = window.electronAPI.onFileOpen((data) => {
      onFileLoaded(data);
    });
    return unsubscribe;
  }, [onFileLoaded]);

  return { isDragging, onDragOver, onDragLeave, onDrop };
}
