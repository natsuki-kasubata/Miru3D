import { BrowserWindow, ipcMain } from 'electron';
import { join, resolve, basename } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { IPC } from '../shared/ipc-channels';
import type { ScreenshotAngle, ScreenshotRequest, ScreenshotResultItem } from '../shared/types';

const PRESET_ANGLES: Record<string, ScreenshotAngle> = {
  front:  { name: 'front',  azimuth: 0,   elevation: 15 },
  back:   { name: 'back',   azimuth: 180, elevation: 15 },
  left:   { name: 'left',   azimuth: -90, elevation: 15 },
  right:  { name: 'right',  azimuth: 90,  elevation: 15 },
  top:    { name: 'top',    azimuth: 0,   elevation: 80 },
  '3/4':  { name: '3_4',    azimuth: 35,  elevation: 25 },
};

const DEFAULT_ANGLES = ['front', 'right', 'back', '3/4'];

interface ScreenshotArgs {
  modelPath: string;
  outputDir: string;
  angles: ScreenshotAngle[];
  width: number;
  height: number;
}

export function parseScreenshotArgs(argv: string[]): ScreenshotArgs | null {
  const ssIdx = argv.indexOf('--screenshot');
  if (ssIdx === -1) return null;

  let modelPath = '';
  for (let i = ssIdx + 1; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) {
      modelPath = argv[i];
      break;
    }
  }
  if (!modelPath) return null;
  modelPath = resolve(modelPath);

  if (!existsSync(modelPath)) {
    console.error(`File not found: ${modelPath}`);
    return null;
  }

  const outIdx = argv.indexOf('--output-dir');
  const outputDir = outIdx !== -1 && argv[outIdx + 1]
    ? resolve(argv[outIdx + 1])
    : resolve(join('.', 'screenshots'));

  const angIdx = argv.indexOf('--angles');
  const angleNames = angIdx !== -1 && argv[angIdx + 1]
    ? argv[angIdx + 1].split(',')
    : DEFAULT_ANGLES;

  const angles: ScreenshotAngle[] = angleNames.map((name) => {
    const trimmed = name.trim().toLowerCase();
    return PRESET_ANGLES[trimmed] ?? PRESET_ANGLES['front'];
  });

  const wIdx = argv.indexOf('--width');
  const width = wIdx !== -1 ? parseInt(argv[wIdx + 1], 10) || 1920 : 1920;
  const hIdx = argv.indexOf('--height');
  const height = hIdx !== -1 ? parseInt(argv[hIdx + 1], 10) || 1080 : 1080;

  return { modelPath, outputDir, angles, width, height };
}

export async function runScreenshotMode(args: ScreenshotArgs): Promise<void> {
  await mkdir(args.outputDir, { recursive: true });

  const win = new BrowserWindow({
    width: args.width,
    height: args.height,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Log renderer console
  win.webContents.on('console-message', (_e, _level, message) => {
    console.error(`[renderer] ${message}`);
  });

  const htmlPath = join(__dirname, '../renderer/index.html');
  console.error(`[screenshot] Loading: ${process.env.VITE_DEV_SERVER_URL ?? htmlPath}`);

  try {
    if (process.env.VITE_DEV_SERVER_URL) {
      await win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      await win.loadFile(htmlPath);
    }
  } catch (err) {
    console.error('[screenshot] Failed to load page:', err);
    win.close();
    return;
  }

  console.error('[screenshot] Page loaded, waiting for React to mount...');

  const modelName = basename(args.modelPath).replace(/\.[^.]+$/, '');

  return new Promise<void>((resolvePromise) => {
    // Listen for results from renderer
    ipcMain.once(IPC.SCREENSHOT_RESULT, async (_event, results: (ScreenshotResultItem & { data?: string })[]) => {
      console.error(`[screenshot] Received ${results.length} screenshots`);
      const savedResults: ScreenshotResultItem[] = [];
      for (const r of results) {
        if (r.data) {
          const base64 = r.data.split(',')[1];
          const buffer = Buffer.from(base64, 'base64');
          const filePath = join(args.outputDir, `${modelName}_${r.angle}.png`);
          await writeFile(filePath, buffer);
          savedResults.push({ angle: r.angle, path: filePath.replace(/\\/g, '/') });
        }
      }

      const summaryPath = join(args.outputDir, `${modelName}_screenshots.json`);
      await writeFile(summaryPath, JSON.stringify(savedResults, null, 2));

      for (const r of savedResults) {
        console.log(r.path);
      }

      win.close();
      resolvePromise();
    });

    // Send capture request after React mounts (page already loaded via await)
    setTimeout(() => {
      console.error('[screenshot] Sending capture request...');
      const request: ScreenshotRequest = {
        filePath: args.modelPath,
        angles: args.angles,
        width: args.width,
        height: args.height,
        outputDir: args.outputDir,
      };
      win.webContents.send(IPC.SCREENSHOT_CAPTURE, request);
    }, 2000);

    // Timeout safety
    setTimeout(() => {
      console.error('[screenshot] Timed out after 60s');
      win.close();
      resolvePromise();
    }, 60000);
  });
}
