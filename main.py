"""
AI Traffic Signal Optimizer - Backend API
Real-time vehicle detection data to dynamically adjust traffic signal timings.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="AI Traffic Signal Optimizer API",
    description="Backend for dynamic traffic signal timing based on real-time vehicle density",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ CONSTANTS ============
MIN_GREEN = 15
MAX_GREEN = 90
YELLOW_DURATION = 3
ALL_RED_CLEARANCE = 2

VEHICLE_WEIGHTS = {
    "bike": 0.5,
    "car": 1.0,
    "truck": 2.0,
    "bus": 2.0,
}


# ============ DATA MODELS ============
class LaneDirection(str, Enum):
    NORTH = "North"
    SOUTH = "South"
    EAST = "East"
    WEST = "West"


class VehicleCounts(BaseModel):
    bikes: int = Field(0, ge=0, description="Number of bikes")
    cars: int = Field(0, ge=0, description="Number of cars")
    trucks: int = Field(0, ge=0, description="Number of trucks")
    buses: int = Field(0, ge=0, description="Number of buses")


class LaneData(BaseModel):
    direction: LaneDirection
    vehicles: VehicleCounts
    timestamp: Optional[datetime] = None
    source: Optional[str] = Field("manual", description="camera | iot | manual")


class TrafficInput(BaseModel):
    """Input from camera, IoT sensors, or manual entry"""
    lanes: list[LaneData]
    intersection_id: Optional[str] = Field("default", description="Intersection identifier")


class LaneDensity(BaseModel):
    direction: LaneDirection
    density_score: float
    vehicle_counts: VehicleCounts
    weighted_equivalents: float


class SignalPhase(BaseModel):
    priority_lane: LaneDirection
    green_duration_seconds: float
    yellow_duration_seconds: float = YELLOW_DURATION
    all_red_duration_seconds: float = ALL_RED_CLEARANCE
    density_scores: list[LaneDensity]
    reasoning: str


# ============ CORE ALGORITHMS ============
def calculate_density_score(vehicles: VehicleCounts) -> float:
    """
    Vehicle Weighting: Different vehicles occupy different space and time.
    density_score = (bikes * 0.5) + (cars * 1.0) + (trucks * 2.0) + (buses * 2.0)
    """
    return (
        vehicles.bikes * VEHICLE_WEIGHTS["bike"]
        + vehicles.cars * VEHICLE_WEIGHTS["car"]
        + vehicles.trucks * VEHICLE_WEIGHTS["truck"]
        + vehicles.buses * VEHICLE_WEIGHTS["bus"]
    )


def compute_signal_timing(
    lanes: list[LaneData],
) -> SignalPhase:
    """
    Dynamic Signal Adjustment Algorithm:
    1. Calculate density score for all lanes
    2. Find lane with highest density (priority lane)
    3. Calculate green time for priority lane (proportional to density, clamped min/max)
    4. Return signal phase with timing recommendations
    """
    if not lanes:
        raise ValueError("No lane data provided")

    # Step 1: Calculate density for each lane
    densities: list[LaneDensity] = []
    for lane in lanes:
        score = calculate_density_score(lane.vehicles)
        densities.append(
            LaneDensity(
                direction=lane.direction,
                density_score=score,
                vehicle_counts=lane.vehicles,
                weighted_equivalents=score,
            )
        )

    # Step 2: Find priority lane (highest density)
    priority = max(densities, key=lambda d: d.density_score)
    total_density = sum(d.density_score for d in densities)

    # Step 3: Calculate green time for priority lane
    # Formula: green = min_green + (priority_share * available_range)
    # priority_share = priority_density / total_density (0 to 1)
    # This extends green for high-density lanes while ensuring min duration
    available_range = MAX_GREEN - MIN_GREEN
    priority_share = (
        priority.density_score / total_density if total_density > 0 else 0.25
    )
    green_duration = MIN_GREEN + (available_range * priority_share)
    green_duration = max(MIN_GREEN, min(MAX_GREEN, green_duration))

    reasoning = (
        f"Lane {priority.direction.value} has highest density ({priority.density_score:.1f} "
        f"weighted units, {priority_share*100:.0f}% of total). "
        f"Allocated {green_duration:.0f}s green (range: {MIN_GREEN}-{MAX_GREEN}s)."
    )

    return SignalPhase(
        priority_lane=priority.direction,
        green_duration_seconds=round(green_duration, 1),
        density_scores=densities,
        reasoning=reasoning,
    )


# ============ API ENDPOINTS ============
@app.get("/")
def root():
    return {
        "service": "AI Traffic Signal Optimizer",
        "version": "1.0",
        "endpoints": {
            "optimize": "POST /api/optimize",
            "health": "GET /health",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/optimize", response_model=SignalPhase)
def optimize_signals(traffic: TrafficInput) -> SignalPhase:
    """
    Accept real-time vehicle count data and return optimized signal timing.
    Supports data from: Camera/CV, IoT sensors, Manual input.
    """
    if len(traffic.lanes) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 lanes required for optimization",
        )

    # Ensure we have all 4 directions (fill missing with zeros)
    directions = {LaneDirection.NORTH, LaneDirection.SOUTH, LaneDirection.EAST, LaneDirection.WEST}
    lane_map = {l.direction: l for l in traffic.lanes}
    
    complete_lanes = []
    for d in [LaneDirection.NORTH, LaneDirection.EAST, LaneDirection.SOUTH, LaneDirection.WEST]:
        if d in lane_map:
            complete_lanes.append(lane_map[d])
        else:
            complete_lanes.append(
                LaneData(direction=d, vehicles=VehicleCounts(), source="defaulted")
            )

    return compute_signal_timing(complete_lanes)


class SimpleOptimizeRequest(BaseModel):
    """Simplified request: vehicles array [North, East, South, West]"""
    vehicles: list[int] = Field(..., min_length=4, max_length=4)


@app.post("/api/optimize/vehicles")
def optimize_vehicles(req: SimpleOptimizeRequest):
    """
    Simplified endpoint: pass vehicle counts [North, East, South, West].
    All counts treated as cars. Returns priority lane index (0-3) and green duration.
    """
    north, east, south, west = req.vehicles[:4]
    traffic = TrafficInput(
        lanes=[
            LaneData(direction=LaneDirection.NORTH, vehicles=VehicleCounts(cars=north)),
            LaneData(direction=LaneDirection.EAST, vehicles=VehicleCounts(cars=east)),
            LaneData(direction=LaneDirection.SOUTH, vehicles=VehicleCounts(cars=south)),
            LaneData(direction=LaneDirection.WEST, vehicles=VehicleCounts(cars=west)),
        ]
    )
    result = compute_signal_timing(traffic.lanes)
    direction_to_index = {
        LaneDirection.NORTH: 0,
        LaneDirection.EAST: 1,
        LaneDirection.SOUTH: 2,
        LaneDirection.WEST: 3,
    }
    return {
        "priority_lane_index": direction_to_index[result.priority_lane],
        "priority_lane": result.priority_lane.value,
        "green_duration_ms": int(result.green_duration_seconds * 1000),
        "green_duration_seconds": result.green_duration_seconds,
        "density_scores": [d.density_score for d in result.density_scores],
        "reasoning": result.reasoning,
    }


@app.post("/api/optimize/simple")
def optimize_simple(
    north: int = 0, south: int = 0, east: int = 0, west: int = 0
):
    """
    Simplified endpoint: pass vehicle counts per lane (treated as cars).
    Useful for quick testing and frontend integration.
    """
    traffic = TrafficInput(
        lanes=[
            LaneData(direction=LaneDirection.NORTH, vehicles=VehicleCounts(cars=north)),
            LaneData(direction=LaneDirection.EAST, vehicles=VehicleCounts(cars=east)),
            LaneData(direction=LaneDirection.SOUTH, vehicles=VehicleCounts(cars=south)),
            LaneData(direction=LaneDirection.WEST, vehicles=VehicleCounts(cars=west)),
        ]
    )
    return compute_signal_timing(traffic.lanes)
