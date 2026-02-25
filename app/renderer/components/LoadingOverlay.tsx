import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">Loading model...</p>
      </div>
    </div>
  );
};
