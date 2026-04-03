import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { BlendshapeInfo } from '../lib/blendshape-utils';
import { applyBlendshapeValue } from '../lib/blendshape-utils';

interface BlendshapePanelProps {
  blendshapes: BlendshapeInfo[];
  scene: THREE.Group;
}

export const BlendshapePanel: React.FC<BlendshapePanelProps> = ({
  blendshapes,
  scene,
}) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  // Reset values when blendshapes change (new model)
  useEffect(() => {
    setValues({});
    setFilter('');
  }, [blendshapes]);

  const handleChange = useCallback(
    (name: string, value: number) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      applyBlendshapeValue(sceneRef.current, name, value);
    },
    [],
  );

  const handleResetAll = useCallback(() => {
    const reset: Record<string, number> = {};
    for (const bs of blendshapes) {
      reset[bs.name] = 0;
      applyBlendshapeValue(sceneRef.current, bs.name, 0);
    }
    setValues(reset);
  }, [blendshapes]);

  const filterLower = filter.toLowerCase();
  const filtered = filter
    ? blendshapes.filter((bs) => bs.name.toLowerCase().includes(filterLower))
    : blendshapes;

  const activeCount = Object.values(values).filter((v) => v > 0).length;

  return (
    <div className="absolute top-4 right-4 w-72 max-h-[calc(100%-2rem)] flex flex-col bg-black/70 backdrop-blur-md text-white text-xs rounded-lg overflow-hidden z-30">
      {/* Header */}
      <button
        className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="font-medium text-sm">
          Blendshapes
          <span className="ml-1.5 text-neutral-400 font-normal">
            ({blendshapes.length})
          </span>
          {activeCount > 0 && (
            <span className="ml-1 text-blue-400 font-normal">
              {activeCount} active
            </span>
          )}
        </span>
        <span className="text-neutral-400 text-[10px]">
          {collapsed ? '\u25B6' : '\u25BC'}
        </span>
      </button>

      {!collapsed && (
        <>
          {/* Search + Reset */}
          <div className="flex items-center gap-1.5 px-3 pb-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter..."
              className="flex-1 bg-white/10 rounded px-2 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-blue-400/50"
            />
            {activeCount > 0 && (
              <button
                onClick={handleResetAll}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-neutral-300 transition-colors whitespace-nowrap"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Slider list */}
          <div className="overflow-y-auto flex-1 px-3 pb-2 space-y-1.5 scrollbar-thin">
            {filtered.map((bs) => (
              <BlendshapeSlider
                key={bs.name}
                name={bs.name}
                value={values[bs.name] ?? 0}
                onChange={handleChange}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-neutral-500 py-2 text-center">No matches</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface BlendshapeSliderProps {
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
}

const BlendshapeSlider: React.FC<BlendshapeSliderProps> = React.memo(
  ({ name, value, onChange }) => {
    const displayValue = (value * 100).toFixed(0);
    const isActive = value > 0;

    return (
      <div className="group">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`truncate mr-2 ${isActive ? 'text-blue-300' : 'text-neutral-300'}`}
            title={name}
          >
            {name}
          </span>
          <span className={`tabular-nums w-8 text-right ${isActive ? 'text-blue-400' : 'text-neutral-500'}`}>
            {displayValue}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(name, parseFloat(e.target.value))}
          className="w-full h-1 appearance-none bg-neutral-700 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-400
            [&::-webkit-slider-thumb]:hover:bg-blue-300
            [&::-webkit-slider-thumb]:transition-colors"
        />
      </div>
    );
  },
);
