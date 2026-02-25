import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { FileData, ElectronAPI } from '../shared/types';

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
};

contextBridge.exposeInMainWorld('electronAPI', api);
