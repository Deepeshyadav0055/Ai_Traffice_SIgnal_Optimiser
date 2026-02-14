// AI Traffic Signal Optimization - Simulation Logic
// Connects to backend for AI-driven signal timing

const ROADS = ['North', 'East', 'South', 'West'];
const ROAD_IDS = ['road-1', 'road-2', 'road-3', 'road-4'];
const FIXED_GREEN_DURATION = 4000;  // ms when in Fixed mode
const CAR_PASS_RATE = 0.15;   // cars that pass per tick when green
const API_BASE = 'http://127.0.0.1:8000';  // Backend API URL

let state = {
  running: false,
  mode: 'fixed',  // 'fixed' | 'ai'
  activeRoadIndex: 0,
  vehicles: [15, 20, 10, 25],
  waitingTime: [0, 0, 0, 0],
  totalCleared: 0,
  fixedStats: { totalWait: 0, cleared: 0, samples: 0 },
  aiStats: { totalWait: 0, cleared: 0, samples: 0 },
  intervalId: null,
  phaseStartTime: null,
  currentGreenDuration: FIXED_GREEN_DURATION,  // Dynamic in AI mode
  backendAvailable: false,
  backendCache: null,  // { priority_lane_index, green_duration_ms, density_scores }
  densityScores: null,  // From backend for display
};

function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return document.querySelectorAll(sel);
}

// Initialize metric grids
function initMetricGrids() {
  const vehiclesEl = $('#vehicles-per-lane');
  const waitingEl = $('#waiting-time');
  const priorityEl = $('#priority-scores');

  vehiclesEl.innerHTML = ROADS.map((r, i) =>
    `<div class="item"><span>Road ${i + 1} (${r})</span><span id="v-${i}">${state.vehicles[i]}</span></div>`
  ).join('');

  waitingEl.innerHTML = ROADS.map((r, i) =>
    `<div class="item"><span>Road ${i + 1} (${r})</span><span id="w-${i}">0.0s</span></div>`
  ).join('');

  priorityEl.innerHTML = ROADS.map((r, i) =>
    `<div class="item"><span>Road ${i + 1} (${r})</span><span id="p-${i}">0.0</span></div>`
  ).join('');
}

