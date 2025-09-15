import React from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StepForwardIcon } from './icons/StepForwardIcon';

interface VisualizationControlsProps {
  status: 'idle' | 'sorting' | 'paused' | 'sorted';
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  minSize?: number;
  maxSize?: number;

  speed: number;
  onSpeedChange: (speed: number) => void;
  minSpeed?: number;
  maxSpeed?: number;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  status,
  onPlayPause,
  onStep,
  onReset,
  arraySize,
  onArraySizeChange,
  minSize = 5,
  maxSize = 30,
  speed,
  onSpeedChange,
  minSpeed = 1,
  maxSpeed = 100,
}) => {
  const isRunning = status === 'sorting';
  const isFinished = status === 'sorted';
  const canStep = status === 'idle' || status === 'paused';
  const isSettingsDisabled = status === 'sorting' || status === 'paused';

  return (
    <div className="w-full pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayPause}
          disabled={isFinished}
          className="w-28 px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          {isRunning ? 'Pause' : isFinished ? 'Sorted!' : 'Start'}
        </button>
        <button
          onClick={onStep}
          disabled={!canStep || isFinished}
          className="p-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Step Forward"
        >
          <StepForwardIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-48">
          <label htmlFor="size" className="text-xs text-text-secondary whitespace-nowrap">Size</label>
          <input
            id="size"
            type="range"
            min={minSize}
            max={maxSize}
            value={arraySize}
            onChange={(e) => onArraySizeChange(Number(e.target.value))}
            disabled={isSettingsDisabled}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm font-mono w-6 text-right">{arraySize}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-48">
          <label htmlFor="speed" className="text-xs text-text-secondary whitespace-nowrap">Speed</label>
          <input
            id="speed"
            type="range"
            min={minSpeed}
            max={maxSpeed}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
};
