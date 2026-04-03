import React from 'react';

interface LoadingOverlayProps {
  progress?: number; // 0–100, undefined = indeterminate
  stage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, stage }) => {
  const hasProgress = progress !== undefined && progress > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-3 min-w-[160px]">
        {hasProgress ? (
          <div className="w-40 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-[width] duration-150 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        ) : (
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-blue-400 rounded-full animate-spin" />
        )}
        <p className="text-sm text-neutral-400">
          {stage ?? 'Loading model...'}
          {hasProgress && <span className="ml-1.5 text-neutral-500">{Math.round(progress)}%</span>}
        </p>
      </div>
    </div>
  );
};
