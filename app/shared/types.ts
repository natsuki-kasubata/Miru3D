export type ModelFormat = 'glb' | 'gltf' | 'fbx' | 'obj' | 'vrm' | 'ply' | 'splat' | 'ksplat';

export type FormatCategory = 'mesh' | 'splat';

export interface FileData {
  filePath: string;
  fileName: string;
  extension: ModelFormat;
  category: FormatCategory;
  buffer: Uint8Array;
  fileSize: number;
}

export interface ModelInfo {
  fileName: string;
  format: ModelFormat;
  fileSize: number;
  vertices?: number;
  triangles?: number;
}

export interface ScreenshotAngle {
  name: string;
  azimuth: number;  // degrees around Y axis (0 = front)
  elevation: number; // degrees above horizon
}

export interface ScreenshotRequest {
  filePath: string;
  angles: ScreenshotAngle[];
  width: number;
  height: number;
  outputDir: string;
}

export interface ScreenshotResultItem {
  angle: string;
  path: string;
}

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<FileData>;
  openDialog: () => Promise<FileData | null>;
  onFileOpen: (callback: (data: FileData) => void) => () => void;
  getPathForFile: (file: File) => string;
  onScreenshotCapture: (callback: (req: ScreenshotRequest) => void) => () => void;
  sendScreenshotResult: (results: ScreenshotResultItem[]) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
