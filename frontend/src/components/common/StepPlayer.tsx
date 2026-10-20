import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface StepPlayerProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  onReset?: () => void;
  speedMs?: number;
}

export const StepPlayer: React.FC<StepPlayerProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  onReset,
  speedMs = 1000,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(speedMs);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentStep < totalSteps - 1) {
          onStepChange(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, totalSteps, speed, onStepChange]);

  const handleFirst = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 0) onStepChange(currentStep - 1);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStep < totalSteps - 1) onStepChange(currentStep + 1);
  };

  const handleLast = () => {
    setIsPlaying(false);
    onStepChange(totalSteps - 1);
  };

  const togglePlay = () => {
    if (currentStep >= totalSteps - 1) {
      onStepChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleFirst}
          disabled={currentStep === 0}
          className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
          title="First Step (Home)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
          title="Previous Step (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
          title={isPlaying ? "Pause" : "Play step trace"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep >= totalSteps - 1}
          className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
          title="Next Step (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleLast}
          disabled={currentStep >= totalSteps - 1}
          className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
          title="Last Step (End)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {onReset && (
          <button
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            className="p-2 ml-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bold text-cyan-600 dark:text-cyan-400 shadow-inner">
          Step {totalSteps > 0 ? currentStep + 1 : 0} <span className="text-slate-500 font-normal">/</span> {totalSteps}
        </span>

        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 uppercase font-semibold font-sans">Speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-transparent text-slate-700 dark:text-slate-200 font-mono text-xs cursor-pointer focus:outline-none"
          >
            <option value={2000}>0.5x</option>
            <option value={1000}>1.0x</option>
            <option value={500}>2.0x</option>
            <option value={250}>4.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
