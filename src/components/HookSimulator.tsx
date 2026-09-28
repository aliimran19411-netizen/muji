import React, { useState } from 'react';
import { AdHook } from '../types';
import { Play, RotateCcw, Copy, Check, Star, Zap, Gauge } from 'lucide-react';

interface HookSimulatorProps {
  hooks: AdHook[];
  selectedHookId: number;
  onSelectHook: (hook: AdHook) => void;
}

export const HookSimulator: React.FC<HookSimulatorProps> = ({
  hooks,
  selectedHookId,
  onSelectHook,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedIndex, setSimulatedIndex] = useState<number | null>(null);

  const handleCopy = (hook: AdHook, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hook.hookText);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runScrollSimulation = () => {
    if (hooks.length === 0 || isSimulating) return;
    setIsSimulating(true);
    setSimulatedIndex(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count < hooks.length) {
        setSimulatedIndex(count);
      } else {
        clearInterval(interval);
        // Find highest rated hook or pick random
        const highest = [...hooks].sort((a, b) => (b.scrollStopRating || 90) - (a.scrollStopRating || 90))[0];
        setSimulatedIndex(hooks.findIndex(h => h.id === highest.id));
        onSelectHook(highest);
        setIsSimulating(false);
      }
    }, 450);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Hook Impact & Scroll-Stop Benchmarking
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any hook to load it into the live ad mockup or run the 3-second rapid feed simulator.
          </p>
        </div>

        <button
          onClick={runScrollSimulation}
          disabled={isSimulating || hooks.length === 0}
          className="text-xs font-semibold px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              Simulating Feed...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Simulate Feed Scroll
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {hooks.map((hook, index) => {
          const isSelected = selectedHookId === hook.id;
          const isCurrentInSimulation = simulatedIndex === index;
          const rating = hook.scrollStopRating || (95 - index * 3);

          return (
            <div
              key={hook.id || index}
              onClick={() => onSelectHook(hook)}
              className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                  : isCurrentInSimulation
                  ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-400'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    0{index + 1}.
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {hook.angle}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" /> Active in Preview
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">{rating}%</span>
                    <span className="hidden sm:inline text-slate-500">stop rate</span>
                  </div>

                  <button
                    onClick={(e) => handleCopy(hook, e)}
                    title="Copy hook to clipboard"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    {copiedId === hook.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-white leading-snug tracking-tight">
                "{hook.hookText}"
              </p>

              <div className="mt-2 text-xs text-slate-400 leading-normal flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>
                  <strong className="text-slate-300">Why it works:</strong> {hook.whyItWorks}
                </span>
                <span className="text-[11px] text-slate-500 shrink-0 ml-3 font-mono">
                  {hook.hookText.length} chars
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
