import { TrafficMode } from '../types/traffic';
import { Zap, Clock } from 'lucide-react';

interface HeaderProps {
  mode: TrafficMode;
  onModeChange: (mode: TrafficMode) => void;
}

export default function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/30 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Traffic vs Organic Traffic Dashboard
            </h1>
            <p className="text-sm text-slate-400">Smart City Traffic Control System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => onModeChange('fixed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              mode === 'fixed'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-medium">Fixed Timing</span>
          </button>
          <button
            onClick={() => onModeChange('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">AI Optimization</span>
          </button>
        </div>
      </div>
    </header>
  );
}
