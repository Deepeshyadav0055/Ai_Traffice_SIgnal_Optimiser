export type TrafficMode = 'fixed' | 'ai';
export type SimulationState = 'idle' | 'running' | 'paused';
export type LaneId = 'road1' | 'road2' | 'road3' | 'road4';
export type LightColor = 'red' | 'yellow' | 'green';

export interface Lane {
  id: LaneId;
  name: string;
  vehicleCount: number;
  waitingTime: number;
  priorityScore: number;
  lightColor: LightColor;
  vehiclesCleared: number;
  totalWaitTime: number;
}

export interface SimulationMetrics {
  totalVehiclesCleared: number;
  averageWaitingTime: number;
  timestamp: number;
}

export interface ChartDataPoint {
  time: number;
  fixed: number;
  ai: number;
}
