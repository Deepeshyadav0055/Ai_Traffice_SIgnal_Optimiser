import { Lane } from '../types/traffic';
import { Car } from 'lucide-react';

interface IntersectionViewProps {
  lanes: Lane[];
}

export default function IntersectionView({ lanes }: IntersectionViewProps) {
  const getLightColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 shadow-lg shadow-green-500/50';
      case 'yellow':
        return 'bg-yellow-500 shadow-lg shadow-yellow-500/50';
      case 'red':
        return 'bg-red-500 shadow-lg shadow-red-500/50';
      default:
        return 'bg-slate-600';
    }
  };

  const renderCars = (lane: Lane, position: string) => {
    const carCount = Math.min(lane.vehicleCount, 8);
    const cars = [];

    for (let i = 0; i < carCount; i++) {
      cars.push(
        <div
          key={i}
          className={`car-icon ${position} ${lane.lightColor === 'green' ? 'moving' : 'stopped'}`}
          style={{
            animationDelay: `${i * 0.3}s`
          }}
        >
          <Car className="w-4 h-4 text-cyan-400" />
        </div>
      );
    }
    return cars;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 h-full flex items-center justify-center">
      <div className="relative w-full max-w-2xl aspect-square">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-slate-800/30 rounded-lg"></div>

            <div className="absolute left-1/2 top-0 w-32 h-1/2 -translate-x-1/2 bg-slate-700/50">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2">
                <div className="flex flex-col gap-1 bg-slate-900 p-2 rounded">
                  <div className={`w-4 h-4 rounded-full ${lanes[0].lightColor === 'red' ? getLightColor('red') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[0].lightColor === 'yellow' ? getLightColor('yellow') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[0].lightColor === 'green' ? getLightColor('green') : 'bg-slate-700'}`}></div>
                </div>
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col gap-2">
                {renderCars(lanes[0], 'road-north')}
              </div>
            </div>

            <div className="absolute right-0 top-1/2 w-1/2 h-32 -translate-y-1/2 bg-slate-700/50">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-2">
                <div className="flex gap-1 bg-slate-900 p-2 rounded">
                  <div className={`w-4 h-4 rounded-full ${lanes[1].lightColor === 'red' ? getLightColor('red') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[1].lightColor === 'yellow' ? getLightColor('yellow') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[1].lightColor === 'green' ? getLightColor('green') : 'bg-slate-700'}`}></div>
                </div>
              </div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2">
                {renderCars(lanes[1], 'road-east')}
              </div>
            </div>

            <div className="absolute left-1/2 bottom-0 w-32 h-1/2 -translate-x-1/2 bg-slate-700/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2">
                <div className="flex flex-col gap-1 bg-slate-900 p-2 rounded">
                  <div className={`w-4 h-4 rounded-full ${lanes[2].lightColor === 'red' ? getLightColor('red') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[2].lightColor === 'yellow' ? getLightColor('yellow') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[2].lightColor === 'green' ? getLightColor('green') : 'bg-slate-700'}`}></div>
                </div>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-2">
                {renderCars(lanes[2], 'road-south')}
              </div>
            </div>

            <div className="absolute left-0 top-1/2 w-1/2 h-32 -translate-y-1/2 bg-slate-700/50">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
                <div className="flex gap-1 bg-slate-900 p-2 rounded">
                  <div className={`w-4 h-4 rounded-full ${lanes[3].lightColor === 'red' ? getLightColor('red') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[3].lightColor === 'yellow' ? getLightColor('yellow') : 'bg-slate-700'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${lanes[3].lightColor === 'green' ? getLightColor('green') : 'bg-slate-700'}`}></div>
                </div>
              </div>
              <div className="absolute left-8 top-1/2 -translate-y-1/2 flex gap-2">
                {renderCars(lanes[3], 'road-west')}
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-4 border-yellow-500/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-semibold">INTERSECTION</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-4 py-1 rounded-full border border-cyan-500/30">
          <span className="text-xs font-semibold text-cyan-400">{lanes[0].name}</span>
        </div>
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 bg-slate-800 px-4 py-1 rounded-full border border-cyan-500/30">
          <span className="text-xs font-semibold text-cyan-400">{lanes[1].name}</span>
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 px-4 py-1 rounded-full border border-cyan-500/30">
          <span className="text-xs font-semibold text-cyan-400">{lanes[2].name}</span>
        </div>
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-slate-800 px-4 py-1 rounded-full border border-cyan-500/30">
          <span className="text-xs font-semibold text-cyan-400">{lanes[3].name}</span>
        </div>
      </div>
    </div>
  );
}
