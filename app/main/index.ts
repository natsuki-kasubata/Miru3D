import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { setupFileHandlers, sendFileToRenderer, getFilePathFromArgs } from './file-handler';
import { createMenu } from './menu';

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    title: 'Miru3D',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();

    // Open file from command-line args (double-click / right-click open)
    const filePath = getFilePathFromArgs(process.argv);
    if (filePath) {
      sendFileToRenderer(win, filePath);
    }
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  return win;
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const filePath = getFilePathFromArgs(argv);
      if (filePath) {
        sendFileToRenderer(mainWindow, filePath);
      }
    }
  });

  app.whenReady().then(() => {
    setupFileHandlers();
    createMenu();
    mainWindow = createWindow();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
