import React from 'react';

interface DropZoneProps {
  isDragging: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ isDragging }) => {
  const handleOpenDialog = async () => {
    try {
      const fileData = await window.electronAPI.openDialog();
      if (fileData) {
        // Will be handled via the IPC listener in App
        window.dispatchEvent(new CustomEvent('miru3d:file-loaded', { detail: fileData }));
      }
    } catch {
      // Dialog cancelled or error
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full select-none">
      <div
        className={`
          flex flex-col items-center justify-center gap-4 p-12
          border-2 border-dashed rounded-2xl transition-colors duration-200
          ${isDragging
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-neutral-600 hover:border-neutral-500'
          }
        `}
      >
        <svg
          className={`w-16 h-16 ${isDragging ? 'text-blue-400' : 'text-neutral-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V15m0 0l-2.25 1.313M3 16.5v-2.25m0 0l2.25 1.313M3 14.25l2.25-1.313m0 0L7.5 11.25m13.5 3v-2.25m0 0l-2.25 1.313m2.25-1.313l-2.25-1.313M16.5 11.25L18.75 9.937"
          />
        </svg>

        <div className="text-center">
          <p className={`text-lg font-medium ${isDragging ? 'text-blue-300' : 'text-neutral-300'}`}>
            {isDragging ? 'Drop to view' : 'Drag & drop a 3D model'}
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            GLB, GLTF, FBX, OBJ, VRM, PLY, SPLAT, KSPLAT
          </p>
        </div>

        <button
          onClick={handleOpenDialog}
          className="mt-2 px-4 py-2 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors"
        >
          or open file...
        </button>
      </div>

      <div className="mt-8 text-xs text-neutral-600 space-y-1 text-center">
        <p>Ctrl+O: Open file / R: Reset camera / G: Toggle grid</p>
      </div>
    </div>
  );
};
