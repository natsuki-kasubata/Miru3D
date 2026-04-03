import { useState, useCallback, useEffect, type DragEvent } from 'react';
import type { FileData, ModelFormat, FormatCategory } from '@shared/types';
import { getFormatInfo } from '../loaders/loader-registry';

interface UseFileDropResult {
  isDragging: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

async function readFileFromDrop(file: File): Promise<FileData> {
  const ext = getExtension(file.name);
  const info = getFormatInfo(ext);
  if (!info) {
    throw new Error(`Unsupported format: .${ext}`);
  }

  // Try to get the native file path via Electron's webUtils
  let filePath = '';
  try {
    filePath = window.electronAPI.getPathForFile(file);
  } catch {
    // Not available — use file name only
  }

  // If we got a path, use main process to read (supports large files better)
  if (filePath) {
    return window.electronAPI.readFile(filePath);
  }

  // Fallback: read directly via FileReader
  const arrayBuffer = await file.arrayBuffer();
  return {
    filePath: file.name,
    fileName: file.name,
    extension: info.format as ModelFormat,
    category: info.category as FormatCategory,
    buffer: new Uint8Array(arrayBuffer),
    fileSize: file.size,
  };
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

      try {
        const fileData = await readFileFromDrop(files[0]);
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
