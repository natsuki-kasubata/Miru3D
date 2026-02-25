import { Menu, BrowserWindow, dialog } from 'electron';
import { sendFileToRenderer } from './file-handler';

export function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;

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

            if (!result.canceled && result.filePaths.length > 0) {
              sendFileToRenderer(win, result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Miru3D',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'About Miru3D',
              message: 'Miru3D',
              detail: 'A simple 3D model viewer for Windows.\nSupports GLB, GLTF, FBX, OBJ, VRM, PLY, SPLAT, KSPLAT.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
