import React from 'react';

interface ErrorOverlayProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message, onDismiss }) => {
  return (
    <div className="absolute top-4 right-4 max-w-sm bg-red-900/80 backdrop-blur-sm text-white text-sm rounded-lg px-4 py-3 z-50 shadow-lg">
      <div className="flex items-start gap-2">
        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <div className="flex-1">
          <p className="font-medium">Failed to load model</p>
          <p className="text-red-200 text-xs mt-1">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-300 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