// Backend API: fetch AI optimization (priority lane + green duration)
async function fetchBackendOptimization() {
  try {
    const res = await fetch(`${API_BASE}/api/optimize/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicles: [state.vehicles[0], state.vehicles[1], state.vehicles[2], state.vehicles[3]],
      }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using local AI fallback:', err);
    return null;
  }
}

async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    state.backendAvailable = res.ok;
  } catch {
    state.backendAvailable = false;
  }
  const statusEl = $('#backend-status');
  if (statusEl) {
    statusEl.textContent = state.backendAvailable ? 'Backend: connected' : 'Backend: offline (using local AI)';
    statusEl.className = 'backend-status ' + (state.backendAvailable ? 'connected' : 'offline');
  }
}

// Local priority score (fallback when backend offline)
function getPriorityScore(index) {
  const v = state.vehicles[index];
  const w = state.waitingTime[index];
  return v * 2 + w * 0.5;
}

function selectNextRoadLocal() {
  const scores = ROADS.map((_, i) => getPriorityScore(i));
  let best = 0;
  for (let i = 1; i < 4; i++) {
    if (scores[i] > scores[best]) best = i;
  }
  return best;
}

// Pre-fetch backend result for next phase (call after each switch)
function prefetchBackendOptimization() {
  fetchBackendOptimization().then((data) => {
    if (data) {
      state.backendCache = data;
    } else {
      state.backendCache = null;
    }
  });
}

// Get next road for AI mode: use cached backend result or local fallback
function selectNextRoadAI() {
  if (state.backendCache) {
    const cache = state.backendCache;
    state.backendCache = null;
    state.currentGreenDuration = cache.green_duration_ms;
    if (cache.density_scores) state.densityScores = cache.density_scores;
    prefetchBackendOptimization();  // Pre-fetch for next phase
    return cache.priority_lane_index;
  }
  state.currentGreenDuration = FIXED_GREEN_DURATION;
  state.densityScores = null;
  prefetchBackendOptimization();
  return selectNextRoadLocal();
}

function tick() {
  if (!state.running) return;

  const now = Date.now();
  const elapsed = now - (state.phaseStartTime || now);
  state.phaseStartTime = state.phaseStartTime || now;
  state.mode = getMode();
  const greenDuration = state.mode === 'ai' ? state.currentGreenDuration : FIXED_GREEN_DURATION;

  // Switch phase when green duration ends
  if (elapsed >= greenDuration) {
    const active = state.activeRoadIndex;
    const cleared = Math.min(
      Math.floor(state.vehicles[active] * CAR_PASS_RATE * (elapsed / 1000)),
      state.vehicles[active]
    );
    state.vehicles[active] -= cleared;
    state.totalCleared += cleared;

    const avgWait = state.waitingTime[active] * state.vehicles.length;
    if (state.mode === 'fixed') {
      state.fixedStats.cleared += cleared;
      state.fixedStats.totalWait += avgWait;
      state.fixedStats.samples++;
    } else {
      state.aiStats.cleared += cleared;
      state.aiStats.totalWait += avgWait;
      state.aiStats.samples++;
    }

    // Next road
    if (state.mode === 'fixed') {
      state.activeRoadIndex = (active + 1) % 4;
      state.currentGreenDuration = FIXED_GREEN_DURATION;
    } else {
      state.activeRoadIndex = selectNextRoadAI();
    }
    state.phaseStartTime = now;
  }

  const active = state.activeRoadIndex;

  // Increase waiting time for non-green lanes
  for (let i = 0; i < 4; i++) {
    if (i !== active && state.vehicles[i] > 0) {
      state.waitingTime[i] += 0.1;
    }
  }

  // Decrease vehicles on green lane
  if (state.vehicles[active] > 0) {
    const pass = Math.min(1, Math.floor(state.vehicles[active] * CAR_PASS_RATE * 0.1));
    state.vehicles[active] -= pass;
    state.totalCleared += pass;
  }

  updateUI();
}

function updateUI() {
  // Slider values
  ROAD_IDS.forEach((id, i) => {
    const input = $(`#${id}`);
    const valEl = $(`#${id}-val`);
    if (input && !state.running) {
      state.vehicles[i] = parseInt(input.value, 10);
    }
    if (valEl) valEl.textContent = state.vehicles[i];
  });

  // Vehicles per lane
  state.vehicles.forEach((v, i) => {
    const el = $(`#v-${i}`);
    if (el) el.textContent = Math.max(0, Math.round(v));
  });

  // Waiting time
  state.waitingTime.forEach((w, i) => {
    const el = $(`#w-${i}`);
    if (el) el.textContent = w.toFixed(1) + 's';
  });

  // Priority scores (backend density or local)
  const scores = state.mode === 'ai' && state.densityScores
    ? state.densityScores
    : ROADS.map((_, i) => getPriorityScore(i));
  scores.forEach((s, i) => {
    const el = $(`#p-${i}`);
    if (el) el.textContent = Number(s).toFixed(1);
  });

  // Total & avg wait
  const total = state.vehicles.reduce((a, b) => a + b, 0);
  const avgWait = state.waitingTime.reduce((a, b) => a + b, 0) / 4;
  const totalEl = $('#total-vehicles');
  const avgEl = $('#avg-wait');
  if (totalEl) totalEl.textContent = Math.round(total);
  if (avgEl) avgEl.textContent = avgWait.toFixed(1) + 's';

  // Active lane & signals
  state.mode = getMode();
  $('#current-mode').textContent = state.mode === 'ai' ? 'AI Mode' : 'Fixed Timing';
  $('#active-lane').textContent = `Road ${state.activeRoadIndex + 1} (${ROADS[state.activeRoadIndex]})`;

  ROADS.forEach((_, i) => {
    const roadEl = $(`#road-${['north', 'east', 'south', 'west'][i]}`);
    if (roadEl) {
      roadEl.classList.toggle('active', i === state.activeRoadIndex);
    }
  });

  // Performance bars (relative)
  const maxWait = Math.max(
    state.fixedStats.samples ? state.fixedStats.totalWait / state.fixedStats.samples : 0,
    state.aiStats.samples ? state.aiStats.totalWait / state.aiStats.samples : 0,
    1
  );
  const maxCleared = Math.max(state.fixedStats.cleared, state.aiStats.cleared, 1);

  const fixedWait = state.fixedStats.samples
    ? state.fixedStats.totalWait / state.fixedStats.samples
    : 0;
  const aiWait = state.aiStats.samples ? state.aiStats.totalWait / state.aiStats.samples : 0;

  $('#fixed-wait-bar').style.height = (100 * (fixedWait / maxWait)) + '%';
  $('#ai-wait-bar').style.height = (100 * (aiWait / maxWait)) + '%';
  $('#fixed-wait-val').textContent = fixedWait.toFixed(1) + 's';
  $('#ai-wait-val').textContent = aiWait.toFixed(1) + 's';

  $('#fixed-vehicles-bar').style.height = (100 * (state.fixedStats.cleared / maxCleared)) + '%';
  $('#ai-vehicles-bar').style.height = (100 * (state.aiStats.cleared / maxCleared)) + '%';
  $('#fixed-vehicles-val').textContent = state.fixedStats.cleared;
  $('#ai-vehicles-val').textContent = state.aiStats.cleared;
}

