AI-Based Traffic Signal Optimizer 🚦
A dynamic, data-driven traffic management system designed to replace traditional fixed-timer signals with intelligent, density-based optimization. This project was developed for WHACK Hackathon 4.0 under the theme Smart & Sustainable Future.

🔗 Live Demo
Check out the live simulation here: https://ai-traffic-signal-op-63h3.bolt.host/

📌 Project Overview
Urban traffic congestion is a major challenge due to fixed-time traffic signals that do not adapt to real-time conditions. This results in unnecessary delays, increased fuel consumption, and emergency vehicle holdups.

Our solution is a web-based simulation prototype that uses an AI-driven algorithm to dynamically adjust traffic light durations based on real-time vehicle density and waiting times.

✨ Key Features
Dual Mode Simulation: Compare "Fixed Timing Mode" vs. "AI Optimization Mode" in real-time.
Dynamic Signal Allocation: Automatically grants green lights to the highest-priority lanes.
Live Metrics Dashboard: Tracks vehicle counts, current green lane status, and real-time priority scores.
Performance Analytics: Visualizes efficiency gains, including average waiting time reduction and vehicles cleared.
Interactive 4-Way Intersection: A visual representation of traffic flow with dynamic light changes.
🧠 The Algorithm (Core Logic)
The system calculates a Priority Score for each lane to balance congestion and delay:

Priority=VehicleCount+(WaitingTime×WeightFactor)
Green Signal Duration is then allocated proportionally:

GreenTime=BaseTime+(PriorityScalingFactor)
🛠️ Technologies Used
Frontend: HTML, CSS, JavaScript
Visualization: Canvas API for simulation and Chart.js for graphs
Logic Layer: JavaScript-based optimization algorithm
Development Tools: Visual Studio Code, GitHub
🚀 Future Scope
Computer Vision: Integration with OpenCV for real-time vehicle detection via cameras.
IoT Integration: Connecting the simulation to physical smart signal hardware.
Emergency Mode: Automatic prioritization for ambulances and fire trucks.
👥 Team: HACKX
Deepesh Yadav (Leader)
Nikshit Ranwa
Devendar Saraswat
Ravi Saraswat
