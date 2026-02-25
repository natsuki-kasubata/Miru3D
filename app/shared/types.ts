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

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<FileData>;
  openDialog: () => Promise<FileData | null>;
  onFileOpen: (callback: (data: FileData) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