function start() {
  if (state.running) {
    state.running = false;
    if (state.intervalId) clearInterval(state.intervalId);
    $('#btn-start').textContent = 'Start';
    $('#btn-start').classList.remove('running');
    return;
  }
  state.running = true;
  state.phaseStartTime = Date.now();
  state.mode = getMode();
  if (state.mode === 'ai') prefetchBackendOptimization();
  $('#btn-start').textContent = 'Stop';
  $('#btn-start').classList.add('running');
  state.intervalId = setInterval(tick, 100);
}

function reset() {
  state.running = false;
  if (state.intervalId) clearInterval(state.intervalId);
  state.intervalId = null;
  state.activeRoadIndex = 0;
  state.waitingTime = [0, 0, 0, 0];
  state.totalCleared = 0;
  state.fixedStats = { totalWait: 0, cleared: 0, samples: 0 };
  state.aiStats = { totalWait: 0, cleared: 0, samples: 0 };
  state.backendCache = null;
  state.densityScores = null;
  state.vehicles = [
    parseInt($('#road-1').value, 10),
    parseInt($('#road-2').value, 10),
    parseInt($('#road-3').value, 10),
    parseInt($('#road-4').value, 10),
  ];
  $('#btn-start').textContent = 'Start';
  $('#btn-start').classList.remove('running');
  updateUI();
}

function getMode() {
  const radio = document.querySelector('input[name="mode"]:checked');
  return radio ? radio.value : 'fixed';
}

// Auth check - redirect to login if not authenticated
const LOGGED_KEY = 'ai_traffic_logged_in';
if (!sessionStorage.getItem(LOGGED_KEY)) {
  window.location.replace('login.html');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initMetricGrids();
  updateUI();
  checkBackendHealth();

  $('#btn-start').addEventListener('click', start);
  $('#btn-reset').addEventListener('click', reset);
  $('#btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem(LOGGED_KEY);
    window.location.href = 'login.html';
  });

  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.mode = getMode();
      if (state.mode === 'ai' && state.running) prefetchBackendOptimization();
      updateUI();
    });
  });

  ROAD_IDS.forEach((id, i) => {
    const input = $(`#${id}`);
    const valEl = $(`#${id}-val`);
    if (input) {
      input.addEventListener('input', () => {
        if (!state.running) {
          state.vehicles[i] = parseInt(input.value, 10);
          if (valEl) valEl.textContent = input.value;
          updateUI();
        }
      });
    }
  });
});
