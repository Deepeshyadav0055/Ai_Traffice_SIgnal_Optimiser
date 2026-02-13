import { Lane, TrafficMode, LightColor } from '../types/traffic';

export const calculatePriorityScore = (vehicleCount: number, waitingTime: number): number => {
  return vehicleCount + waitingTime * 0.5;
};

export const getHighestPriorityLane = (lanes: Lane[]): Lane => {
  return lanes.reduce((highest, current) => {
    const currentScore = calculatePriorityScore(current.vehicleCount, current.waitingTime);
    const highestScore = calculatePriorityScore(highest.vehicleCount, highest.waitingTime);
    return currentScore > highestScore ? current : highest;
  });
};

export const calculateDynamicGreenTime = (priorityScore: number): number => {
  const baseTime = 10;
  const scalingFactor = priorityScore * 0.3;
  return Math.min(baseTime + scalingFactor, 30);
};

export const updateLaneMetrics = (
  lanes: Lane[],
  mode: TrafficMode,
  currentLaneIndex: number,
  deltaTime: number
): Lane[] => {
  return lanes.map((lane, index) => {
    const isGreen = index === currentLaneIndex;
    let newVehicleCount = lane.vehicleCount;
    let newWaitingTime = lane.waitingTime;
    let newVehiclesCleared = lane.vehiclesCleared;
    let newTotalWaitTime = lane.totalWaitTime;

    if (isGreen) {
      const vehiclesToClear = Math.min(lane.vehicleCount, Math.floor(deltaTime * 2));
      newVehicleCount = Math.max(0, lane.vehicleCount - vehiclesToClear);
      newVehiclesCleared = lane.vehiclesCleared + vehiclesToClear;
      newWaitingTime = 0;
    } else {
      if (lane.vehicleCount > 0) {
        newWaitingTime = lane.waitingTime + deltaTime;
        newTotalWaitTime = lane.totalWaitTime + deltaTime * lane.vehicleCount;
      }
    }

    const newPriorityScore = calculatePriorityScore(newVehicleCount, newWaitingTime);

    return {
      ...lane,
      vehicleCount: newVehicleCount,
      waitingTime: newWaitingTime,
      priorityScore: newPriorityScore,
      vehiclesCleared: newVehiclesCleared,
      totalWaitTime: newTotalWaitTime,
    };
  });
};

export const updateTrafficLights = (
  lanes: Lane[],
  currentLaneIndex: number,
  transitionState: 'green' | 'yellow' | 'transitioning'
): Lane[] => {
  return lanes.map((lane, index) => {
    let lightColor: LightColor;

    if (index === currentLaneIndex) {
      if (transitionState === 'green') {
        lightColor = 'green';
      } else if (transitionState === 'yellow') {
        lightColor = 'yellow';
      } else {
        lightColor = 'red';
      }
    } else {
      lightColor = 'red';
    }

    return {
      ...lane,
      lightColor,
    };
  });
};

export const getNextLaneIndex = (
  lanes: Lane[],
  currentIndex: number,
  mode: TrafficMode
): number => {
  if (mode === 'fixed') {
    return (currentIndex + 1) % lanes.length;
  }

  const lanesWithVehicles = lanes.filter(lane => lane.vehicleCount > 0);

  if (lanesWithVehicles.length === 0) {
    return (currentIndex + 1) % lanes.length;
  }

  const highestPriorityLane = getHighestPriorityLane(lanesWithVehicles);
  return lanes.findIndex(lane => lane.id === highestPriorityLane.id);
};

export const initializeLanes = (): Lane[] => {
  return [
    {
      id: 'road1',
      name: 'Road 1 (North)',
      vehicleCount: 15,
      waitingTime: 0,
      priorityScore: 0,
      lightColor: 'green',
      vehiclesCleared: 0,
      totalWaitTime: 0,
    },
    {
      id: 'road2',
      name: 'Road 2 (East)',
      vehicleCount: 20,
      waitingTime: 0,
      priorityScore: 0,
      lightColor: 'red',
      vehiclesCleared: 0,
      totalWaitTime: 0,
    },
    {
      id: 'road3',
      name: 'Road 3 (South)',
      vehicleCount: 10,
      waitingTime: 0,
      priorityScore: 0,
      lightColor: 'red',
      vehiclesCleared: 0,
      totalWaitTime: 0,
    },
    {
      id: 'road4',
      name: 'Road 4 (West)',
      vehicleCount: 25,
      waitingTime: 0,
      priorityScore: 0,
      lightColor: 'red',
      vehiclesCleared: 0,
      totalWaitTime: 0,
    },
  ];
};

export const addRandomTraffic = (lanes: Lane[]): Lane[] => {
  return lanes.map(lane => ({
    ...lane,
    vehicleCount: Math.min(50, lane.vehicleCount + Math.floor(Math.random() * 3)),
  }));
};
