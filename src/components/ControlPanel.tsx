import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Lane, SimulationState } from '../types/traffic';

interface ControlPanelProps {
  simulationState: SimulationState;
  lanes: Lane[];
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDensityChange: (laneId: string, value: number) => void;
}

export default function ControlPanel({
  simulationState,
  lanes,
  onStart,
  onPause,
  onReset,
  onDensityChange,
}: ControlPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Control Panel</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Simulation Controls</h3>
          <div className="flex gap-2">
            {simulationState === 'running' ? (
              <button
                onClick={onPause}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={onStart}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Traffic Density Control</h3>
          <div className="space-y-4">
            {lanes.map((lane) => (
              <div key={lane.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">{lane.name}</label>
                  <span className="text-sm font-bold text-cyan-400">{lane.vehicleCount} cars</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={lane.vehicleCount}
                  onChange={(e) => onDensityChange(lane.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(lane.vehicleCount / 50) * 100}%, #334155 ${(lane.vehicleCount / 50) * 100}%, #334155 100%)`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-700/50">
          <h3 className="text-sm font-semibold text-cyan-300 mb-2">AI Optimization Info</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI mode calculates priority scores based on vehicle count and waiting time,
            dynamically allocating green lights to reduce congestion by 25-40%.
          </p>
        </div>
      </div>
    </div>
  );
}
