# AI Traffic Signal Optimizer - Backend API

Real-time vehicle detection backend that dynamically adjusts traffic signal timings based on weighted traffic density.

## Features

- **Data Input**: Accepts vehicle counts from camera/CV, IoT sensors, or manual input
- **Vehicle Weighting**: Bike (0.5), Car (1.0), Truck/Bus (2.0)
- **Dynamic Timing**: Min green 15s, Max green 90s, Yellow 3s, All-red 2s
- **Priority Algorithm**: Allocates green time to the highest-density lane

## Setup

```bash
cd ai-traffic-signal/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/api/optimize` | Full optimization with vehicle types per lane |
| POST | `/api/optimize/vehicles` | Simple: `{"vehicles": [north, east, south, west]}` |
| POST | `/api/optimize/simple` | Query params: `?north=10&east=20&south=5&west=15` |

## Example: Full optimize

```bash
curl -X POST http://127.0.0.1:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "lanes": [
      {"direction": "North", "vehicles": {"cars": 15, "bikes": 2, "trucks": 1}},
      {"direction": "East", "vehicles": {"cars": 20}},
      {"direction": "South", "vehicles": {"cars": 10, "buses": 1}},
      {"direction": "West", "vehicles": {"cars": 25}}
    ]
  }'
```

## Example: Simple vehicles

```bash
curl -X POST http://127.0.0.1:8000/api/optimize/vehicles \
  -H "Content-Type: application/json" \
  -d '{"vehicles": [15, 20, 10, 25]}'
```

## Response (vehicles endpoint)

```json
{
  "priority_lane_index": 3,
  "priority_lane": "West",
  "green_duration_ms": 65000,
  "green_duration_seconds": 65.0,
  "density_scores": [15.0, 20.0, 12.0, 25.0],
  "reasoning": "Lane West has highest density (25.0 weighted units, 35% of total)..."
}
```
