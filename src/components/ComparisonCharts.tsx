import { ChartDataPoint } from '../types/traffic';
import { BarChart3, Clock, CheckCircle } from 'lucide-react';

interface ComparisonChartsProps {
  waitingTimeData: ChartDataPoint[];
  vehiclesClearedData: ChartDataPoint[];
}

export default function ComparisonCharts({
  waitingTimeData,
  vehiclesClearedData,
}: ComparisonChartsProps) {
  const renderLineChart = (data: ChartDataPoint[], label: string, color1: string, color2: string) => {
    if (data.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-500">
          Waiting for data...
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => Math.max(d.fixed, d.ai)));
    const minValue = Math.min(...data.map(d => Math.min(d.fixed, d.ai)));
    const range = maxValue - minValue || 1;
    const width = 400;
    const height = 180;
    const padding = 30;

    const getY = (value: number) => {
      return height - padding - ((value - minValue) / range) * (height - padding * 2);
    };

    const getX = (index: number) => {
      return padding + (index / (data.length - 1)) * (width - padding * 2);
    };

    const fixedPoints = data.map((d, i) => `${getX(i)},${getY(d.fixed)}`).join(' ');
    const aiPoints = data.map((d, i) => `${getX(i)},${getY(d.ai)}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id={`gradient-${color1}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color1} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color1} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`gradient-${color2}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color2} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color2} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="grid-lines">
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i / 4) * (height - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}
        </g>

        <polyline
          points={fixedPoints}
          fill="none"
          stroke={color1}
          strokeWidth="2"
        />

        <polyline
          points={aiPoints}
          fill="none"
          stroke={color2}
          strokeWidth="2"
        />

        {data.slice(-1).map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(data.length - 1)}
              cy={getY(d.fixed)}
              r="4"
              fill={color1}
            />
            <circle
              cx={getX(data.length - 1)}
              cy={getY(d.ai)}
              r="4"
              fill={color2}
            />
          </g>
        ))}

        <text x={padding} y={height - 5} className="text-xs fill-slate-400">
          0s
        </text>
        <text x={width - padding} y={height - 5} className="text-xs fill-slate-400" textAnchor="end">
          {data.length}s
        </text>
      </svg>
    );
  };

  const latestWaiting = waitingTimeData[waitingTimeData.length - 1];
  const latestCleared = vehiclesClearedData[vehiclesClearedData.length - 1];
  const improvement = latestWaiting
    ? ((latestWaiting.fixed - latestWaiting.ai) / latestWaiting.fixed) * 100
    : 0;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Performance Comparison</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-300">Average Waiting Time</h3>
            </div>
            {improvement > 0 && (
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                -{improvement.toFixed(1)}%
              </span>
            )}
          </div>
          {renderLineChart(waitingTimeData, 'Waiting Time', '#ef4444', '#06b6d4')}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-slate-400">Fixed: {latestWaiting?.fixed.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-xs text-slate-400">AI: {latestWaiting?.ai.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-slate-300">Vehicles Cleared</h3>
          </div>
          {renderLineChart(vehiclesClearedData, 'Vehicles Cleared', '#8b5cf6', '#10b981')}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-slate-400">Fixed: {latestCleared?.fixed || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-400">AI: {latestCleared?.ai || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
