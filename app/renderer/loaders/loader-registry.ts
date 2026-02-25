import type { ModelFormat, FormatCategory } from '@shared/types';

interface FormatInfo {
  format: ModelFormat;
  category: FormatCategory;
  label: string;
}

const FORMAT_MAP: Record<string, FormatInfo> = {
  glb:    { format: 'glb',    category: 'mesh',  label: 'glTF Binary' },
  gltf:   { format: 'gltf',   category: 'mesh',  label: 'glTF' },
  fbx:    { format: 'fbx',    category: 'mesh',  label: 'FBX' },
  obj:    { format: 'obj',    category: 'mesh',  label: 'Wavefront OBJ' },
  vrm:    { format: 'vrm',    category: 'mesh',  label: 'VRM Avatar' },
  ply:    { format: 'ply',    category: 'splat',  label: '3D Gaussian Splat (PLY)' },
  splat:  { format: 'splat',  category: 'splat',  label: '3D Gaussian Splat' },
  ksplat: { format: 'ksplat', category: 'splat',  label: '3D Gaussian Splat (KSplat)' },
};

export function getFormatInfo(extension: string): FormatInfo | undefined {
  return FORMAT_MAP[extension.toLowerCase().replace('.', '')];
}

export function isMeshFormat(extension: string): boolean {
  const info = getFormatInfo(extension);
  return info?.category === 'mesh';
}

export function isSplatFormat(extension: string): boolean {
  const info = getFormatInfo(extension);
  return info?.category === 'splat';
}

export function getSupportedExtensions(): string[] {
  return Object.keys(FORMAT_MAP);
}
