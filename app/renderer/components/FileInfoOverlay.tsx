import React from 'react';
import type { ModelInfo } from '@shared/types';
import { formatFileSize, formatNumber } from '../lib/format-info';
import { getFormatInfo } from '../loaders/loader-registry';

interface FileInfoOverlayProps {
  info: ModelInfo;
}

export const FileInfoOverlay: React.FC<FileInfoOverlayProps> = ({ info }) => {
  const formatInfo = getFormatInfo(info.format);

  return (
    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 space-y-0.5 pointer-events-none">
      <p className="font-medium text-sm">{info.fileName}</p>
      <p className="text-neutral-400">
        {formatInfo?.label ?? info.format.toUpperCase()} &middot; {formatFileSize(info.fileSize)}
      </p>
      {info.vertices !== undefined && info.triangles !== undefined && (
        <p className="text-neutral-400">
          {formatNumber(info.vertices)} vertices &middot; {formatNumber(info.triangles)} triangles
        </p>
      )}
    </div>
  );
};
