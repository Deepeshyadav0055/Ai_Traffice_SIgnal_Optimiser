import { Lane, TrafficMode } from '../types/traffic';
import { Activity, Clock, TrendingUp, Car } from 'lucide-react';

interface MetricsPanelProps {
  lanes: Lane[];
  mode: TrafficMode;
  currentGreenLane: string;
}

export default function MetricsPanel({ lanes, mode, currentGreenLane }: MetricsPanelProps) {
  const totalVehicles = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0);
  const averageWaitTime = lanes.reduce((sum, lane) => sum + lane.waitingTime, 0) / lanes.length;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Live Metrics</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-cyan-300">Current Mode</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {mode === 'ai' ? 'AI Optimization' : 'Fixed Timing'}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-slate-300">Active Green Lane</h3>
          </div>
          <p className="text-xl font-bold text-green-400">{currentGreenLane}</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-300">Vehicles Per Lane</h3>
          </div>
          <div className="space-y-3">
            {lanes.map((lane) => (
              <div key={lane.id} className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{lane.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${(lane.vehicleCount / 50) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8 text-right">
                    {lane.vehicleCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-slate-300">Waiting Time (seconds)</h3>
          </div>
          <div className="space-y-3">
            {lanes.map((lane) => (
              <div key={lane.id} className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{lane.name}</span>
                <span className="text-sm font-bold text-yellow-400">
                  {lane.waitingTime.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-300">Priority Scores</h3>
          </div>
          <div className="space-y-3">
            {lanes.map((lane) => (
              <div key={lane.id} className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{lane.name}</span>
                <span className="text-sm font-bold text-purple-400">
                  {lane.priorityScore.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Total Vehicles</p>
            <p className="text-xl font-bold text-cyan-400">{totalVehicles}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Avg Wait</p>
            <p className="text-xl font-bold text-yellow-400">{averageWaitTime.toFixed(1)}s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
