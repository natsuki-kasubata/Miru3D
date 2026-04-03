import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { FileData, ScreenshotRequest, ScreenshotResultItem, ElectronAPI } from '../shared/types';

const api: ElectronAPI = {
  readFile: (filePath: string) => ipcRenderer.invoke(IPC.FILE_READ, filePath),
  openDialog: () => ipcRenderer.invoke(IPC.FILE_OPEN_DIALOG),
  onFileOpen: (callback: (data: FileData) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: FileData) => callback(data);
    ipcRenderer.on(IPC.FILE_OPEN, handler);
    return () => {
      ipcRenderer.removeListener(IPC.FILE_OPEN, handler);
    };
  },
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  onScreenshotCapture: (callback: (req: ScreenshotRequest) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, req: ScreenshotRequest) => callback(req);
    ipcRenderer.on(IPC.SCREENSHOT_CAPTURE, handler);
    return () => {
      ipcRenderer.removeListener(IPC.SCREENSHOT_CAPTURE, handler);
    };
  },
  sendScreenshotResult: (results: ScreenshotResultItem[]) => {
    ipcRenderer.send(IPC.SCREENSHOT_RESULT, results);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
