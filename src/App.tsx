import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import IntersectionView from './components/IntersectionView';
import MetricsPanel from './components/MetricsPanel';
import ComparisonCharts from './components/ComparisonCharts';
import { TrafficMode, SimulationState, ChartDataPoint } from './types/traffic';
import {
  initializeLanes,
  updateLaneMetrics,
  updateTrafficLights,
  getNextLaneIndex,
  calculateDynamicGreenTime,
  addRandomTraffic,
} from './utils/simulation';

function App() {
  const [mode, setMode] = useState<TrafficMode>('fixed');
  const [simulationState, setSimulationState] = useState<SimulationState>('idle');
  const [lanes, setLanes] = useState(initializeLanes());
  const [currentLaneIndex, setCurrentLaneIndex] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [transitionState, setTransitionState] = useState<'green' | 'yellow' | 'transitioning'>('green');
  const [simulationTime, setSimulationTime] = useState(0);
  const [waitingTimeData, setWaitingTimeData] = useState<ChartDataPoint[]>([]);
  const [vehiclesClearedData, setVehiclesClearedData] = useState<ChartDataPoint[]>([]);

  const fixedModeDataRef = useRef({ waitTime: 0, cleared: 0, count: 0 });
  const aiModeDataRef = useRef({ waitTime: 0, cleared: 0, count: 0 });

  const GREEN_DURATION_FIXED = 30;
  const YELLOW_DURATION = 3;
  const TICK_INTERVAL = 100;

  useEffect(() => {
    if (simulationState !== 'running') return;

    const interval = setInterval(() => {
      const deltaTime = TICK_INTERVAL / 1000;

      setSimulationTime(prev => prev + deltaTime);
      setPhaseTimer(prev => prev + deltaTime);

      setLanes(prevLanes => {
        const updatedLanes = updateLaneMetrics(prevLanes, mode, currentLaneIndex, deltaTime);

        const avgWaitTime = updatedLanes.reduce((sum, lane) => sum + lane.waitingTime, 0) / updatedLanes.length;
        const totalCleared = updatedLanes.reduce((sum, lane) => sum + lane.vehiclesCleared, 0);

        if (mode === 'fixed') {
          fixedModeDataRef.current.waitTime += avgWaitTime;
          fixedModeDataRef.current.cleared = totalCleared;
          fixedModeDataRef.current.count += 1;
        } else {
          aiModeDataRef.current.waitTime += avgWaitTime;
          aiModeDataRef.current.cleared = totalCleared;
          aiModeDataRef.current.count += 1;
        }

        return updatedLanes;
      });

      setLanes(prevLanes => {
        if (Math.random() < 0.05) {
          return addRandomTraffic(prevLanes);
        }
        return prevLanes;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [simulationState, currentLaneIndex, mode]);

  useEffect(() => {
    if (simulationState !== 'running') return;

    const greenDuration = mode === 'fixed'
      ? GREEN_DURATION_FIXED
      : calculateDynamicGreenTime(lanes[currentLaneIndex].priorityScore);

    if (transitionState === 'green' && phaseTimer >= greenDuration) {
      setTransitionState('yellow');
      setPhaseTimer(0);
    } else if (transitionState === 'yellow' && phaseTimer >= YELLOW_DURATION) {
      setTransitionState('transitioning');
      const nextIndex = getNextLaneIndex(lanes, currentLaneIndex, mode);
      setCurrentLaneIndex(nextIndex);
      setPhaseTimer(0);
      setTimeout(() => setTransitionState('green'), 500);
    }
  }, [phaseTimer, transitionState, mode, lanes, currentLaneIndex, simulationState]);

  useEffect(() => {
    setLanes(prevLanes => updateTrafficLights(prevLanes, currentLaneIndex, transitionState));
  }, [currentLaneIndex, transitionState]);

  useEffect(() => {
    if (simulationState !== 'running') return;

    const chartUpdateInterval = setInterval(() => {
      const fixedAvg = fixedModeDataRef.current.count > 0
        ? fixedModeDataRef.current.waitTime / fixedModeDataRef.current.count
        : 0;
      const aiAvg = aiModeDataRef.current.count > 0
        ? aiModeDataRef.current.waitTime / aiModeDataRef.current.count
        : 0;

      setWaitingTimeData(prev => {
        const newData = [...prev, {
          time: simulationTime,
          fixed: fixedAvg,
          ai: aiAvg,
        }];
        return newData.slice(-50);
      });

      setVehiclesClearedData(prev => {
        const newData = [...prev, {
          time: simulationTime,
          fixed: fixedModeDataRef.current.cleared,
          ai: aiModeDataRef.current.cleared,
        }];
        return newData.slice(-50);
      });
    }, 1000);

    return () => clearInterval(chartUpdateInterval);
  }, [simulationState, simulationTime]);

  const handleStart = () => {
    setSimulationState('running');
  };

  const handlePause = () => {
    setSimulationState('paused');
  };

  const handleReset = () => {
    setSimulationState('idle');
    setLanes(initializeLanes());
    setCurrentLaneIndex(0);
    setPhaseTimer(0);
    setTransitionState('green');
    setSimulationTime(0);
    setWaitingTimeData([]);
    setVehiclesClearedData([]);
    fixedModeDataRef.current = { waitTime: 0, cleared: 0, count: 0 };
    aiModeDataRef.current = { waitTime: 0, cleared: 0, count: 0 };
  };

  const handleDensityChange = (laneId: string, value: number) => {
    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === laneId ? { ...lane, vehicleCount: value } : lane
      )
    );
  };

  const handleModeChange = (newMode: TrafficMode) => {
    setMode(newMode);
    handleReset();
  };

  const currentGreenLane = lanes[currentLaneIndex]?.name || 'None';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header mode={mode} onModeChange={handleModeChange} />

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-3">
            <ControlPanel
              simulationState={simulationState}
              lanes={lanes}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onDensityChange={handleDensityChange}
            />
          </div>

          <div className="lg:col-span-6">
            <IntersectionView lanes={lanes} />
          </div>

          <div className="lg:col-span-3">
            <MetricsPanel
              lanes={lanes}
              mode={mode}
              currentGreenLane={currentGreenLane}
            />
          </div>
        </div>

        <ComparisonCharts
          waitingTimeData={waitingTimeData}
          vehiclesClearedData={vehiclesClearedData}
        />
      </div>
    </div>
  );
}

export default App;
