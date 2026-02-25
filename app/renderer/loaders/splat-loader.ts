import type { FileData } from '@shared/types';

export function createSplatBlobUrl(fileData: FileData): string {
  const mimeMap: Record<string, string> = {
    ply: 'application/octet-stream',
    splat: 'application/octet-stream',
    ksplat: 'application/octet-stream',
  };

  const blob = new Blob([fileData.buffer], {
    type: mimeMap[fileData.extension] ?? 'application/octet-stream',
  });
  return URL.createObjectURL(blob);
}
