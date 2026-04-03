import { useEffect, useRef } from 'react';
import type { ScreenshotRequest, ScreenshotResultItem } from '@shared/types';

/**
 * Listens for screenshot capture requests from main process.
 * Returns the current request (null when in normal GUI mode).
 */
export function useScreenshotMode(
  onRequest: (req: ScreenshotRequest) => void,
): void {
  const onRequestRef = useRef(onRequest);
  onRequestRef.current = onRequest;

  useEffect(() => {
    return window.electronAPI.onScreenshotCapture((req) => {
      onRequestRef.current(req);
    });
  }, []);
}
