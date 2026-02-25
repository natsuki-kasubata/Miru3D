import { ipcMain, dialog, BrowserWindow } from 'electron';
import { readFile } from 'fs/promises';
import { basename, extname } from 'path';
import { IPC } from '../shared/ipc-channels';
import type { FileData, ModelFormat, FormatCategory } from '../shared/types';

const SUPPORTED_EXTENSIONS: Record<string, { format: ModelFormat; category: FormatCategory }> = {
  '.glb': { format: 'glb', category: 'mesh' },
  '.gltf': { format: 'gltf', category: 'mesh' },
  '.fbx': { format: 'fbx', category: 'mesh' },
  '.obj': { format: 'obj', category: 'mesh' },
  '.vrm': { format: 'vrm', category: 'mesh' },
  '.ply': { format: 'ply', category: 'splat' },
  '.splat': { format: 'splat', category: 'splat' },
  '.ksplat': { format: 'ksplat', category: 'splat' },
};

function isSupportedFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ext in SUPPORTED_EXTENSIONS;
}

async function loadFile(filePath: string): Promise<FileData> {
  const ext = extname(filePath).toLowerCase();
  const info = SUPPORTED_EXTENSIONS[ext];
  if (!info) {
    throw new Error(`Unsupported file format: ${ext}`);
  }

  const buffer = await readFile(filePath);

  return {
    filePath,
    fileName: basename(filePath),
    extension: info.format,
    category: info.category,
    buffer: new Uint8Array(buffer),
    fileSize: buffer.byteLength,
  };
}

export function setupFileHandlers(): void {
  ipcMain.handle(IPC.FILE_READ, async (_event, filePath: string) => {
    return loadFile(filePath);
  });

  ipcMain.handle(IPC.FILE_OPEN_DIALOG, async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      title: 'Open 3D Model',
      filters: [
        {
          name: '3D Models',
          extensions: ['glb', 'gltf', 'fbx', 'obj', 'vrm', 'ply', 'splat', 'ksplat'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return loadFile(result.filePaths[0]);
  });
}

export function sendFileToRenderer(win: BrowserWindow, filePath: string): void {
  if (!isSupportedFile(filePath)) return;

  loadFile(filePath).then((fileData) => {
    win.webContents.send(IPC.FILE_OPEN, fileData);
  }).catch((err) => {
    console.error('Failed to load file:', err);
  });
}

export function getFilePathFromArgs(args: string[]): string | undefined {
  return args.find((arg) => {
    if (arg.startsWith('-') || arg.startsWith('--')) return false;
    return isSupportedFile(arg);
  });
}
