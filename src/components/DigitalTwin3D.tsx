import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { 
  Eye, 
  RotateCcw, 
  Maximize2, 
  Sliders, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Car, 
  Radio, 
  Cpu, 
  Sparkles, 
  Info, 
  X,
  Compass,
  Layers,
  ArrowRight,
  Wind,
  Lightbulb,
  Building2,
  Navigation,
  Cloud,
  CloudRain,
  CloudSnow,
  Target,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Zap,
  Loader2,
  Home,
  DoorOpen
} from 'lucide-react';
import { Interactive3DObject, CityZone, ColonyHouse, CityJourneyStepId, CityOperationalAlert } from '../types';
import { CITY_ZONES } from '../data/dashboardData';
import { CITY_JOURNEY_STEPS } from '../data/colonyData';
import { buildResidentialColony, ColonySceneHandle } from '../three/buildResidentialColony';
import { CityPhysicsContext, ThirdPersonController, ThirdPersonTelemetry } from '../three/ThirdPersonController';
import { ThirdPersonHud } from './ThirdPersonHud';
import { CityMiniMap, CityMiniMapHandle, MiniMapSyncState } from './CityMiniMap';

// Procedural Skyscraper Window Canvas Generator:
// Generates architectural facades with randomized illuminated windows that emit light at night
function drawBuildingWindowCanvas(
  canvas: HTMLCanvasElement,
  height: number,
  width: number,
  seed: number,
  buildingId?: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Facade substrate: dark architectural tinted glass / obsidian composite
  ctx.fillStyle = '#060d1a';
  ctx.fillRect(0, 0, w, h);

  // Proportional grid dimensions
  const cols = Math.max(8, Math.min(12, Math.round(width / 2.8)));
  const rows = Math.max(16, Math.min(36, Math.round(height / 4.8)));
  const padX = 7;
  const padY = 5;
  const cellW = (w - (cols + 1) * padX) / cols;
  const cellH = (h - (rows + 1) * padY) / rows;

  const pseudoRandom = (n: number) => {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  };

  // Color palettes based on building archetype
  let colorPalette = [
    '#fef08a', // warm incandescent yellow
    '#fde047', // golden glow
    '#e0f2fe', // cool office LED
    '#bae6fd', // soft blue white
    '#38bdf8', // cyber cyan
    '#fed7aa', // amber dusk
  ];

  if (buildingId === 'smart-farm') {
    // Photosynthetic spectrum & hydroponic grow-lights
    colorPalette = [
      '#a7f3d0', // botanical emerald
      '#34d399', // vibrant bio-green
      '#c084fc', // purple horticulture LED
      '#e879f9', // magenta grow-light
      '#67e8f9', // oxygenated water mist
    ];
  } else if (buildingId === 'smart-hospital') {
    // 24/7 medical & sterile surgical lighting
    colorPalette = [
      '#f0fdf4', // clean medical white
      '#e0f2fe', // cool fluorescent
      '#38bdf8', // clinical cyan
      '#bae6fd', // pediatric soft blue
    ];
  }

  // Draw floors and windows
  for (let r = 0; r < rows; r++) {
    // Floor-specific activity simulation (clusters of occupied offices vs vacant floors)
    const floorActivity = pseudoRandom(seed * 17.3 + r * 9.1);
    const baseOccupancy = buildingId === 'smart-hospital' ? 0.78 : buildingId === 'smart-farm' ? 0.82 : 0.52;
    const floorLitThreshold = floorActivity > 0.82 
      ? 0.20 // late night crunch floor
      : floorActivity < 0.22 
        ? 0.82 // mostly dark floor
        : 1.0 - baseOccupancy;

    // Horizontal spandrel beam
    ctx.fillStyle = '#081427';
    ctx.fillRect(0, r * (cellH + padY), w, padY);

    for (let c = 0; c < cols; c++) {
      const winVal = pseudoRandom(seed * 13.7 + r * 31.9 + c * 47.1);
      const isLit = winVal > floorLitThreshold;

      const x = padX + c * (cellW + padX);
      const y = padY + r * (cellH + padY);

      if (isLit) {
        // Pick an emissive window color from palette
        const colorIdx = Math.floor(pseudoRandom(seed * 5.1 + r * 19.3 + c * 11.7) * colorPalette.length);
        const winColor = colorPalette[colorIdx];

        // Fill window pane
        ctx.fillStyle = winColor;
        ctx.fillRect(x, y, cellW, cellH);

        // Bright top ceiling fixture reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(x, y, cellW, Math.max(1, cellH * 0.22));

        // Random subtle interior silhouette or blind pattern
        if (winVal > 0.72) {
          ctx.fillStyle = 'rgba(8, 15, 30, 0.35)';
          ctx.fillRect(x, y + cellH * 0.5, cellW, cellH * 0.2);
        }
      } else {
        // Dark unlit glass pane with subtle architectural reflection
        ctx.fillStyle = '#060d19';
        ctx.fillRect(x, y, cellW, cellH);

        // Faint architectural mullion border
        ctx.fillStyle = 'rgba(25, 45, 80, 0.4)';
        ctx.fillRect(x, y, cellW, 1);
      }
    }
  }

  // Structural vertical exterior pillars
  ctx.fillStyle = '#040912';
  for (let c = 0; c <= cols; c++) {
    const x = c * (cellW + padX);
    ctx.fillRect(x, 0, padX, h);
  }
}

function createSkyscraperWindowTexture(
  width: number,
  height: number,
  seed: number,
  buildingId?: string
): { texture: THREE.CanvasTexture; canvas: HTMLCanvasElement } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  drawBuildingWindowCanvas(canvas, height, width, seed, buildingId);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return { texture, canvas };
}

// Procedural Weather Particle Sprite Generators
export type WeatherCondition = 'clear' | 'rain' | 'snow';

function createRainDropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(16, 0, 16, 128);
    gradient.addColorStop(0, 'rgba(186, 230, 253, 0)');
    gradient.addColorStop(0.25, 'rgba(125, 211, 252, 0.35)');
    gradient.addColorStop(0.75, 'rgba(147, 197, 253, 0.85)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(20, 100);
    ctx.arc(16, 108, 4, 0, Math.PI);
    ctx.lineTo(12, 100);
    ctx.closePath();
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSnowflakeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Glowing frosty snowflake core
    const rad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    rad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    rad.addColorStop(0.25, 'rgba(240, 249, 255, 0.95)');
    rad.addColorStop(0.55, 'rgba(186, 230, 253, 0.5)');
    rad.addColorStop(0.85, 'rgba(147, 197, 253, 0.15)');
    rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    // Delicate 6-axis crystal dendrites for light snow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(32, 32);
      ctx.lineTo(32 + cos * 22, 32 + sin * 22);
      ctx.stroke();

      // Branchlets
      const bCos = Math.cos(angle + Math.PI / 4) * 6;
      const bSin = Math.sin(angle + Math.PI / 4) * 6;
      ctx.beginPath();
      ctx.moveTo(32 + cos * 14, 32 + sin * 14);
      ctx.lineTo(32 + cos * 14 + bCos, 32 + sin * 14 + bSin);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface DigitalTwin3DProps {
  emergencyActive: boolean;
  onEmergencyToggle: (active: boolean) => void;
  selectedZone?: CityZone | null;
  onSelectZone?: (zone: CityZone | null) => void;
  colonyHouses: ColonyHouse[];
  selectedHouseId: string;
  onSelectHouse: (houseId: string) => void;
  onInspectHouseInControlRoom: (houseId: string) => void;
  gateOpen: boolean;
  onToggleGate: (open: boolean) => void;
  gateWarning: boolean;
  focusHouseTrigger?: { houseId: string; seq: number } | null;
  onOperationalEvent?: (event: Omit<CityOperationalAlert, 'id' | 'timestamp'>) => void;
}

const INTERACTIVE_OBJECTS: Record<string, Interactive3DObject> = {
  'smart-building': {
    id: 'smart-building',
    name: 'NEXUS TOWER 01 (SMART BUILDING)',
    type: 'building',
    engineers: ['Civil Engineering', 'Electrical Engineering', 'CSE', 'ECE'],
    status: 'Nominal • Structural Health 99.8%',
    description: 'Autonomous high-rise with active kinetic solar shading louvers, tuned mass dampers, and embedded strain gauges in load-bearing columns.',
    telemetry: [
      { label: 'Structural Load', value: '42% of max load limit' },
      { label: 'HVAC Energy Draw', value: '184 kW (Solar powered)' },
      { label: 'Interior Air Quality', value: '98 AQI (Pristine)' },
      { label: 'Occupancy Density', value: '1,420 citizens' }
    ]
  },
  'smart-bridge': {
    id: 'smart-bridge',
    name: 'NEXUS HARBOR SMART BRIDGE',
    type: 'bridge',
    engineers: ['Civil Engineering', 'Mechanical Engineering', 'Structural Engineering', 'ECE'],
    status: 'Operational • Resonance Damping Active',
    description: 'Cable-stayed suspension bridge equipped with dynamic optical strain sensors, automated de-icing heating cables, and dynamic wind vortex dampers.',
    telemetry: [
      { label: 'Vibration Amplitude', value: '0.04 mm (Damped)' },
      { label: 'Traffic Throughput', value: '4,800 vehicles/hr' },
      { label: 'Cable Tension', value: 'Nominal 2.4 MN' },
      { label: 'Wind Resistance', value: 'Rated up to 240 km/h' }
    ]
  },
  'smart-grid': {
    id: 'smart-grid',
    name: 'DISTRICT 02 SMART SUBSTATION & GRID',
    type: 'grid',
    engineers: ['Electrical Engineering', 'CSE', 'ECE', 'Mechanical Engineering'],
    status: 'Optimal • Microgrid Islanding Armed',
    description: 'High-voltage solid-state transformation hub with sub-cycle automated fault isolation, battery energy storage reserves, and AI frequency regulation.',
    telemetry: [
      { label: 'Substation Load', value: '68% (412 MW)' },
      { label: 'Grid Frequency', value: '50.002 Hz (Rock-solid)' },
      { label: 'BESS Battery Level', value: '96% (140 MWh)' },
      { label: 'Renewable Feed-in', value: '87% clean energy' }
    ]
  },
  'autonomous-vehicle': {
    id: 'autonomous-vehicle',
    name: 'AUTONOMOUS PLATOON EV SHUTTLE',
    type: 'vehicle',
    engineers: ['Automobile Engineering', 'CSE', 'AI / Machine Learning', 'ECE'],
    status: 'Autonomous Level 5 • In Transit',
    description: 'Zero-emission passenger shuttle powered by in-road wireless inductive charging coils with V2X millimeter-wave inter-vehicle telemetry.',
    telemetry: [
      { label: 'Speed', value: '48 km/h' },
      { label: 'Battery Charge', value: '88% (Inductive charging)' },
      { label: 'LiDAR Tracking', value: '120 obstacles mapped/sec' },
      { label: 'Next Stop ETA', value: '1 min 40 sec' }
    ]
  },
  'smart-hospital': {
    id: 'smart-hospital',
    name: 'METROPOLITAN SMART TRAUMA CENTER',
    type: 'hospital',
    engineers: ['Biomedical Engineering', 'CSE', 'Electrical Engineering', 'Civil Engineering'],
    status: 'Standby • 100% Critical Power Redundancy',
    description: 'Next-generation emergency hospital with rooftop drone defibrillator landing bays, telemetry-synchronized ambulances, and negative-pressure wards.',
    telemetry: [
      { label: 'Trauma ICU Capacity', value: '82% available' },
      { label: 'Clean Power Uptime', value: '99.9999% Level 4' },
      { label: 'Drone Dispatch Time', value: '12 seconds' },
      { label: 'Vital Telemetry Stream', value: '240 active patients' }
    ]
  },
  'drone': {
    id: 'drone',
    name: 'NEXUS SKYWAY PATROL 01',
    type: 'drone',
    engineers: ['Aerospace Engineering', 'Robotics Engineering', 'AI / Machine Learning', 'ECE'],
    status: 'Sector Alpha Skyway • Patrol Altitude 155m',
    description: 'Autonomous multi-rotor interceptor navigating curved GSAP flight corridors across downtown skyscrapers with organic hover bobbing, thermal imaging, and real-time telemetry streaming.',
    telemetry: [
      { label: 'Altitude', value: '155 meters' },
      { label: 'Airspeed', value: '72 km/h' },
      { label: 'Battery Endurance', value: '48 min (92% SOC)' },
      { label: 'Flight Trajectory', value: 'Skyway Alpha (Perimeter)' },
      { label: 'Thermal Anomaly Scan', value: 'Clear • 0 Hotspots' }
    ]
  },
  'drone-alpha': {
    id: 'drone-alpha',
    name: 'NEXUS SKYWAY PATROL 01 (SECTOR ALPHA)',
    type: 'drone',
    engineers: ['Aerospace Engineering', 'Robotics Engineering', 'AI / Machine Learning', 'ECE'],
    status: 'Active Patrol • Altitude 155m • GSAP Spline',
    description: 'Autonomous multi-rotor interceptor patrolling the metropolitan perimeter skyway along curved GSAP spline corridors, conducting 360° LIDAR mapping and airspace security scans.',
    telemetry: [
      { label: 'Altitude', value: '155 meters' },
      { label: 'Airspeed', value: '72 km/h' },
      { label: 'Battery Endurance', value: '48 min (92% SOC)' },
      { label: 'Flight Corridor', value: 'Skyway Alpha • Perimeter' },
      { label: 'Hover Stabilization', value: 'GSAP Sine Easing Active' }
    ]
  },
  'drone-beta': {
    id: 'drone-beta',
    name: 'TRAUMA MED-EVTOL DRONE 02 (CANOPY)',
    type: 'drone',
    engineers: ['Biomedical Engineering', 'Aerospace Engineering', 'Robotics', 'CSE'],
    status: 'High Canopy Patrol • Altitude 195m • GSAP Spline',
    description: 'Rapid-response medical transport drone cruising above Nexus Tower 01 and the Smart Hospital rooftop trauma bay, equipped with organ transport cryo-pods and defibrillator payloads.',
    telemetry: [
      { label: 'Altitude', value: '195 meters' },
      { label: 'Airspeed', value: '88 km/h' },
      { label: 'Battery Endurance', value: '56 min (98% SOC)' },
      { label: 'Flight Corridor', value: 'Skyway Beta • Tower Summit' },
      { label: 'Payload Bay', value: 'Automated AED & Plasma' }
    ]
  },
  'drone-gamma': {
    id: 'drone-gamma',
    name: 'ECO-ATMOSPHERE SURVEYOR 03 (TACTICAL)',
    type: 'drone',
    engineers: ['Environmental Engineering', 'Chemical Engineering', 'AI / Machine Learning', 'ECE'],
    status: 'Atmospheric Profiling • Altitude 142m • GSAP Spline',
    description: 'Environmental monitoring drone surveying hyper-local particulate matter (PM2.5), greenhouse gases, and microclimate wind currents across urban river corridors and smart substations.',
    telemetry: [
      { label: 'Altitude', value: '142 meters' },
      { label: 'Airspeed', value: '62 km/h' },
      { label: 'Air Quality Sensor', value: 'AQI 28 (Good) • 0 Anomaly' },
      { label: 'Flight Corridor', value: 'Skyway Gamma • River & Grid' },
      { label: 'Turbulence Est.', value: 'Nominal • 1.1 m/s gust' }
    ]
  },
  'smart-farm': {
    id: 'smart-farm',
    name: 'AEROPONIC VERTICAL SKY-FARM',
    type: 'farm',
    engineers: ['Agricultural Engineering', 'Environmental Engineering', 'AI / Machine Learning', 'Mechanical'],
    status: 'Growing Cycle Active • 95% Water Saved',
    description: '30-story vertical greenhouse using ultrasonic nutrient misting, automated chlorophyll LED recipes, and computer vision robotic harvesters.',
    telemetry: [
      { label: 'Daily Harvest', value: '2.4 tons organic produce' },
      { label: 'Water Recycling', value: '98% closed loop' },
      { label: 'Nutrient EC/pH', value: 'pH 5.8 | EC 1.6' },
      { label: 'Pesticide Usage', value: '0% (Sterile filtration)' }
    ]
  },
  'smart-lighting': {
    id: 'smart-lighting',
    name: 'DYNAMIC ADAPTIVE STREET LIGHTING MESH',
    type: 'grid',
    engineers: ['Electrical Engineering', 'IoT Systems', 'Civil Engineering', 'AI & Machine Learning'],
    status: 'Autonomous Lidar & Traffic-Density Responsive Active',
    description: 'Smart optical roadway luminaires that sense approaching vehicle flow and velocity in real time, scaling PointLight luminous flux from 25% standby glow up to 100% full illumination as convoys pass.',
    telemetry: [
      { label: 'Adaptive Dimming', value: 'Autonomous Dynamic Scaling Active' },
      { label: 'Energy Savings', value: '64.2% Saved vs Static Sodium Vapour' },
      { label: 'Active Road Corridors', value: 'Metro Central Ave & Innovation Blvd' },
      { label: 'Response Latency', value: '< 15 ms via Optical Sensor Array' }
    ]
  },
  'smart-emergency-vehicle': {
    id: 'smart-emergency-vehicle',
    name: 'V2X SMART TRAUMA RAPID INTERCEPTOR',
    type: 'vehicle',
    engineers: ['Automobile Engineering', 'Biomedical Engineering', 'CSE', 'ECE'],
    status: 'Priority Signal Preemption Armed',
    description: 'High-speed autonomous emergency medical cruiser broadcasting 5.9 GHz C-V2X priority preemption signals to clear cross-boulevard intersections and command surrounding civilian AVs to slow down or halt.',
    telemetry: [
      { label: 'V2X Priority Preemption', value: 'Active Broadcast (Code 3)' },
      { label: 'Intersection Clearance', value: 'Automated 100m Corridor Hold' },
      { label: 'Telemetry Stream', value: 'Hospital Trauma Bay Synchronized' },
      { label: 'Propulsion', value: 'Dual 320kW Electric AWD' }
    ]
  },
  'city-entrance-arch': {
    id: 'city-entrance-arch',
    name: 'NEXUS SMART CITY MAIN ENTRANCE',
    type: 'building',
    engineers: ['Civil Engineering', 'CSE', 'ECE', 'Electrical Engineering'],
    status: 'Metropolitan Gateway Online • ANPR Active',
    description: 'Primary southern entrance arch to NEXUS Smart City on Metro Central Avenue. Connects directly eastward via the landscaped boulevard toward Shanti Vihar Residential Colony.',
    telemetry: [
      { label: 'Corridor', value: 'Metro Central Ave (South)' },
      { label: 'Colony Link', value: 'Eastbound Approach Rd -> Gate' },
      { label: 'Traffic Flow', value: 'Smooth · 48 km/h' },
      { label: 'Lighting', value: 'Adaptive Solar LED' }
    ]
  },
  'colony-main-gate': {
    id: 'colony-main-gate',
    name: 'SHANTI VIHAR MAIN SECURITY GATE',
    type: 'colony-gate',
    engineers: ['CSE', 'ECE', 'Mechanical Engineering', 'Civil Engineering'],
    status: 'Boom Barrier Armed • ANPR + Guard Verification',
    description: 'Gated entrance to Shanti Vihar Indian Residential Colony (H-01 to H-30). Features automated boom barrier, visitor/delivery verification lane, and real-time guard cabin sync.',
    telemetry: [
      { label: 'Houses Protected', value: '30 Homes (H-01 to H-30)' },
      { label: 'Visitor Lane', value: 'OTP & ANPR Verified' },
      { label: 'Emergency Egress', value: 'East Gate Always Open' },
      { label: 'Action', value: 'Click Gate to Open & Enter' }
    ]
  },
  'colony-guard-cabin': {
    id: 'colony-guard-cabin',
    name: 'COLONY SECURITY GUARD CABIN',
    type: 'guard-cabin',
    engineers: ['CSE', 'ECE', 'Electrical Engineering', 'AI / ML'],
    status: '24x7 Staffed • Chief Officer Rajesh Verma',
    description: 'On-site colony security checkpoint housing the boom barrier override console, visitor log terminal, local edge alert receiver, and backup battery UPS.',
    telemetry: [
      { label: 'Officers On Duty', value: '4 Colony Guards' },
      { label: 'Local Mesh Link', value: 'Sub-GHz + Fiber Dual' },
      { label: 'Backup UPS', value: '100% Charged (18 hrs)' },
      { label: 'Response Protocol', value: 'Human-Verified Alerts' }
    ]
  },
  'colony-park': {
    id: 'colony-park',
    name: 'SHANTI VIHAR COMMUNITY PARK',
    type: 'colony-park',
    engineers: ['Civil Engineering', 'Environmental Engineering', 'Agricultural Engineering'],
    status: 'AQI 36 (Parkland Fresh) • Solar Lit',
    description: 'Central landscaped Indian society park with neem/ashoka shade trees, jogging loop, gazebo pavilion, and low-energy warm LED pathway lighting.',
    telemetry: [
      { label: 'Local AQI', value: '36 AQI (Fresh)' },
      { label: 'Green Canopy', value: '58 Native Trees' },
      { label: 'Rainwater Harvesting', value: '2 Recharge Pits Active' },
      { label: 'Access', value: 'Pedestrian Footpaths' }
    ]
  },
  'colony-emergency-exit': {
    id: 'colony-emergency-exit',
    name: 'INDEPENDENT EMERGENCY EXIT GATE',
    type: 'emergency-exit',
    engineers: ['Civil Engineering', 'Mechanical Engineering', 'Safety Systems'],
    status: 'FAIL-SAFE UNLOCKED · EVACUATION CLEAR',
    description: 'Hardware-isolated East Perimeter emergency exit. Remains permanently accessible and unobstructed even during main gate lockdown or power loss.',
    telemetry: [
      { label: 'Lockdown Override', value: 'Never Locked (Fail-Safe)' },
      { label: 'Clear Width', value: '12 Meters (Fire Tender Ready)' },
      { label: 'Signage Power', value: 'Dedicated Solar Battery' },
      { label: 'Evacuation Route', value: 'East Spine -> Perimeter' }
    ]
  },
  'user-avatar': {
    id: 'user-avatar',
    name: 'CITIZEN EXPLORER (LOW-POLY USER AVATAR)',
    type: 'building',
    engineers: ['Spatial UI Systems', 'Three.js Digital Twin', 'AI Security Mesh'],
    status: 'Synchronized with Camera Target · Terrain Grounded',
    description: 'Low-poly humanoid presence avatar anchored to the OrbitControls camera target. Moves across the city terrain during panning and hands off seamlessly to WASD Third-Person exploration.',
    telemetry: [
      { label: 'Control Mode', value: 'Orbit Target + WASD 3P' },
      { label: 'Tracking', value: 'Terrain Height Grounded' },
      { label: 'Mesh Geometry', value: 'Low-Poly Composite Group' },
      { label: 'Shortcut', value: 'Press WASD to Walk' }
    ]
  }
};

interface LowPolyHumanoidHandle {
  group: THREE.Group;
  update: (delta: number, time: number, targetX: number, targetZ: number, groundY: number, visible: boolean) => void;
  dispose: () => void;
}

// Low-Poly Faceted Humanoid Character Mesh Builder (Composite 11-Part THREE.Group)
function createLowPolyHumanoidMesh(clickableMeshes: THREE.Mesh[]): LowPolyHumanoidHandle {
  const group = new THREE.Group();
  group.name = 'LowPolyUserHumanoidAvatar';

  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    mats.push(m);
    return m;
  };

  // Distinct PBR roughness & metalness contrast across low-poly armor/suit/visor parts
  const suitMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.55,
    metalness: 0.15,
    flatShading: true
  }));
  const legsMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true
  }));
  const bootMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.38,
    metalness: 0.25,
    flatShading: true
  }));
  const accentMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x0891b2,
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.7,
    flatShading: true
  }));
  const headMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0xf1c27d,
    roughness: 0.72,
    metalness: 0.04,
    flatShading: true
  }));

  const bodyPivot = new THREE.Group();
  bodyPivot.position.set(0, 2.2, 0);

  // Tapered 6-sided low-poly torso
  const torsoMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.95, 0.65, 2.2, 6)),
    suitMat
  );
  torsoMesh.position.set(0, 1.1, 0);
  torsoMesh.castShadow = true;

  // Cyan chest telemetry core
  const chestCore = new THREE.Mesh(
    trackGeo(new THREE.OctahedronGeometry(0.36, 0)),
    accentMat
  );
  chestCore.position.set(0, 1.35, 0.72);

  // Backpack power unit
  const packMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.05, 1.3, 0.52)),
    accentMat
  );
  packMesh.position.set(0, 1.15, -0.78);

  // Faceted Icosahedron head + glowing visor strip
  const headMesh = new THREE.Mesh(
    trackGeo(new THREE.IcosahedronGeometry(0.62, 0)),
    headMat
  );
  headMesh.position.set(0, 2.85, 0);
  headMesh.castShadow = true;

  const visorMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.92, 0.24, 0.34)),
    accentMat
  );
  visorMesh.position.set(0, 2.88, 0.45);

  // Articulated arms
  const armGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.18, 1.85, 6));
  armGeo.translate(0, -0.925, 0);
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-1.12, 2.0, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, suitMat);
  leftArmMesh.castShadow = true;
  leftArmPivot.add(leftArmMesh);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(1.12, 2.0, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, suitMat);
  rightArmMesh.castShadow = true;
  rightArmPivot.add(rightArmMesh);

  bodyPivot.add(torsoMesh, chestCore, packMesh, headMesh, visorMesh, leftArmPivot, rightArmPivot);

  // Articulated legs + boots anchored so soles sit cleanly at y = 0
  const legGeo = trackGeo(new THREE.CylinderGeometry(0.32, 0.24, 1.85, 6));
  legGeo.translate(0, -0.925, 0);
  const bootGeo = trackGeo(new THREE.BoxGeometry(0.64, 0.38, 0.96));

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.44, 2.2, 0);
  const leftLeg = new THREE.Mesh(legGeo, legsMat);
  leftLeg.castShadow = true;
  const leftBoot = new THREE.Mesh(bootGeo, bootMat);
  leftBoot.position.set(0, -2.01, 0.14);
  leftLegPivot.add(leftLeg, leftBoot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.44, 2.2, 0);
  const rightLeg = new THREE.Mesh(legGeo, legsMat);
  rightLeg.castShadow = true;
  const rightBoot = new THREE.Mesh(bootGeo, bootMat);
  rightBoot.position.set(0, -2.01, 0.14);
  rightLegPivot.add(rightLeg, rightBoot);

  // Ground contact shadow + cyan target ring + floating overhead diamond beacon
  const shadowDisc = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(1.9, 18)),
    trackMat(new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    }))
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.04;

  const targetRing = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(2.1, 2.75, 24)),
    trackMat(new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    }))
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.y = 0.08;

  const overheadMarker = new THREE.Mesh(
    trackGeo(new THREE.OctahedronGeometry(0.68, 0)),
    accentMat
  );
  overheadMarker.position.set(0, 6.8, 0);

  const hitbox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.8, 7.6, 3.8)),
    trackMat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
  );
  hitbox.position.set(0, 3.6, 0);
  hitbox.userData = { id: 'user-avatar', name: 'CITIZEN EXPLORER (USER AVATAR)' };
  clickableMeshes.push(hitbox);

  group.add(bodyPivot, leftLegPivot, rightLegPivot, shadowDisc, targetRing, overheadMarker, hitbox);

  let prevX = 0;
  let prevZ = 0;
  let initialized = false;
  let walkPhase = 0;

  return {
    group,
    update(delta, time, targetX, targetZ, groundY, visible) {
      group.visible = visible;
      if (!initialized) {
        prevX = targetX;
        prevZ = targetZ;
        initialized = true;
      }

      group.position.set(targetX, groundY, targetZ);

      const dx = targetX - prevX;
      const dz = targetZ - prevZ;
      const moveDist = Math.hypot(dx, dz);
      prevX = targetX;
      prevZ = targetZ;

      if (visible && moveDist > 0.03) {
        const desiredYaw = Math.atan2(dx, dz);
        let diff = desiredYaw - group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        group.rotation.y += diff * Math.min(1, delta * 10);

        walkPhase += Math.min(1.2, moveDist * 0.45 + delta * 9);
        const swing = Math.sin(walkPhase) * 0.65;
        leftLegPivot.rotation.x = swing;
        rightLegPivot.rotation.x = -swing;
        leftArmPivot.rotation.x = -swing * 0.75;
        rightArmPivot.rotation.x = swing * 0.75;
        bodyPivot.position.y = 2.2 + Math.abs(Math.sin(walkPhase * 2)) * 0.12;
      } else {
        leftLegPivot.rotation.x = THREE.MathUtils.damp(leftLegPivot.rotation.x, 0, 10, delta);
        rightLegPivot.rotation.x = THREE.MathUtils.damp(rightLegPivot.rotation.x, 0, 10, delta);
        leftArmPivot.rotation.x = THREE.MathUtils.damp(leftArmPivot.rotation.x, 0, 10, delta);
        rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, 0, 10, delta);
        bodyPivot.position.y = 2.2 + Math.sin(time * 2.4) * 0.05;
      }

      const ringPulse = 1 + Math.sin(time * 3.5) * 0.08;
      targetRing.scale.set(ringPulse, ringPulse, 1);
      overheadMarker.rotation.y = time * 1.8;
      overheadMarker.position.y = 6.8 + Math.sin(time * 2.8) * 0.35;
    },
    dispose() {
      group.parent?.remove(group);
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    }
  };
}

function createCityPhysicsWorld(
  buildings: Array<{ x: number; z: number; w: number; h: number; d: number; name: string }>,
  houses: ColonyHouse[]
): CityPhysicsContext {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -28, 0),
  });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  (world.solver as CANNON.GSSolver).iterations = 10;

  const groundMaterial = new CANNON.Material('ground');
  const roadMaterial = new CANNON.Material('road');
  const buildingMaterial = new CANNON.Material('building');
  const playerMaterial = new CANNON.Material('player');

  // Low-friction ground contact + zero-friction wall sliding so diagonal movement never snags
  world.addContactMaterial(
    new CANNON.ContactMaterial(playerMaterial, groundMaterial, { friction: 0.04, restitution: 0.0 })
  );
  world.addContactMaterial(
    new CANNON.ContactMaterial(playerMaterial, roadMaterial, { friction: 0.04, restitution: 0.0 })
  );
  world.addContactMaterial(
    new CANNON.ContactMaterial(playerMaterial, buildingMaterial, { friction: 0.0, restitution: 0.0 })
  );

  const bodies: CANNON.Body[] = [];
  const roadBodyNames = new Map<number, string>();
  const buildingBodyNames = new Map<number, string>();

  const addStaticBox = (
    hx: number,
    hy: number,
    hz: number,
    px: number,
    py: number,
    pz: number,
    material: CANNON.Material,
    rotY = 0
  ): CANNON.Body => {
    const body = new CANNON.Body({
      mass: 0,
      material,
      position: new CANNON.Vec3(px, py, pz),
    });
    if (rotY !== 0) {
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotY);
    }
    body.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)));
    world.addBody(body);
    bodies.push(body);
    return body;
  };

  // 1. Base World Terrain Slab (top surface at y = 0.28)
  addStaticBox(575, 0.5, 430, 125, -0.22, 20, groundMaterial);

  // 2. City & Colony Roads (top surface at y = 0.29 so road contacts register cleanly)
  const roadDefs: Array<{ name: string; x: number; z: number; hw: number; hd: number }> = [
    { name: 'Metro Central Ave', x: 0, z: 0, hw: 7, hd: 240 },
    { name: 'Innovation Blvd', x: 70, z: 0, hw: 7, hd: 240 },
    { name: 'Cross-Boulevard', x: 35, z: 0, hw: 110, hd: 7 },
    { name: 'Colony Approach Road', x: 116, z: 120, hw: 46, hd: 9 },
    { name: 'Central Colony Avenue', x: 295, z: 120, hw: 137, hd: 8.5 },
    { name: 'Colony North Street', x: 288, z: 58, hw: 109, hd: 7 },
    { name: 'Colony South Street', x: 288, z: 182, hw: 109, hd: 7 },
    { name: 'West Spine Road', x: 182, z: 120, hw: 7, hd: 68 },
    { name: 'Park West Lane', x: 242, z: 120, hw: 6.5, hd: 64 },
    { name: 'Park East Lane', x: 302, z: 120, hw: 6.5, hd: 64 },
    { name: 'East Spine Road', x: 388, z: 112, hw: 7.5, hd: 86 },
    { name: 'Community Park (North)', x: 272, z: 90, hw: 22, hd: 16 },
    { name: 'Community Park (South)', x: 272, z: 150, hw: 22, hd: 16 },
  ];
  roadDefs.forEach((r) => {
    const rb = addStaticBox(r.hw, 0.4, r.hd, r.x, -0.11, r.z, roadMaterial);
    roadBodyNames.set(rb.id, r.name);
  });

  // 3. Smart City Skyscrapers & Key City Structures
  buildings.forEach((b) => {
    const bb = addStaticBox(b.w / 2, b.h / 2, b.d / 2, b.x, b.h / 2, b.z, buildingMaterial);
    buildingBodyNames.set(bb.id, b.name);
  });

  const subBody = addStaticBox(17.5, 7, 17.5, 130, 7, -100, buildingMaterial);
  buildingBodyNames.set(subBody.id, 'DISTRICT 02 SMART SUBSTATION');

  // Smart City Main Entrance Arch Pillars (z=235)
  const archLeft = addStaticBox(1.6, 12, 1.6, -14, 12, 235, buildingMaterial);
  buildingBodyNames.set(archLeft.id, 'SMART CITY ENTRANCE ARCH');
  const archRight = addStaticBox(1.6, 12, 1.6, 14, 12, 235, buildingMaterial);
  buildingBodyNames.set(archRight.id, 'SMART CITY ENTRANCE ARCH');

  // West Harbor Canal Safety Wall (east edge of waterway at x=-130)
  const canalWall = addStaticBox(1.5, 8, 300, -130, 4, 0, buildingMaterial);
  buildingBodyNames.set(canalWall.id, 'HARBOR CANAL EMBANKMENT');

  // 4. Shanti Vihar Colony Houses (H-01 .. H-30), Guard Cabin & Compound Walls
  houses.forEach((h) => {
    const hHeight = h.floors === 3 ? 11.2 : 7.6;
    const bodyCenterY = hHeight / 2 + 0.18;
    const worldX = h.coordinates[0] - Math.sin(h.facingAngle) * 1.6;
    const worldZ = h.coordinates[2] - Math.cos(h.facingAngle) * 1.6;
    const hb = addStaticBox(7.0, hHeight / 2, 6.25, worldX, bodyCenterY, worldZ, buildingMaterial, h.facingAngle);
    buildingBodyNames.set(hb.id, `${h.id} · ${h.ownerName}`);
  });

  const cabinBody = addStaticBox(4.2, 3.0, 3.6, 166, 3.0, 104, buildingMaterial);
  buildingBodyNames.set(cabinBody.id, 'SECURITY GUARD CABIN');

  // Colony Perimeter Walls (>= 2.2m thick for anti-tunneling at sprint speeds)
  const walls: Array<{ name: string; x: number; z: number; hx: number; hz: number }> = [
    { name: 'Colony North Perimeter Wall', x: 297, z: 12, hx: 137, hz: 1.1 },
    { name: 'Colony South Perimeter Wall', x: 297, z: 228, hx: 137, hz: 1.1 },
    { name: 'Colony West Wall (North)', x: 160, z: 60.5, hx: 1.1, hz: 50.5 },
    { name: 'Colony West Wall (South)', x: 160, z: 179.5, hx: 1.1, hz: 50.5 },
    { name: 'Colony East Wall (North)', x: 434, z: 61, hx: 1.1, hz: 50.5 },
    { name: 'Colony East Wall (South)', x: 434, z: 179, hx: 1.1, hz: 50.5 },
  ];
  walls.forEach((w) => {
    const wb = addStaticBox(w.hx, 4, w.hz, w.x, 4, w.z, buildingMaterial);
    buildingBodyNames.set(wb.id, w.name);
  });

  // Dynamic Boom Barrier Collider at Shanti Vihar Main Gate (x=160, z=120)
  const gateBarrierBody = addStaticBox(1.2, 4, 8.5, 160, 4, 120, buildingMaterial);
  buildingBodyNames.set(gateBarrierBody.id, 'COLONY MAIN SECURITY GATE');

  return {
    world,
    playerMaterial,
    roadBodyNames,
    buildingBodyNames,
    gateBarrierBody,
    dispose: () => {
      bodies.forEach((b) => world.removeBody(b));
      roadBodyNames.clear();
      buildingBodyNames.clear();
    },
  };
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({ 
  emergencyActive, 
  onEmergencyToggle,
  selectedZone: propSelectedZone,
  onSelectZone,
  colonyHouses,
  selectedHouseId,
  onSelectHouse,
  onInspectHouseInControlRoom,
  gateOpen,
  onToggleGate,
  gateWarning,
  focusHouseTrigger,
  onOperationalEvent,
}) => {
  const onOperationalEventRef = useRef(onOperationalEvent);
  onOperationalEventRef.current = onOperationalEvent;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedObject, setSelectedObject] = useState<Interactive3DObject | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [activeZone, setActiveZone] = useState<CityZone | null>(propSelectedZone || null);
  const activeZoneRef = useRef<CityZone | null>(propSelectedZone || null);
  activeZoneRef.current = activeZone;

  const [activeJourneyStep, setActiveJourneyStep] = useState<CityJourneyStepId>('city-entrance');
  const [followPerson, setFollowPerson] = useState<boolean>(false);
  const followPersonRef = useRef<boolean>(false);
  followPersonRef.current = followPerson;
  const [sprintLocked, setSprintLocked] = useState<boolean>(false);
  const sprintLockedRef = useRef<boolean>(false);
  sprintLockedRef.current = sprintLocked;
  const jumpPendingRef = useRef<boolean>(false);
  const [tpTelemetry, setTpTelemetry] = useState<ThirdPersonTelemetry>({
    x: 136,
    z: 120,
    zoneName: 'Colony Approach Road',
    isInsideColony: false,
    distToGate: 24,
    inGateProximity: false,
    nearbyHouse: null,
    nearbyLandmarkId: null,
    nearbyLandmarkName: null,
    nearGuardCabin: false,
    nearEmergencyExit: false,
    nearSmartBuilding: false,
    isWalking: false,
    isSprinting: false,
    physicsSurface: 'Colony Approach Road',
    physicsContact: null,
    isGrounded: true,
  });
  const tpTelemetryRef = useRef<ThirdPersonTelemetry>(tpTelemetry);
  tpTelemetryRef.current = tpTelemetry;
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const colonyHandleRef = useRef<ColonySceneHandle | null>(null);
  const thirdPersonRef = useRef<ThirdPersonController | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const miniMapRef = useRef<CityMiniMapHandle | null>(null);
  const colonyHousesRef = useRef<ColonyHouse[]>(colonyHouses);
  colonyHousesRef.current = colonyHouses;
  const gateOpenRef = useRef<boolean>(gateOpen);
  gateOpenRef.current = gateOpen;
  const gateWarningRef = useRef<boolean>(gateWarning);
  gateWarningRef.current = gateWarning;

  // Smooth Camera Flight & Orbit Target Refs
  const orbitTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 20, 0));
  const camFlightRef = useRef<{
    active: boolean;
    targetPos: THREE.Vector3;
    targetLook: THREE.Vector3;
  }>({
    active: false,
    targetPos: new THREE.Vector3(220, 160, 240),
    targetLook: new THREE.Vector3(0, 20, 0),
  });
  const isSoftwareGlRef = useRef<boolean>(false);

  // Digital Twin Control States
  const [lightingMode, setLightingMode] = useState<'night' | 'twilight' | 'day'>('night');
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(true);
  const [buildingStyle, setBuildingStyle] = useState<'solid' | 'wireframe' | 'holo'>('solid');
  const [dronesVisible, setDronesVisible] = useState<boolean>(true);
  const [flightPathsVisible, setFlightPathsVisible] = useState<boolean>(true);
  const [sensorsVisible, setSensorsVisible] = useState<boolean>(true);
  const [renewableEnergyActive, setRenewableEnergyActive] = useState<boolean>(true);
  const [waterHighlighted, setWaterHighlighted] = useState<boolean>(false);
  const [windowLightsActive, setWindowLightsActive] = useState<boolean>(true);
  const [windowPatternSeed, setWindowPatternSeed] = useState<number>(42);

  // Weather Simulation State ('clear' | 'rain' | 'snow')
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('clear');
  const weatherConditionRef = useRef<WeatherCondition>('clear');
  weatherConditionRef.current = weatherCondition;

  // Dynamic Smart Street Lighting System
  const [smartLightingActive, setSmartLightingActive] = useState<boolean>(true);
  const smartLightingActiveRef = useRef<boolean>(true);
  smartLightingActiveRef.current = smartLightingActive;
  const [smartLightTelemetry, setSmartLightTelemetry] = useState<{
    avgIntensity: number;
    activeSurgePoles: number;
    energySavedPct: number;
  }>({ avgIntensity: 45, activeSurgePoles: 4, energySavedPct: 58 });

  // Smart Vehicle Traffic Telemetry (Emergency slowdowns & Intersection hold tracking)
  const [smartTrafficTelemetry, setSmartTrafficTelemetry] = useState<{
    stoppedCount: number;
    slowedCount: number;
    emergencyVehicleActive: boolean;
    avgSpeedKmh: number;
  }>({ stoppedCount: 0, slowedCount: 0, emergencyVehicleActive: false, avgSpeedKmh: 48 });

  // Cinematic Post-Processing Bloom State (UnrealBloomPass)
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const bloomEnabledRef = useRef<boolean>(true);
  bloomEnabledRef.current = bloomEnabled;
  const [bloomStrength, setBloomStrength] = useState<number>(0.65);
  const bloomStrengthRef = useRef<number>(0.65);
  bloomStrengthRef.current = bloomStrength;

  // 3D Asset Loading Manager & Progress Tracking State
  const [isLoading3D, setIsLoading3D] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [loadingStage, setLoadingStage] = useState<string>('Initializing spatial computing kernel...');
  const [loadedAssetCount, setLoadedAssetCount] = useState<number>(0);
  const [totalAssetCount, setTotalAssetCount] = useState<number>(0);
  const loadingManagerRef = useRef<THREE.LoadingManager | null>(null);

  const cycleWeather = () => {
    setWeatherCondition((prev) => {
      if (prev === 'clear') return 'rain';
      if (prev === 'rain') return 'snow';
      return 'clear';
    });
  };

  const selectWeather = (w: WeatherCondition) => {
    setWeatherCondition(w);
    onOperationalEventRef.current?.(
      w === 'rain'
        ? {
            severity: 'WARNING',
            source: 'WEATHER ENGINE',
            zone: 'All Districts',
            title: 'Rain Simulation Active · Stormwater Retention & Traction Adjust',
            detail: 'Aqueduct storm valves open and smart streetlights calibrated for wet asphalt reflectance.',
            zoneId: 'zone-harbor',
          }
        : w === 'snow'
          ? {
              severity: 'WARNING',
              source: 'WEATHER ENGINE',
              zone: 'Harbor Bridge & Corridors',
              title: 'Light Snow Simulation · Thermal De-Icing Cables Engaged',
              detail: 'Harbor bridge heating coils and reduced V2X braking distances active across corridors.',
              zoneId: 'zone-harbor',
            }
          : {
              severity: 'SUCCESS',
              source: 'WEATHER ENGINE',
              zone: 'All Districts',
              title: 'Clear Atmospheric Visibility Restored',
              detail: 'Dry roadway traction and peak solar photovoltaic capture efficiency resumed.',
              zoneId: 'zone-skyline',
            }
    );
  };

  // 3-Second Day / Night Transition States
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionTimeRemaining, setTransitionTimeRemaining] = useState<string>('3.0');
  const [transitionPercent, setTransitionPercent] = useState<number>(0);
  const [uiProgress, setUiProgress] = useState<number>(0.0); // 0.0 = night, 1.0 = day
  const [solarElevation, setSolarElevation] = useState<string>('-36° SUB-HORIZON');
  const [autoCycleEnabled, setAutoCycleEnabled] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const vehiclesRef = useRef<THREE.Mesh[]>([]);
  const dronesGroupRef = useRef<THREE.Group | null>(null);
  const flightPathSplinesRef = useRef<THREE.Line[]>([]);
  const droneRotorsRef = useRef<THREE.Mesh[]>([]);
  const droneBeaconsRef = useRef<{ mesh: THREE.Mesh; baseColor: THREE.Color; isStrobe?: boolean }[]>([]);
  const droneSpotlightsRef = useRef<THREE.SpotLight[]>([]);
  const flightPathManagerRef = useRef<{
    kill: () => void;
    setFlightPathsVisible: (v: boolean) => void;
    setDronesVisible: (v: boolean) => void;
  } | null>(null);
  const sensorsGroupRef = useRef<THREE.Group | null>(null);
  const turbinesRef = useRef<THREE.Mesh[]>([]);
  const emergencyLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const moonDirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const blueRimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const clickableMeshesRef = useRef<THREE.Mesh[]>([]);

  // Celestial Object System References
  const celestialGroupRef = useRef<THREE.Group | null>(null);
  const sunMeshRef = useRef<THREE.Group | null>(null);
  const sunHaloRef = useRef<THREE.Mesh | null>(null);
  const moonMeshRef = useRef<THREE.Group | null>(null);
  const moonHaloRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  // Weather Particle System References
  const weatherGroupRef = useRef<THREE.Group | null>(null);
  const rainPointsRef = useRef<THREE.Points | null>(null);
  const snowPointsRef = useRef<THREE.Points | null>(null);
  const rainPositionsRef = useRef<Float32Array | null>(null);
  const snowPositionsRef = useRef<Float32Array | null>(null);
  const rainSpeedsRef = useRef<Float32Array | null>(null);
  const snowSpeedsRef = useRef<Float32Array | null>(null);
  const snowPhasesRef = useRef<Float32Array | null>(null);
  const snowDriftsRef = useRef<Float32Array | null>(null);

  // City Material References for Day/Night Response
  const buildingMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const buildingWindowLinesRef = useRef<THREE.LineSegments[]>([]);
  const buildingFacetsRef = useRef<{
    canvas: HTMLCanvasElement;
    texture: THREE.CanvasTexture;
    height: number;
    width: number;
    idx: number;
    buildingId?: string;
  }[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);

  // Dynamic Parameter Refs for Render Loop
  const emergencyActiveRef = useRef<boolean>(emergencyActive);
  emergencyActiveRef.current = emergencyActive;
  const trafficEnabledRef = useRef<boolean>(trafficEnabled);
  trafficEnabledRef.current = trafficEnabled;
  const renewableEnergyActiveRef = useRef<boolean>(renewableEnergyActive);
  renewableEnergyActiveRef.current = renewableEnergyActive;
  const waterHighlightedRef = useRef<boolean>(waterHighlighted);
  waterHighlightedRef.current = waterHighlighted;
  const windowLightsActiveRef = useRef<boolean>(true);
  windowLightsActiveRef.current = windowLightsActive;
  const flightPathsVisibleRef = useRef<boolean>(true);
  flightPathsVisibleRef.current = flightPathsVisible;

  // Smart Street Lighting System References (uses pooled corridor PointLights for high FPS)
  const streetLightingGroupRef = useRef<THREE.Group | null>(null);
  const corridorLightsRef = useRef<{ laneX: number; light: THREE.PointLight }[]>([]);
  const smartStreetLightsRef = useRef<{
    headMesh: THREE.Mesh;
    roadPuddleMesh: THREE.Mesh;
    poleMesh: THREE.Mesh;
    position: THREE.Vector3;
    baseIntensity: number;
    currentIntensity: number;
    corridorName: string;
    laneX: number;
    lampZ: number;
  }[]>([]);

  // Smart Vehicles Ref with Autonomous Intersection V2X Deceleration & Emergency Stop Physics
  const smartVehiclesRef = useRef<{
    group: THREE.Group;
    bodyMesh: THREE.Mesh;
    baseSpeed: number;
    currentSpeed: number;
    laneX: number;
    corridor: string;
    isEmergencyVehicle?: boolean;
    tailLightL?: THREE.Mesh;
    tailLightR?: THREE.Mesh;
    sirenLight?: THREE.PointLight;
    headLightMesh?: THREE.Mesh;
    brakeGlowMesh?: THREE.Mesh;
    state: 'cruising' | 'slowing' | 'stopped';
    type: 'sedan' | 'suv' | 'bus' | 'emergency';
  }[]>([]);

  // Post-Processing Pipeline References (EffectComposer & UnrealBloomPass)
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  // Animated Cyber-Grid Base Plane References
  const cyberGridMeshRef = useRef<THREE.Mesh | null>(null);
  const cyberGridTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const cyberGridMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const cyberGridHelperRef = useRef<THREE.GridHelper | null>(null);
  const cyberGridVelocityRef = useRef<{ vx: number; vz: number }>({ vx: 0, vz: 0 });

  // 3D Zone Highlight References
  const zoneHighlightGroupRef = useRef<THREE.Group | null>(null);
  const zoneRingMeshRef = useRef<THREE.Mesh | null>(null);
  const zoneDiskMeshRef = useRef<THREE.Mesh | null>(null);
  const zoneBeaconMeshRef = useRef<THREE.Mesh | null>(null);
  const buildingLinesByZoneRef = useRef<Record<string, THREE.LineSegments[]>>({});

  const applyZoneHighlight3D = (zone: CityZone | null) => {
    if (!zoneHighlightGroupRef.current) return;

    if (!zone) {
      zoneHighlightGroupRef.current.visible = false;
      // Reset all building wireframe lines
      Object.entries(buildingLinesByZoneRef.current).forEach(([_, lines]) => {
        lines.forEach((line, idx) => {
          if (line.material instanceof THREE.LineBasicMaterial) {
            line.material.color.setHex(idx % 2 === 0 ? 0xd4a853 : 0x94a3b8);
            line.material.opacity = 0.55;
          }
        });
      });
      return;
    }

    // Position at zone ground center
    zoneHighlightGroupRef.current.position.set(zone.center[0], 0.4, zone.center[2]);
    zoneHighlightGroupRef.current.visible = true;

    // Scale to zone radius
    const scaleFactor = zone.boundsRadius / 70;
    zoneHighlightGroupRef.current.scale.set(scaleFactor, 1, scaleFactor);

    // Update highlight colors
    if (zoneRingMeshRef.current) {
      (zoneRingMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(zone.accentHex);
    }
    if (zoneDiskMeshRef.current) {
      (zoneDiskMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(zone.accentHex);
    }
    if (zoneBeaconMeshRef.current) {
      (zoneBeaconMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(zone.accentHex);
    }

    // Accentuate buildings in this zone, dim others
    Object.entries(buildingLinesByZoneRef.current).forEach(([zId, lines]) => {
      const isTarget = zId === zone.id;
      lines.forEach(line => {
        if (line.material instanceof THREE.LineBasicMaterial) {
          if (isTarget) {
            line.material.color.setHex(zone.accentHex);
            line.material.opacity = 1.0;
          } else {
            line.material.color.setHex(0x1e293b);
            line.material.opacity = 0.25;
          }
        }
      });
    });
  };

  const handleZoneSelect = (zone: CityZone | null) => {
    setActiveZone(zone);
    activeZoneRef.current = zone;
    onSelectZone?.(zone);
    applyZoneHighlight3D(zone);

    // Smooth camera focus towards the selected zone
    if (zone && cameraRef.current) {
      const offsetX = zone.id === 'zone-colony' ? -115 : 120;
      const offsetY = zone.id === 'zone-colony' ? 110 : 125;
      const offsetZ = zone.id === 'zone-colony' ? 150 : 140;
      camFlightRef.current = {
        active: true,
        targetPos: new THREE.Vector3(zone.center[0] + offsetX, offsetY, zone.center[2] + offsetZ),
        targetLook: new THREE.Vector3(zone.center[0], 14, zone.center[2]),
      };
    }
  };

  const flyToCamera = (pos: [number, number, number], look: [number, number, number]) => {
    camFlightRef.current = {
      active: true,
      targetPos: new THREE.Vector3(pos[0], pos[1], pos[2]),
      targetLook: new THREE.Vector3(look[0], look[1], look[2]),
    };
  };

  const toggleThirdPersonMode = (enable: boolean) => {
    setFollowPerson(enable);
    followPersonRef.current = enable;
    if (enable && thirdPersonRef.current) {
      const p = thirdPersonRef.current.getPosition();
      const yaw = thirdPersonRef.current.getHeading();
      const camDist = 18;
      flyToCamera(
        [p.x - Math.sin(yaw) * camDist, 10, p.z - Math.cos(yaw) * camDist],
        [p.x + Math.sin(yaw) * 3, 3.4, p.z + Math.cos(yaw) * 3]
      );
    }
  };

  const inspectCityLandmarkById = (landmarkId: string) => {
    if (INTERACTIVE_OBJECTS[landmarkId]) {
      setSelectedObject(INTERACTIVE_OBJECTS[landmarkId]);
      return;
    }
    const landmarkMesh = clickableMeshesRef.current.find((m) => m.userData?.id === landmarkId);
    const zoneId = landmarkMesh?.userData?.zoneId as string | undefined;
    const bldgName = (landmarkMesh?.userData?.name as string | undefined) || landmarkId.toUpperCase();
    const targetZone = zoneId ? CITY_ZONES.find((z) => z.id === zoneId) : undefined;
    if (targetZone) {
      handleZoneSelect(targetZone);
      setSelectedObject({
        id: landmarkId,
        name: bldgName,
        type: 'building',
        engineers: targetZone.leadEngineers,
        status: `Sector: ${targetZone.shortName} • Active`,
        telemetry: [
          { label: 'District', value: targetZone.district },
          { label: 'Air Quality', value: `${targetZone.stats.aqi.value} AQI (${targetZone.stats.aqi.label})` },
          { label: 'Grid Load', value: `${targetZone.stats.energy.loadMw} MW (${targetZone.stats.energy.renewablePct}% Clean)` },
          { label: 'Traffic Speed', value: `${targetZone.stats.traffic.speedKmh} km/h (${targetZone.stats.traffic.flow})` },
        ],
        description: targetZone.description,
      });
    }
  };

  const inspectColonyHouseById = (houseId: string) => {
    const house = colonyHousesRef.current.find((h) => h.id === houseId);
    if (!house) return;
    onSelectHouse(house.id);
    setSelectedObject({
      id: house.id,
      houseId: house.id,
      name: `${house.id} · ${house.ownerName}`,
      type: 'colony-house',
      engineers: ['CSE', 'ECE', 'AI / ML', 'Civil Engineering'],
      status:
        house.status === 'ALERT_ACTIVE'
          ? 'CRITICAL SECURITY EVENT ACTIVE'
          : house.awayMode.enabled
            ? `Home Away Mode Armed (${house.awayMode.durationDays} Days)`
            : 'Occupied · All Sensors Nominal',
      description: `${house.floors}-Storey ${house.designType} on ${house.streetName}. Security ID: ${house.securityId}. Hybrid local Sub-GHz mesh + 128 GB edge storage + battery backup.`,
      telemetry: [
        { label: 'Door / Window', value: `${house.sensors.doorSensor} / ${house.sensors.windowSensor}` },
        { label: 'Motion / Object', value: `${house.sensors.motionSensor} / ${house.sensors.objectPresence}` },
        { label: 'Camera / Net', value: `${house.devices.cameraStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'} / ${house.devices.internetStatus === 'CONNECTED' ? 'SYNCED' : 'LOCAL'}` },
        { label: 'Power / Batt', value: `${house.devices.powerSource} (${house.devices.batteryPct}%)` },
      ],
    });
    onOperationalEventRef.current?.({
      severity: house.status === 'ALERT_ACTIVE' ? 'CRITICAL' : house.awayMode.enabled ? 'WARNING' : 'INFO',
      source: '3D TWIN',
      zone: `Shanti Vihar · ${house.id}`,
      title: `3D Inspection: ${house.id} (${house.ownerName})`,
      detail: `${house.floors}-Storey ${house.designType} · Security ${house.securityId} · Status: ${house.status.replace('_', ' ')}.`,
      zoneId: 'zone-colony',
    });
  };

  const walkCharacterTo = (x: number, z: number) => {
    setFollowPerson(true);
    followPersonRef.current = true;
    const ctrl = thirdPersonRef.current;
    if (ctrl) {
      const curPos = ctrl.getPosition();
      ctrl.walkTo(x, z);
      if (!cameraRef.current || cameraRef.current.position.distanceTo(curPos) > 75) {
        flyToCamera([curPos.x - 17, 10, curPos.z + 7], [curPos.x + 8, 3.6, curPos.z]);
      }
    }
  };

  const enterColonyWithPerson = () => {
    setFollowPerson(true);
    followPersonRef.current = true;
    setActiveJourneyStep('inside-colony');

    const ctrl = thirdPersonRef.current;
    if (ctrl) {
      const p = ctrl.getPosition();
      if (p.x < 164) {
        // Walk toward & straight through Main Gate so physical proximity sensor opens Boom Barrier!
        ctrl.walkTo(198, 120);
        flyToCamera([p.x - 16, 9.5, p.z + 7], [p.x + 12, 3.6, p.z]);
      } else {
        ctrl.walkTo(250, 120);
        flyToCamera([p.x - 16, 10.5, p.z + 8], [p.x + 12, 3.6, p.z]);
      }
    } else {
      onToggleGate(true);
      flyToCamera([134, 11, 128], [186, 4.5, 120]);
    }

    const colZone = CITY_ZONES.find((z) => z.id === 'zone-colony');
    if (colZone) {
      setActiveZone(colZone);
      onSelectZone?.(colZone);
      applyZoneHighlight3D(colZone);
    }
  };

  const resetWalkerToGate = () => {
    thirdPersonRef.current?.teleportTo(134, 120, Math.PI / 2);
    setFollowPerson(true);
    followPersonRef.current = true;
    setActiveJourneyStep('colony-gate');
    flyToCamera([116, 10, 127], [156, 4, 120]);
  };

  const handleJourneyStep = (stepId: CityJourneyStepId) => {
    const step = CITY_JOURNEY_STEPS.find((s) => s.id === stepId);
    if (!step) return;
    setActiveJourneyStep(stepId);

    if (stepId === 'inside-colony') {
      enterColonyWithPerson();
      return;
    }

    setFollowPerson(false);
    followPersonRef.current = false;

    if (stepId === 'colony-gate') {
      flyToCamera([128, 10.5, 130], [155, 4.2, 120]);
      setSelectedObject(INTERACTIVE_OBJECTS['colony-main-gate']);
      return;
    }

    flyToCamera(step.cameraPos, step.lookAt);

    if (stepId === 'explore-homes') {
      onToggleGate(true);
      const colZone = CITY_ZONES.find((z) => z.id === 'zone-colony');
      if (colZone) {
        setActiveZone(colZone);
        onSelectZone?.(colZone);
        applyZoneHighlight3D(colZone);
      }
    } else if (stepId === 'smart-building') {
      const skyZone = CITY_ZONES.find((z) => z.id === 'zone-skyline');
      if (skyZone) {
        setActiveZone(skyZone);
        onSelectZone?.(skyZone);
        applyZoneHighlight3D(skyZone);
      }
      setSelectedObject(INTERACTIVE_OBJECTS['smart-building']);
    } else if (stepId === 'guard-cabin') {
      setSelectedObject(INTERACTIVE_OBJECTS['colony-guard-cabin']);
    }
  };

  // Sync prop changes from outside (e.g. CityDashboard sector selector)
  useEffect(() => {
    if (propSelectedZone !== undefined) {
      setActiveZone(propSelectedZone);
      activeZoneRef.current = propSelectedZone;
      applyZoneHighlight3D(propSelectedZone);
    }
  }, [propSelectedZone]);

  const toggleFlightPaths = () => {
    const next = !flightPathsVisible;
    setFlightPathsVisible(next);
    flightPathsVisibleRef.current = next;
    flightPathSplinesRef.current.forEach((line) => {
      line.visible = next && dronesVisible;
    });
  };

  // Re-randomize window light patterns dynamically across all skyscrapers
  const randomizeWindowPatterns = () => {
    const newSeed = Math.floor(Math.random() * 100000) + 1;
    setWindowPatternSeed(newSeed);
    buildingFacetsRef.current.forEach((facet) => {
      drawBuildingWindowCanvas(
        facet.canvas, 
        facet.height, 
        facet.width, 
        newSeed + facet.idx * 173, 
        facet.buildingId
      );
      facet.texture.needsUpdate = true;
    });
  };

  const toggleWindowLights = () => {
    const next = !windowLightsActive;
    setWindowLightsActive(next);
    windowLightsActiveRef.current = next;
    applyDayNightCycle(cycleProgressRef.current, emergencyActiveRef.current);
  };

  // 3-Second Transition State Machine
  const cycleProgressRef = useRef<number>(0.0); // 0.0 = night, 0.5 = twilight, 1.0 = day
  const transitionStateRef = useRef<{
    isTransitioning: boolean;
    startTime: number;
    duration: number; // 3000ms = 3.0s
    startVal: number;
    targetVal: number;
    autoCycle: boolean;
  }>({
    isTransitioning: false,
    startTime: 0,
    duration: 3000,
    startVal: 0.0,
    targetVal: 0.0,
    autoCycle: false
  });
  const lastUiUpdateRef = useRef<number>(0);

  // Function to apply continuous day-night cycle parameters across scene
  const applyDayNightCycle = (progress: number, emergency: boolean) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 1. Sky & Fog Colors: Smoothly interpolate between warm atmospheric blue day and Sovereign Obsidian night sky
    const nightSky = new THREE.Color(0x09090d);
    const twilightSky = new THREE.Color(0x281726);
    const daySky = new THREE.Color(0x38bdf8);

    const nightFog = new THREE.Color(0x09090d);
    const twilightFog = new THREE.Color(0x351d2e);
    const dayFog = new THREE.Color(0x7dd3fc);

    const curSky = new THREE.Color();
    const curFog = new THREE.Color();

    if (progress <= 0.5) {
      const t = progress / 0.5;
      curSky.copy(nightSky).lerp(twilightSky, t);
      curFog.copy(nightFog).lerp(twilightFog, t);
    } else {
      const t = (progress - 0.5) / 0.5;
      curSky.copy(twilightSky).lerp(daySky, t);
      curFog.copy(twilightFog).lerp(dayFog, t);
    }

    if (emergency) {
      curSky.lerp(new THREE.Color(0x28040d), 0.6);
      curFog.lerp(new THREE.Color(0x28040d), 0.6);
    }

    // Atmospheric Weather blending: Rain casts an overcast blue-slate tone, Snow casts a frosty ambient mist
    const weather = weatherConditionRef.current;
    if (weather === 'rain') {
      curSky.lerp(new THREE.Color(0x0a1424), 0.45);
      curFog.lerp(new THREE.Color(0x0f1d32), 0.55);
    } else if (weather === 'snow') {
      curSky.lerp(new THREE.Color(0x162234), 0.40);
      curFog.lerp(new THREE.Color(0x1f2e42), 0.50);
    }

    // Update scene background and atmospheric distance fog smoothly
    scene.background = curSky;
    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.copy(curFog);
      let baseFogDensity = THREE.MathUtils.lerp(0.0035, 0.0020, progress);
      if (weather === 'rain') baseFogDensity *= 1.35;
      else if (weather === 'snow') baseFogDensity *= 1.25;
      (scene.fog as THREE.FogExp2).density = baseFogDensity;
    }

    // 2. Celestial positions: Sun and Moon along opposing celestial arcs
    // Sun angle ranges from below horizon (-0.22*PI) up to zenith (+0.38*PI)
    const sunAngle = THREE.MathUtils.lerp(-Math.PI * 0.22, Math.PI * 0.38, progress);
    const sunX = Math.cos(sunAngle) * 380;
    const sunY = Math.sin(sunAngle) * 340;
    const sunZ = 120 + Math.sin(sunAngle * 2) * 50;

    if (sunMeshRef.current) {
      sunMeshRef.current.position.set(sunX, sunY, sunZ);
      sunMeshRef.current.visible = sunY > -70;
      if (cameraRef.current && sunHaloRef.current) {
        sunHaloRef.current.lookAt(cameraRef.current.position);
      }
    }

    // Moon is positioned 180° opposite along celestial orbit
    const moonAngle = sunAngle + Math.PI;
    const moonX = Math.cos(moonAngle) * 380;
    const moonY = Math.sin(moonAngle) * 340;
    const moonZ = -120 - Math.sin(sunAngle * 2) * 50;

    if (moonMeshRef.current) {
      moonMeshRef.current.position.set(moonX, moonY, moonZ);
      moonMeshRef.current.visible = moonY > -70;
      if (cameraRef.current && moonHaloRef.current) {
        moonHaloRef.current.lookAt(cameraRef.current.position);
      }
    }

    // 3. DirectionalLight representing the Sun / Moon:
    // Adjusts position along orbital trajectory, adjusts intensity, and adjusts color
    if (dirLightRef.current) {
      // Position: Smoothly tracks the Sun during Day/Twilight and Moon during Night
      const sunPos = new THREE.Vector3(sunX, Math.max(35, sunY), sunZ);
      const moonPos = new THREE.Vector3(moonX, Math.max(35, moonY), moonZ);
      const celestialTarget = progress >= 0.5 ? sunPos : moonPos;
      dirLightRef.current.position.lerp(celestialTarget, 0.5);

      // Intensity: Night moonlight (~1.3) -> Twilight golden glow (~2.1) -> Radiant daylight (~3.2)
      let targetIntensity: number;
      if (progress <= 0.5) {
        const t = progress / 0.5;
        targetIntensity = THREE.MathUtils.lerp(1.3, 2.1, t);
      } else {
        const t = (progress - 0.5) / 0.5;
        targetIntensity = THREE.MathUtils.lerp(2.1, 3.2, t);
      }
      dirLightRef.current.intensity = targetIntensity;

      // Color: Cool Moonlit Silver-Cyan (0x93c5fd) -> Warm Sunset Amber (0xf59e0b) -> Radiant Sunlight (0xfffaed)
      const nightColor = new THREE.Color(0x93c5fd);
      const twilightColor = new THREE.Color(0xf59e0b);
      const dayColor = new THREE.Color(0xfffaed);
      const celestialColor = new THREE.Color();

      if (progress <= 0.5) {
        const t = progress / 0.5;
        celestialColor.copy(nightColor).lerp(twilightColor, t);
      } else {
        const t = (progress - 0.5) / 0.5;
        celestialColor.copy(twilightColor).lerp(dayColor, t);
      }
      dirLightRef.current.color.copy(celestialColor);
    }

    if (moonDirLightRef.current) {
      moonDirLightRef.current.position.set(moonX, Math.max(30, moonY), moonZ);
      const moonIntensity = THREE.MathUtils.clamp((1.0 - progress * 1.5) * 1.2, 0, 1.2);
      moonDirLightRef.current.intensity = moonIntensity;
      moonDirLightRef.current.color.setHex(0x38bdf8);
    }

    // 4. AmbientLight: deep cyber navy -> warm twilight -> bright atmospheric blue
    if (ambientLightRef.current) {
      if (emergency) {
        ambientLightRef.current.intensity = 2.0;
        ambientLightRef.current.color.setHex(0x3d0510);
      } else {
        const nightAmb = new THREE.Color(0x0c1e3a);
        const twilightAmb = new THREE.Color(0x28183c);
        const dayAmb = new THREE.Color(0x93c5fd);

        const curAmb = new THREE.Color();
        if (progress <= 0.5) {
          curAmb.copy(nightAmb).lerp(twilightAmb, progress / 0.5);
        } else {
          curAmb.copy(twilightAmb).lerp(dayAmb, (progress - 0.5) / 0.5);
        }
        ambientLightRef.current.color.copy(curAmb);
        ambientLightRef.current.intensity = THREE.MathUtils.lerp(0.9, 2.4, progress);
      }
    }

    // 5. Starfield visibility
    if (starsRef.current) {
      const starMat = starsRef.current.material as THREE.PointsMaterial;
      starMat.opacity = Math.max(0, (1.0 - progress * 1.5) * 0.95);
    }

    // 6. Water canal color & emissive reflectance
    if (waterMeshRef.current) {
      const waterMat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
      const nightWater = new THREE.Color(0x002244);
      const dayWater = new THREE.Color(0x0284c7);
      waterMat.color.copy(nightWater.clone().lerp(dayWater, progress));
      waterMat.emissiveIntensity = THREE.MathUtils.lerp(0.4, 0.12, progress);
    }

    // 7. Building Materials: Emissive illuminated windows toggling on during night mode
    // At night (progress = 0.0): emissive windows illuminate brightly with randomized patterns (intensity ~2.4)
    // At day (progress = 1.0): emissive windows toggle off (intensity ~0.0) as natural sunlight takes over
    // At twilight (progress = 0.5): windows begin switching on as offices light up for dusk (intensity ~1.0)
    const nightFactor = THREE.MathUtils.clamp(1.0 - progress, 0, 1);
    const windowEmissiveIntensity = windowLightsActiveRef.current
      ? Math.pow(nightFactor, 1.25) * 2.4
      : 0.0;

    buildingMaterialsRef.current.forEach((mat) => {
      if (mat.wireframe) {
        mat.emissiveIntensity = THREE.MathUtils.lerp(1.5, 0.4, progress);
      } else {
        mat.emissiveIntensity = windowEmissiveIntensity;
      }
    });

    // 8. Building Window Neon Lines & Edge Glow
    buildingWindowLinesRef.current.forEach((line) => {
      const mat = line.material as THREE.LineBasicMaterial;
      // At night: vibrant glowing cyan/blue neons (0.75 opacity). At day: subtle architectural glass reflections (0.18 opacity)
      mat.opacity = THREE.MathUtils.lerp(0.75, 0.18, progress);
    });

    // 9. Drone Searchlights & Beacons
    droneSpotlightsRef.current.forEach((spot) => {
      // Powerful illumination beam piercing the night, subdued in daylight
      spot.intensity = emergency ? 3.8 : THREE.MathUtils.lerp(2.8, 0.8, progress);
    });
  };

  // Trigger smooth 3-second Day/Night transition
  const triggerTransition = (target: 'night' | 'twilight' | 'day' | 'cycle') => {
    let targetVal = 0.0;
    if (target === 'night') targetVal = 0.0;
    else if (target === 'twilight') targetVal = 0.5;
    else if (target === 'day') targetVal = 1.0;
    else if (target === 'cycle') {
      targetVal = cycleProgressRef.current > 0.5 ? 0.0 : 1.0;
    }

    const currentVal = cycleProgressRef.current;
    if (Math.abs(currentVal - targetVal) < 0.02 && target === 'cycle') {
      targetVal = currentVal > 0.5 ? 0.0 : 1.0;
    }

    transitionStateRef.current = {
      ...transitionStateRef.current,
      isTransitioning: true,
      startTime: performance.now(),
      duration: 3000, // exact 3.0 seconds transition
      startVal: currentVal,
      targetVal: targetVal
    };
    setIsTransitioning(true);
    setTransitionTimeRemaining('3.0');
    setTransitionPercent(0);

    if (targetVal === 0.0) {
      setLightingMode('night');
      onOperationalEventRef.current?.({
        severity: 'INFO',
        source: 'LIGHTING ENGINE',
        zone: 'Metropolitan Grid',
        title: 'Celestial Cycle Shifted to Obsidian Night',
        detail: 'Adaptive corridor street luminaires and illuminated skyscraper facades energized.',
        zoneId: 'zone-skyline',
      });
    } else if (targetVal === 0.5) {
      setLightingMode('twilight');
      onOperationalEventRef.current?.({
        severity: 'INFO',
        source: 'LIGHTING ENGINE',
        zone: 'Metropolitan Grid',
        title: 'Celestial Cycle Shifted to Golden Hour Twilight',
        detail: 'Solar output tapering while battery banks and street grid transition smoothly.',
        zoneId: 'zone-grid',
      });
    } else {
      setLightingMode('day');
      onOperationalEventRef.current?.({
        severity: 'SUCCESS',
        source: 'LIGHTING ENGINE',
        zone: 'Metropolitan Grid',
        title: 'Celestial Cycle Shifted to Daylight Peak',
        detail: 'Rooftop solar arrays operating at maximum irradiance; streetlights switched to standby.',
        zoneId: 'zone-agritech',
      });
    }
  };

  const toggleAutoCycle = () => {
    const next = !autoCycleEnabled;
    setAutoCycleEnabled(next);
    transitionStateRef.current.autoCycle = next;
    if (next && !transitionStateRef.current.isTransitioning) {
      triggerTransition('cycle');
    }
  };

  // Safe WebGL initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      // 0. Three.js LoadingManager for deterministic 3D asset tracking and smooth entry
      const loadingManager = new THREE.LoadingManager();
      loadingManagerRef.current = loadingManager;

      loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
        setIsLoading3D(true);
        setLoadedAssetCount(itemsLoaded);
        setTotalAssetCount(itemsTotal);
        setLoadingStage('Mounting high-density digital twin geometry...');
      };

      loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        setLoadedAssetCount(itemsLoaded);
        setTotalAssetCount(itemsTotal);
        const pct = itemsTotal > 0 ? Math.round((itemsLoaded / itemsTotal) * 100) : 0;
        setLoadProgress(pct);

        if (pct < 30) {
          setLoadingStage('Generating procedural high-rise facade textures...');
        } else if (pct < 60) {
          setLoadingStage('Calibrating cyber-grid substrate & optical water shader...');
        } else if (pct < 85) {
          setLoadingStage('Linking autonomous drone flight paths & traffic meshes...');
        } else {
          setLoadingStage('Booting UnrealBloomPass cinematic post-processing pipeline...');
        }
      };

      loadingManager.onLoad = () => {
        setLoadProgress(100);
        setLoadingStage('Spatial Twin Synchronized • Initializing Simulation');
        // Graceful exit delay for seamless visual presentation
        loadingTimer = setTimeout(() => {
          setIsLoading3D(false);
        }, 550);
      };

      loadingManager.onError = (url) => {
        console.warn('Three.js LoadingManager asset warning for:', url);
      };

      // 1. Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x09090d);
      scene.fog = new THREE.FogExp2(0x09090d, 0.0032);

      // Register procedural asset milestones with LoadingManager
      loadingManager.itemStart('three/cyber-grid');
      loadingManager.itemStart('three/facade-textures');
      loadingManager.itemStart('three/road-network');
      loadingManager.itemStart('three/sensor-grid');
      loadingManager.itemStart('three/post-processing');

      // 2. Camera setup
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;
      const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2800);
      camera.position.set(220, 160, 240);
      camera.lookAt(orbitTargetRef.current);
      cameraRef.current = camera;

      // 3. Renderer setup with Hardware / Software-WebGL guard
      const isSoftwareGl = (() => {
        try {
          const probe = document.createElement('canvas').getContext('webgl2');
          if (!probe) return true;
          const ext = probe.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
          const gpu = String(probe.getParameter(param));
          probe.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        } catch {
          return false;
        }
      })();
      isSoftwareGlRef.current = isSoftwareGl;

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Procedural Studio Environment Map for authentic metallic & glass reflections
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();

      // 3B. Half-resolution UnrealBloomPass Post-Processing Pipeline (skipped on software WebGL for responsive 60fps UI)
      if (!isSoftwareGl) {
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2))),
          0.55,
          0.4,
          0.32
        );
        composer.addPass(bloomPass);
        bloomPassRef.current = bloomPass;

        const outputPass = new OutputPass();
        composer.addPass(outputPass);
        composerRef.current = composer;
      }
      loadingManager.itemEnd('three/post-processing');

      // 4. Lighting System
      const ambient = new THREE.AmbientLight(0x161822, 0.95);
      scene.add(ambient);
      ambientLightRef.current = ambient;

      // Primary Directional Light (Sun Light) with tightened shadow frustum
      const sunDirLight = new THREE.DirectionalLight(0xfffaed, 0.0);
      sunDirLight.position.set(160, 260, 100);
      sunDirLight.castShadow = !isSoftwareGl;
      sunDirLight.shadow.mapSize.width = 1024;
      sunDirLight.shadow.mapSize.height = 1024;
      sunDirLight.shadow.camera.left = -260;
      sunDirLight.shadow.camera.right = 260;
      sunDirLight.shadow.camera.top = 260;
      sunDirLight.shadow.camera.bottom = -260;
      sunDirLight.shadow.camera.near = 20;
      sunDirLight.shadow.camera.far = 700;
      scene.add(sunDirLight);
      dirLightRef.current = sunDirLight;

      // Secondary Directional Light (Moon Light)
      const moonDirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
      moonDirLight.position.set(-160, 240, -120);
      scene.add(moonDirLight);
      moonDirLightRef.current = moonDirLight;

      // Subtle cyan/blue rim accent light
      const blueRim = new THREE.DirectionalLight(0x3b82f6, 1.0);
      blueRim.position.set(-150, 100, -100);
      scene.add(blueRim);
      blueRimLightRef.current = blueRim;

      // Emergency red beacon light
      const emergencyLight = new THREE.PointLight(0xff0044, 0, 350);
      emergencyLight.position.set(0, 60, 0);
      scene.add(emergencyLight);
      emergencyLightRef.current = emergencyLight;

      // 5. Celestial Object System (Stars, Sun, Moon)
      const celestialGroup = new THREE.Group();
      scene.add(celestialGroup);
      celestialGroupRef.current = celestialGroup;

      // Starfield (1200 glittering stars across the night dome)
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1200;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const rad = 650 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 0.94);
        starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = rad * Math.cos(phi) + 10;
        starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xe0f2fe,
        size: 2.2,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const stars = new THREE.Points(starGeo, starMat);
      celestialGroup.add(stars);
      starsRef.current = stars;

      // Sun Object System
      const sunGroup = new THREE.Group();
      // Sun Core
      const sunCoreGeo = new THREE.SphereGeometry(15, 32, 32);
      const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xfff5cc });
      const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat);
      sunGroup.add(sunCore);

      // Sun Corona / Inner Glow
      const sunCoronaGeo = new THREE.SphereGeometry(23, 24, 24);
      const sunCoronaMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const sunCorona = new THREE.Mesh(sunCoronaGeo, sunCoronaMat);
      sunGroup.add(sunCorona);

      // Sun Radiant Halo Ring
      const sunHaloGeo = new THREE.RingGeometry(18, 42, 32);
      const sunHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const sunHalo = new THREE.Mesh(sunHaloGeo, sunHaloMat);
      sunGroup.add(sunHalo);
      sunHaloRef.current = sunHalo;

      celestialGroup.add(sunGroup);
      sunMeshRef.current = sunGroup;

      // Moon Object System
      const moonGroup = new THREE.Group();
      // Moon Core
      const moonCoreGeo = new THREE.SphereGeometry(12, 32, 32);
      const moonCoreMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        emissive: 0x93c5fd,
        emissiveIntensity: 0.35,
        roughness: 0.7,
        metalness: 0.1
      });
      const moonCore = new THREE.Mesh(moonCoreGeo, moonCoreMat);
      moonGroup.add(moonCore);

      // Moon Aura Glow
      const moonHaloGeo = new THREE.SphereGeometry(18, 24, 24);
      const moonHaloMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const moonHalo = new THREE.Mesh(moonHaloGeo, moonHaloMat);
      moonGroup.add(moonHalo);

      // Moon Ring Flare
      const moonRingGeo = new THREE.RingGeometry(14, 28, 32);
      const moonRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const moonRing = new THREE.Mesh(moonRingGeo, moonRingMat);
      moonGroup.add(moonRing);
      moonHaloRef.current = moonRing;

      celestialGroup.add(moonGroup);
      moonMeshRef.current = moonGroup;

      // 6. Atmospheric Weather Particle System (Rain & Light Snow Simulation)
      const weatherGroup = new THREE.Group();
      weatherGroup.name = 'WeatherAtmosphereGroup';
      scene.add(weatherGroup);
      weatherGroupRef.current = weatherGroup;

      // A. Rain Particle System
      // 5,000 active raindrops falling with steep downward velocity and wind slant
      const rainCount = 5000;
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      const rainSpeeds = new Float32Array(rainCount);

      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 440;
        rainPositions[i * 3 + 1] = Math.random() * 240;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 440;
        rainSpeeds[i] = 7.0 + Math.random() * 4.5;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      rainPositionsRef.current = rainPositions;
      rainSpeedsRef.current = rainSpeeds;

      const rainTex = createRainDropTexture();
      const rainMat = new THREE.PointsMaterial({
        color: 0xa5f3fc,
        size: 5.4,
        map: rainTex,
        transparent: true,
        opacity: 0.76,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const rainPoints = new THREE.Points(rainGeo, rainMat);
      rainPoints.name = 'RainParticleSystem';
      rainPoints.visible = weatherConditionRef.current === 'rain';
      weatherGroup.add(rainPoints);
      rainPointsRef.current = rainPoints;

      // B. Light Snow Particle System
      // 3,800 crystalline snowflakes drifting with gentle flutter and horizontal breeze
      const snowCount = 3800;
      const snowGeo = new THREE.BufferGeometry();
      const snowPositions = new Float32Array(snowCount * 3);
      const snowSpeeds = new Float32Array(snowCount);
      const snowPhases = new Float32Array(snowCount);
      const snowDrifts = new Float32Array(snowCount);

      for (let i = 0; i < snowCount; i++) {
        snowPositions[i * 3] = (Math.random() - 0.5) * 440;
        snowPositions[i * 3 + 1] = Math.random() * 240;
        snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 440;
        snowSpeeds[i] = 0.65 + Math.random() * 0.95;
        snowPhases[i] = Math.random() * Math.PI * 2;
        snowDrifts[i] = 0.3 + Math.random() * 0.5;
      }
      snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
      snowPositionsRef.current = snowPositions;
      snowSpeedsRef.current = snowSpeeds;
      snowPhasesRef.current = snowPhases;
      snowDriftsRef.current = snowDrifts;

      const snowTex = createSnowflakeTexture();
      const snowMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5.8,
        map: snowTex,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const snowPoints = new THREE.Points(snowGeo, snowMat);
      snowPoints.name = 'SnowParticleSystem';
      snowPoints.visible = weatherConditionRef.current === 'snow';
      weatherGroup.add(snowPoints);
      snowPointsRef.current = snowPoints;

      // 7. Build City Elements Group
      const cityGroup = new THREE.Group();
      scene.add(cityGroup);
      objectsGroupRef.current = cityGroup;

      clickableMeshesRef.current = [];
      buildingMaterialsRef.current = [];
      buildingWindowLinesRef.current = [];
      buildingFacetsRef.current = [];
      buildingLinesByZoneRef.current = {
        'zone-skyline': [],
        'zone-biomedical': [],
        'zone-harbor': [],
        'zone-agritech': [],
        'zone-grid': [],
        'zone-colony': []
      };

      // 3D Zone Highlight Visualization Group (Holographic radar disk, beacon, and boundary ring)
      const zoneHighlightGroup = new THREE.Group();
      zoneHighlightGroup.name = 'ZoneHighlightGroup';
      zoneHighlightGroup.visible = false;
      scene.add(zoneHighlightGroup);
      zoneHighlightGroupRef.current = zoneHighlightGroup;

      // Outer boundary glowing ring
      const ringGeo = new THREE.RingGeometry(68, 71, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.6;
      zoneHighlightGroup.add(ringMesh);
      zoneRingMeshRef.current = ringMesh;

      // Inner radar disk
      const diskGeo = new THREE.CircleGeometry(68, 64);
      const diskMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      });
      const diskMesh = new THREE.Mesh(diskGeo, diskMat);
      diskMesh.rotation.x = -Math.PI / 2;
      diskMesh.position.y = 0.5;
      zoneHighlightGroup.add(diskMesh);
      zoneDiskMeshRef.current = diskMesh;

      // Vertical holographic beacon cylinder
      const beaconGeo = new THREE.CylinderGeometry(1, 32, 170, 32, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 85;
      zoneHighlightGroup.add(beaconMesh);
      zoneBeaconMeshRef.current = beaconMesh;

      // A. Ground Grid & Substrate (Sovereign Obsidian + Champagne Brass Grid)
      const groundGeo = new THREE.PlaneGeometry(1150, 860, 20, 20);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x07070b,
        roughness: 0.95,
        metalness: 0.12
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(125, -0.5, 20);
      cityGroup.add(ground);

      const cyberGridCanvas = document.createElement('canvas');
      cyberGridCanvas.width = 512;
      cyberGridCanvas.height = 512;
      const ctx = cyberGridCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = 'rgba(212, 168, 83, 0.14)';
        ctx.lineWidth = 1.5;
        const subStep = 32;
        for (let i = 0; i <= 512; i += subStep) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 512);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(512, i);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(212, 168, 83, 0.45)';
        ctx.lineWidth = 3;
        const majorStep = 128;
        for (let i = 0; i <= 512; i += majorStep) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 512);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(512, i);
          ctx.stroke();
        }

        for (let x = 0; x <= 512; x += majorStep) {
          for (let y = 0; y <= 512; y += majorStep) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
            grad.addColorStop(0, 'rgba(232, 198, 120, 0.9)');
            grad.addColorStop(0.4, 'rgba(212, 168, 83, 0.35)');
            grad.addColorStop(1, 'rgba(212, 168, 83, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f8f6f0';
            ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          }
        }
      }

      const cyberGridTexture = new THREE.CanvasTexture(cyberGridCanvas);
      cyberGridTexture.wrapS = THREE.RepeatWrapping;
      cyberGridTexture.wrapT = THREE.RepeatWrapping;
      cyberGridTexture.repeat.set(30, 24);
      cyberGridTextureRef.current = cyberGridTexture;

      const cyberGridPlaneGeo = new THREE.PlaneGeometry(1150, 860);
      const cyberGridPlaneMat = new THREE.MeshBasicMaterial({
        map: cyberGridTexture,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const cyberGridMesh = new THREE.Mesh(cyberGridPlaneGeo, cyberGridPlaneMat);
      cyberGridMesh.rotation.x = -Math.PI / 2;
      cyberGridMesh.position.set(125, 0.02, 20);
      cityGroup.add(cyberGridMesh);
      cyberGridMeshRef.current = cyberGridMesh;
      cyberGridMaterialRef.current = cyberGridPlaneMat;

      const gridHelper = new THREE.GridHelper(1100, 90, 0xd4a853, 0x16161e);
      gridHelper.position.set(125, 0.04, 20);
      cityGroup.add(gridHelper);
      cyberGridHelperRef.current = gridHelper;
      loadingManager.itemEnd('three/cyber-grid');

      // B. Water Canal / Harbor
      const waterGeo = new THREE.BoxGeometry(100, 1, 600);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x002b4d,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x00152b,
        emissiveIntensity: 0.4
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.set(-180, -0.4, 0);
      water.userData = { id: 'smart-water', name: 'HARBOR MARINA WATERWAY', zoneId: 'zone-harbor' };
      clickableMeshesRef.current.push(water);
      cityGroup.add(water);
      waterMeshRef.current = water;

      // C. Buildings & Skyscrapers
      const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x0c1a32,
        roughness: 0.2,
        metalness: 0.85,
        emissive: 0x021124,
        emissiveIntensity: 0.2
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.85
      });

      // City Grid Layout with Zone District Mapping
      const buildingPositions = [
        // Sector 1: Downtown Financial Core (Skyline Core)
        { x: -50, z: -40, w: 26, h: 140, d: 26, id: 'smart-building', name: 'NEXUS TOWER 01', zoneId: 'zone-skyline' },
        { x: -30, z: 70, w: 30, h: 90, d: 30, id: 'smart-building-2', name: 'CIVIC CENTER', zoneId: 'zone-skyline' },
        { x: -70, z: 20, w: 20, h: 80, d: 20, id: 'west-tower', name: 'WEST COMMERCIAL TOWER', zoneId: 'zone-skyline' },
        { x: -50, z: 140, w: 26, h: 80, d: 26, id: 'south-commerce', name: 'SOUTH COMMERCE TOWER', zoneId: 'zone-skyline' },

        // Sector 2: Biomedical & Health District
        { x: 30, z: -60, w: 24, h: 170, d: 24, id: 'smart-hospital', name: 'SMART HOSPITAL', zoneId: 'zone-biomedical' },
        { x: 10, z: -120, w: 26, h: 100, d: 26, id: 'medtech-research', name: 'MEDTECH RESEARCH TOWER', zoneId: 'zone-biomedical' },
        { x: -60, z: -110, w: 22, h: 85, d: 22, id: 'genomics-labs', name: 'GENOMICS LABS', zoneId: 'zone-biomedical' },
        { x: -20, z: -170, w: 24, h: 75, d: 24, id: 'north-airhub', name: 'NORTH AIR-HUB', zoneId: 'zone-biomedical' },

        // Sector 4: Eco-Agri & Vertical Sky-Farm
        { x: 60, z: 20, w: 28, h: 120, d: 28, id: 'smart-farm', name: 'VERTICAL SKY-FARM', zoneId: 'zone-agritech' },
        { x: 40, z: 90, w: 22, h: 110, d: 22, id: 'bio-dome', name: 'BIO-DOME TOWER', zoneId: 'zone-agritech' },
        { x: 70, z: 150, w: 22, h: 65, d: 22, id: 'agri-valley', name: 'AGRI-VALLEY COMMONS', zoneId: 'zone-agritech' },

        // Sector 5: Smart Grid & Aerospace Hub
        { x: 80, z: -30, w: 25, h: 95, d: 25, id: 'aerospace-logistics', name: 'AEROSPACE LOGISTICS TOWER', zoneId: 'zone-grid' }
      ];

      buildingPositions.forEach((b, idx) => {
        const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);

        // Generate unique procedural window texture with randomized illuminated patterns
        const { texture: winTex, canvas: winCanvas } = createSkyscraperWindowTexture(
          b.w, 
          b.h, 
          idx * 137 + 42, 
          b.id
        );

        // Store reference for dynamic re-randomization and pattern regeneration
        buildingFacetsRef.current.push({
          canvas: winCanvas,
          texture: winTex,
          height: b.h,
          width: b.w,
          idx,
          buildingId: b.id
        });

        // Building Facade Material with Emissive window mapping
        const bMeshMat = new THREE.MeshStandardMaterial({
          color: 0x091426,
          roughness: 0.25,
          metalness: 0.85,
          map: winTex,
          emissiveMap: winTex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 2.4, // Controlled dynamically by applyDayNightCycle
        });

        // Dark metallic rooftop material
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0x060f1e,
          roughness: 0.8,
          metalness: 0.5,
          emissive: 0x020712,
          emissiveIntensity: 0.2
        });

        // Multi-material box: Facade on the 4 vertical sides (+X, -X, +Z, -Z), dark substrate on top/bottom (+Y, -Y)
        const mesh = new THREE.Mesh(bGeo, [
          bMeshMat,
          bMeshMat,
          roofMat,
          roofMat,
          bMeshMat,
          bMeshMat
        ]);
        mesh.position.set(b.x, b.h / 2, b.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        buildingMaterialsRef.current.push(bMeshMat);

        mesh.userData = { 
          id: b.id, 
          name: b.name, 
          zoneId: b.zoneId 
        };
        clickableMeshesRef.current.push(mesh);

        cityGroup.add(mesh);

        // Glowing Window Lines (Brass & Steel Architectural Frame)
        const edges = new THREE.EdgesGeometry(bGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0xd4a853 : 0x94a3b8,
          transparent: true,
          opacity: 0.55
        });
        const line = new THREE.LineSegments(edges, lineMat);
        buildingWindowLinesRef.current.push(line);
        if (buildingLinesByZoneRef.current[b.zoneId]) {
          buildingLinesByZoneRef.current[b.zoneId].push(line);
        }
        mesh.add(line);

        // Rooftop Beacon Light
        const beaconGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xe8c678 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, b.h / 2 + 1.5, 0);
        mesh.add(beacon);
      });
      loadingManager.itemEnd('three/facade-textures');

      // D. Smart Suspension Bridge over canal
      const bridgeGroup = new THREE.Group();
      const bridgeRoadGeo = new THREE.BoxGeometry(140, 3, 20);
      const bridgeRoad = new THREE.Mesh(bridgeRoadGeo, buildingMat);
      bridgeRoad.position.set(-180, 15, 0);
      bridgeRoad.userData = { id: 'smart-bridge', name: 'NEXUS HARBOR SMART BRIDGE', zoneId: 'zone-harbor' };
      clickableMeshesRef.current.push(bridgeRoad);
      bridgeGroup.add(bridgeRoad);

      // Bridge Pylons
      const pylonGeo = new THREE.BoxGeometry(6, 60, 6);
      const pylon1 = new THREE.Mesh(pylonGeo, buildingMat);
      pylon1.position.set(-210, 30, 0);
      pylon1.userData = { id: 'smart-bridge', name: 'NEXUS HARBOR SMART BRIDGE', zoneId: 'zone-harbor' };
      clickableMeshesRef.current.push(pylon1);

      const pylon2 = new THREE.Mesh(pylonGeo, buildingMat);
      pylon2.position.set(-150, 30, 0);
      pylon2.userData = { id: 'smart-bridge', name: 'NEXUS HARBOR SMART BRIDGE', zoneId: 'zone-harbor' };
      clickableMeshesRef.current.push(pylon2);

      bridgeGroup.add(pylon1, pylon2);

      // Bridge glowing stay cables
      const cableMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });
      for (let c = -50; c <= 50; c += 15) {
        const cableGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-210, 55, 0),
          new THREE.Vector3(-210 + c, 15, 0)
        ]);
        bridgeGroup.add(new THREE.Line(cableGeo, cableMat));
      }
      cityGroup.add(bridgeGroup);

      // E. Smart Grid Substation
      const gridSubstationGeo = new THREE.BoxGeometry(35, 14, 35);
      const gridSubstationMat = new THREE.MeshStandardMaterial({
        color: 0x112244,
        emissive: 0xeab308,
        emissiveIntensity: 0.3
      });
      const gridSubstation = new THREE.Mesh(gridSubstationGeo, gridSubstationMat);
      gridSubstation.position.set(130, 7, -100);
      gridSubstation.userData = { id: 'smart-grid', name: 'DISTRICT 02 SMART SUBSTATION & GRID', zoneId: 'zone-grid' };
      clickableMeshesRef.current.push(gridSubstation);
      cityGroup.add(gridSubstation);

      // Communication Tower with Pulsing Rings
      const towerBaseGeo = new THREE.CylinderGeometry(1, 4, 90, 8);
      const tower = new THREE.Mesh(towerBaseGeo, buildingMat);
      tower.position.set(130, 45, -100);
      tower.userData = { id: 'smart-grid', name: 'TELECOM PULSE TOWER', zoneId: 'zone-grid' };
      clickableMeshesRef.current.push(tower);
      cityGroup.add(tower);

      // F. Kinetic Wind Turbines
      turbinesRef.current = [];
      for (let t = 0; t < 3; t++) {
        const tPole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 50, 8), buildingMat);
        tPole.position.set(-260, 25, -80 + t * 80);
        cityGroup.add(tPole);

        const bladeHub = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), buildingMat);
        bladeHub.position.set(-260, 50, -80 + t * 80);

        const bladeGeo = new THREE.BoxGeometry(0.6, 22, 1.5);
        const bladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const b1 = new THREE.Mesh(bladeGeo, bladeMat);
        b1.position.y = 11;
        const b2 = new THREE.Mesh(bladeGeo, bladeMat);
        b2.rotation.z = (Math.PI * 2) / 3;
        b2.position.set(-9.5, -5.5, 0);
        const b3 = new THREE.Mesh(bladeGeo, bladeMat);
        b3.rotation.z = (Math.PI * 4) / 3;
        b3.position.set(9.5, -5.5, 0);

        bladeHub.add(b1, b2, b3);
        cityGroup.add(bladeHub);
        turbinesRef.current.push(bladeHub);
      }

      // G. Smart Road Network & Dynamic Street Lighting System
      const roadsGroup = new THREE.Group();
      roadsGroup.name = 'RoadsAndStreetLightsGroup';
      cityGroup.add(roadsGroup);

      // 1. Asphalt Road Surfaces & Lane Markings for Main Corridors (Avenue A: x=0, Avenue B: x=70)
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x070e1c,
        roughness: 0.85,
        metalness: 0.2
      });
      const roadAeroGeo = new THREE.BoxGeometry(16, 0.2, 500);
      
      const roadA = new THREE.Mesh(roadAeroGeo, roadMat);
      roadA.position.set(0, 0.08, 0);
      roadA.receiveShadow = true;
      roadsGroup.add(roadA);

      const roadB = new THREE.Mesh(roadAeroGeo, roadMat);
      roadB.position.set(70, 0.08, 0);
      roadB.receiveShadow = true;
      roadsGroup.add(roadB);

      // Connecting Cross-Boulevard (z=0)
      const crossRoadGeo = new THREE.BoxGeometry(220, 0.18, 14);
      const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat);
      crossRoad.position.set(35, 0.09, 0);
      roadsGroup.add(crossRoad);

      // Glowing Lane Striping
      const laneStripeMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.4
      });
      for (let s = -230; s <= 230; s += 20) {
        const stripeGeo = new THREE.PlaneGeometry(0.8, 6);
        const stripe1 = new THREE.Mesh(stripeGeo, laneStripeMat);
        stripe1.rotation.x = -Math.PI / 2;
        stripe1.position.set(0, 0.2, s);
        roadsGroup.add(stripe1);

        const stripe2 = new THREE.Mesh(stripeGeo, laneStripeMat);
        stripe2.rotation.x = -Math.PI / 2;
        stripe2.position.set(70, 0.2, s);
        roadsGroup.add(stripe2);
      }

      // 2. Smart Street Light Poles with Pooled Corridor PointLights & Optical Puddle Disks
      smartStreetLightsRef.current = [];
      corridorLightsRef.current = [];
      const streetLightsGroup = new THREE.Group();
      streetLightsGroup.name = 'DynamicStreetLights';
      cityGroup.add(streetLightsGroup);
      streetLightingGroupRef.current = streetLightsGroup;

      const poleMat = new THREE.MeshStandardMaterial({
        color: 0x1e2028,
        metalness: 0.8,
        roughness: 0.3
      });

      const lampSegments = [
        { laneX: 0, poleSide: -10, armAngle: 0, corridor: 'Metro Central Ave' },
        { laneX: 70, poleSide: 80, armAngle: Math.PI, corridor: 'Innovation Blvd' }
      ];

      // Pooled Corridor PointLights (2 total instead of 22, keeping dynamic PBR reflections at high FPS)
      lampSegments.forEach((seg) => {
        const pooledLight = new THREE.PointLight(0xffefc2, 0.9, 130, 1.5);
        pooledLight.position.set(seg.laneX, 15, 0);
        streetLightsGroup.add(pooledLight);
        corridorLightsRef.current.push({ laneX: seg.laneX, light: pooledLight });
      });

      lampSegments.forEach((corridor) => {
        for (let zPos = -190; zPos <= 190; zPos += 38) {
          const poleGroup = new THREE.Group();
          poleGroup.position.set(corridor.poleSide, 0, zPos);

          const poleGeo = new THREE.CylinderGeometry(0.4, 0.6, 15, 8);
          const poleMesh = new THREE.Mesh(poleGeo, poleMat);
          poleMesh.position.y = 7.5;
          poleGroup.add(poleMesh);

          const armGeo = new THREE.BoxGeometry(3, 0.3, 0.3);
          const armMesh = new THREE.Mesh(armGeo, poleMat);
          armMesh.position.set(corridor.laneX === 0 ? 1.5 : -1.5, 14.8, 0);
          poleGroup.add(armMesh);

          const headGeo = new THREE.BoxGeometry(1.6, 0.4, 0.8);
          const headMat = new THREE.MeshBasicMaterial({ color: 0xfff4d6 });
          const headMesh = new THREE.Mesh(headGeo, headMat);
          const lampWorldX = corridor.laneX;
          headMesh.position.set(corridor.laneX === 0 ? 2.8 : -2.8, 14.6, 0);
          poleGroup.add(headMesh);

          const puddleGeo = new THREE.CircleGeometry(11, 18);
          const puddleMat = new THREE.MeshBasicMaterial({
            color: 0xffeaad,
            transparent: true,
            opacity: 0.18,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          const puddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
          puddleMesh.rotation.x = -Math.PI / 2;
          puddleMesh.position.set(corridor.laneX, 0.22, zPos);
          streetLightsGroup.add(puddleMesh);

          poleMesh.userData = {
            id: 'smart-lighting',
            name: `SMART LUMINAIRE · ${corridor.corridor}`,
            zoneId: corridor.laneX === 0 ? 'zone-skyline' : 'zone-agritech'
          };
          clickableMeshesRef.current.push(poleMesh);
          streetLightsGroup.add(poleGroup);

          smartStreetLightsRef.current.push({
            headMesh,
            roadPuddleMesh: puddleMesh,
            poleMesh,
            position: new THREE.Vector3(lampWorldX, 14.2, zPos),
            baseIntensity: 0.35,
            currentIntensity: 0.35,
            corridorName: corridor.corridor,
            laneX: corridor.laneX,
            lampZ: zPos
          });
        }
      });

      // G2. Smart Vehicle Fleet & Intersection V2X Simulation
      vehiclesRef.current = [];
      smartVehiclesRef.current = [];
      const vehiclesGroup = new THREE.Group();
      vehiclesGroup.name = 'SmartVehiclesFleetGroup';
      cityGroup.add(vehiclesGroup);

      // Virtual Intersections Visual Indicator Ground Markings (at z=0 on Lane A x=0 and Lane B x=70)
      const intersectionGlowMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      });
      const stopBoxGeo = new THREE.PlaneGeometry(12, 1.2);
      [-1, 1].forEach((dir) => {
        [0, 70].forEach((laneX) => {
          const stopLine = new THREE.Mesh(stopBoxGeo, intersectionGlowMat);
          stopLine.rotation.x = -Math.PI / 2;
          stopLine.position.set(laneX, 0.23, dir * 18);
          vehiclesGroup.add(stopLine);
        });
      });

      // Spawn 14 Smart Vehicles across corridors with distinct profiles & colors
      const vehicleConfigs = [
        { type: 'emergency' as const, color: 0xff1e56, w: 3.4, h: 2.2, l: 7.2, baseSpeed: 1.4, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'bus' as const, color: 0x10b981, w: 3.8, h: 2.6, l: 9.5, baseSpeed: 0.72, corridor: 'Innovation Blvd', laneX: 70 },
        { type: 'sedan' as const, color: 0x00f0ff, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.05, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'suv' as const, color: 0x3b82f6, w: 3.2, h: 2.1, l: 6.2, baseSpeed: 0.95, corridor: 'Innovation Blvd', laneX: 70 },
        { type: 'sedan' as const, color: 0xa855f7, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.15, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'suv' as const, color: 0xf59e0b, w: 3.2, h: 2.1, l: 6.2, baseSpeed: 0.98, corridor: 'Innovation Blvd', laneX: 70 },
        { type: 'sedan' as const, color: 0x06b6d4, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.1, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'bus' as const, color: 0x14b8a6, w: 3.8, h: 2.6, l: 9.5, baseSpeed: 0.75, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'sedan' as const, color: 0x38bdf8, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.02, corridor: 'Innovation Blvd', laneX: 70 },
        { type: 'suv' as const, color: 0x6366f1, w: 3.2, h: 2.1, l: 6.2, baseSpeed: 0.96, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'sedan' as const, color: 0x22d3ee, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.08, corridor: 'Innovation Blvd', laneX: 70 },
        { type: 'suv' as const, color: 0xec4899, w: 3.2, h: 2.1, l: 6.2, baseSpeed: 0.94, corridor: 'Metro Central Ave', laneX: 0 },
        { type: 'sedan' as const, color: 0x0ea5e9, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.12, corridor: 'Innovation Blvd', laneX: 70 },
        { type: 'sedan' as const, color: 0x14b8a6, w: 2.8, h: 1.8, l: 5.6, baseSpeed: 1.0, corridor: 'Metro Central Ave', laneX: 0 }
      ];

      vehicleConfigs.forEach((cfg, idx) => {
        const vGroup = new THREE.Group();
        const initialZ = -220 + idx * 32 + (Math.random() * 8 - 4);
        vGroup.position.set(cfg.laneX, 1.1, initialZ);

        // Body chassis mesh
        const chassisGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.l);
        const chassisMat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.25,
          metalness: 0.7
        });
        const bodyMesh = new THREE.Mesh(chassisGeo, chassisMat);
        bodyMesh.castShadow = true;
        vGroup.add(bodyMesh);

        // Windshield cabin cap
        const cabGeo = new THREE.BoxGeometry(cfg.w * 0.85, cfg.h * 0.7, cfg.l * 0.55);
        const cabMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const cabMesh = new THREE.Mesh(cabGeo, cabMat);
        cabMesh.position.set(0, cfg.h * 0.65, -0.2);
        vGroup.add(cabMesh);

        // Front Headlights
        const headGeo = new THREE.BoxGeometry(cfg.w * 0.35, 0.4, 0.2);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.set(0, 0, cfg.l * 0.51);
        vGroup.add(headMesh);

        // Rear Tail & Brake Lights (Active red during emergency stop or deceleration)
        const tailGeo = new THREE.BoxGeometry(0.7, 0.4, 0.2);
        const tailMatL = new THREE.MeshBasicMaterial({ color: 0xd97706 });
        const tailMatR = new THREE.MeshBasicMaterial({ color: 0xd97706 });
        const tailL = new THREE.Mesh(tailGeo, tailMatL);
        tailL.position.set(-cfg.w * 0.35, 0, -cfg.l * 0.51);
        const tailR = new THREE.Mesh(tailGeo, tailMatR);
        tailR.position.set(cfg.w * 0.35, 0, -cfg.l * 0.51);
        vGroup.add(tailL);
        vGroup.add(tailR);

        // Under-chassis Brake Glow Mesh (Glows vibrant red on road when stopped at intersection)
        const brakeGlowGeo = new THREE.PlaneGeometry(cfg.w * 1.6, cfg.l * 1.3);
        const brakeGlowMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
        const brakeGlowMesh = new THREE.Mesh(brakeGlowGeo, brakeGlowMat);
        brakeGlowMesh.rotation.x = -Math.PI / 2;
        brakeGlowMesh.position.y = -0.95;
        vGroup.add(brakeGlowMesh);

        // Emergency Vehicle Siren Beacon & Strobe Light
        let sirenLight: THREE.PointLight | undefined = undefined;
        if (cfg.type === 'emergency') {
          const sirenDomeGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8);
          const sirenDomeMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
          const sirenMesh = new THREE.Mesh(sirenDomeGeo, sirenDomeMat);
          sirenMesh.position.set(0, cfg.h * 1.15, 0);
          vGroup.add(sirenMesh);

          sirenLight = new THREE.PointLight(0xff0033, 1.8, 35, 2);
          sirenLight.position.set(0, cfg.h * 1.25, 0);
          vGroup.add(sirenLight);
        }

        // Tag for raycasting & interactive telemetry inspection
        bodyMesh.userData = {
          id: cfg.type === 'emergency' ? 'smart-emergency-vehicle' : 'autonomous-vehicle',
          name: cfg.type === 'emergency' ? 'V2X RAPID TRAUMA INTERCEPTOR' : `SMART AV • ${cfg.corridor}`,
          type: cfg.type,
          baseSpeed: cfg.baseSpeed
        };
        clickableMeshesRef.current.push(bodyMesh);

        vehiclesGroup.add(vGroup);
        // Maintain backwards compatibility with legacy vehicles array for raycasting & light checks
        vehiclesRef.current.push(bodyMesh);

        smartVehiclesRef.current.push({
          group: vGroup,
          bodyMesh,
          baseSpeed: cfg.baseSpeed,
          currentSpeed: cfg.baseSpeed,
          laneX: cfg.laneX,
          corridor: cfg.corridor,
          isEmergencyVehicle: cfg.type === 'emergency',
          tailLightL: tailL,
          tailLightR: tailR,
          sirenLight,
          headLightMesh: headMesh,
          brakeGlowMesh,
          state: 'cruising',
          type: cfg.type
        });
      });

      // H. GSAP Flight Path Manager & Autonomous Drone Fleet
      const dronesGroup = new THREE.Group();
      dronesGroup.name = 'DronesAndCorridorsGroup';
      cityGroup.add(dronesGroup);
      dronesGroupRef.current = dronesGroup;

      flightPathSplinesRef.current = [];
      droneRotorsRef.current = [];
      droneBeaconsRef.current = [];
      droneSpotlightsRef.current = [];

      // 1. Define 3D Curved Flight Paths (Catmull-Rom Splines) navigating gracefully above the skyscrapers
      // Path Alpha: Perimeter Patrol & Waterfront Skyway Corridor (Altitude ~155m)
      const alphaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-145, 155, -120),
        new THREE.Vector3(-60, 160, -170),
        new THREE.Vector3(75, 165, -135),
        new THREE.Vector3(125, 152, -30),
        new THREE.Vector3(135, 158, 75),
        new THREE.Vector3(75, 162, 155),
        new THREE.Vector3(-45, 152, 165),
        new THREE.Vector3(-135, 156, 45)
      ], true, 'centripetal');

      // Path Beta: High-Altitude Skyscraper Canopy & Summit Flyover (Altitude ~185m - 198m)
      // Weaves above Nexus Tower 01 (h=140), Smart Hospital Trauma Rooftop (h=170), and Vertical Sky-Farm (h=120)
      const betaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-50, 185, -40),
        new THREE.Vector3(-12, 198, -52),
        new THREE.Vector3(30, 195, -60),
        new THREE.Vector3(82, 188, -12),
        new THREE.Vector3(60, 182, 25),
        new THREE.Vector3(22, 175, 75),
        new THREE.Vector3(-30, 172, 70),
        new THREE.Vector3(-72, 178, 12)
      ], true, 'centripetal');

      // Path Gamma: Tactical Cross-District Survey & River Skyway (Altitude ~138m - 148m)
      // Swoops between Cyberport Bridge, river docks, and Smart Grid Substation
      const gammaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-165, 142, -90),
        new THREE.Vector3(-118, 148, -25),
        new THREE.Vector3(-145, 140, 75),
        new THREE.Vector3(-75, 146, 110),
        new THREE.Vector3(5, 138, 65),
        new THREE.Vector3(55, 145, -45),
        new THREE.Vector3(-25, 140, -110)
      ], true, 'centripetal');

      // 2. Render Curved Neon Flight Path Splines (Visual Skyway Corridors)
      const flightCorridorDefs = [
        { id: 'path-alpha', name: 'Skyway Alpha (Perimeter Patrol)', curve: alphaCurve, color: 0x00f0ff },
        { id: 'path-beta', name: 'Skyway Beta (Tower Canopy)', curve: betaCurve, color: 0xa855f7 },
        { id: 'path-gamma', name: 'Skyway Gamma (Tactical Cross-District)', curve: gammaCurve, color: 0x10b981 }
      ];

      flightCorridorDefs.forEach((p) => {
        const pts = p.curve.getPoints(160);
        const splineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const splineMat = new THREE.LineBasicMaterial({
          color: p.color,
          transparent: true,
          opacity: 0.38,
          depthWrite: false
        });
        const splineLine = new THREE.Line(splineGeo, splineMat);
        splineLine.visible = flightPathsVisibleRef.current && dronesVisible;
        dronesGroup.add(splineLine);
        flightPathSplinesRef.current.push(splineLine);
      });

      // 3. Drone Fleet Configuration & 3D Primitive Spawning
      const droneConfigs = [
        {
          id: 'drone-alpha',
          aliasId: 'drone', // Links to default 'drone' inspection
          name: 'NEXUS SKYWAY PATROL 01',
          curve: alphaCurve,
          color: 0x00f0ff,
          duration: 32, // Duration in seconds for full loop
          initialProgress: 0.05,
          bobDuration: 1.85, // Sine easing bob period
          bobHeight: 3.2
        },
        {
          id: 'drone-beta',
          aliasId: 'drone-beta',
          name: 'TRAUMA MED-EVTOL DRONE 02',
          curve: betaCurve,
          color: 0xa855f7,
          duration: 27,
          initialProgress: 0.45,
          bobDuration: 2.1,
          bobHeight: 3.6
        },
        {
          id: 'drone-gamma',
          aliasId: 'drone-gamma',
          name: 'ECO-ATMOSPHERE SURVEYOR 03',
          curve: gammaCurve,
          color: 0x10b981,
          duration: 23,
          initialProgress: 0.75,
          bobDuration: 1.65,
          bobHeight: 2.8
        }
      ];

      const droneTweens: gsap.core.Tween[] = [];

      droneConfigs.forEach((dCfg) => {
        // A. Root Anchor Group (GSAP advances this along curved CatmullRom spline)
        const droneAnchor = new THREE.Group();
        droneAnchor.name = `DroneAnchor_${dCfg.id}`;
        droneAnchor.userData = { id: dCfg.id, aliasId: dCfg.aliasId, name: dCfg.name, type: 'drone' };
        dronesGroup.add(droneAnchor);

        // B. Bobbing & Micro-Wobble Group (GSAP animates vertical bobbing with sine easing)
        const droneBobbingGroup = new THREE.Group();
        droneBobbingGroup.name = `DroneBobbing_${dCfg.id}`;
        droneAnchor.add(droneBobbingGroup);

        // C. Central Fuselage / Carbon Fiber Body Pod
        const chassisMat = new THREE.MeshStandardMaterial({
          color: 0x091322,
          roughness: 0.32,
          metalness: 0.88,
          emissive: 0x020712,
          emissiveIntensity: 0.2
        });
        const bodyGeo = new THREE.BoxGeometry(4.2, 1.2, 5.4);
        const bodyMesh = new THREE.Mesh(bodyGeo, chassisMat);
        bodyMesh.castShadow = true;
        bodyMesh.userData = { id: dCfg.id, aliasId: dCfg.aliasId, name: dCfg.name, type: 'drone' };
        droneBobbingGroup.add(bodyMesh);
        clickableMeshesRef.current.push(bodyMesh);

        // Top Armor Plate
        const topPlate = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.3, 4.4),
          new THREE.MeshStandardMaterial({ color: 0x112240, roughness: 0.2, metalness: 0.9 })
        );
        topPlate.position.set(0, 0.65, -0.2);
        droneBobbingGroup.add(topPlate);

        // Optical Cockpit Dome / Sensor Visor
        const visorMat = new THREE.MeshStandardMaterial({
          color: dCfg.color,
          emissive: dCfg.color,
          emissiveIntensity: 1.8,
          roughness: 0.1,
          metalness: 0.9
        });
        const visorMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), visorMat);
        visorMesh.scale.set(1.1, 0.6, 1.6);
        visorMesh.position.set(0, 0.45, 1.6);
        droneBobbingGroup.add(visorMesh);

        // Dual Vertical Canted Tail Fins
        const finMat = new THREE.MeshStandardMaterial({ color: 0x07111e, metalness: 0.8, roughness: 0.3 });
        const leftFin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 1.2), finMat);
        leftFin.position.set(-1.4, 0.9, -2.4);
        const rightFin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 1.2), finMat);
        rightFin.position.set(1.4, 0.9, -2.4);
        droneBobbingGroup.add(leftFin);
        droneBobbingGroup.add(rightFin);

        // D. X-Quadcopter Rotor Arms
        const armMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.25 });
        const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 5.4, 8);
        const arm1 = new THREE.Mesh(armGeo, armMat);
        arm1.rotation.z = Math.PI / 2;
        arm1.rotation.y = Math.PI / 4;
        arm1.position.set(0, 0.2, 0);
        droneBobbingGroup.add(arm1);

        const arm2 = new THREE.Mesh(armGeo, armMat);
        arm2.rotation.z = Math.PI / 2;
        arm2.rotation.y = -Math.PI / 4;
        arm2.position.set(0, 0.2, 0);
        droneBobbingGroup.add(arm2);

        // E. Motor Nacelles & Spinning Aerodynamic Props
        const nacelleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.2 });
        const bladeMat = new THREE.MeshStandardMaterial({
          color: dCfg.color,
          emissive: dCfg.color,
          emissiveIntensity: 0.65,
          transparent: true,
          opacity: 0.72,
          roughness: 0.2
        });

        const nacelleOffsets = [
          { x: -3.2, z: 3.2 },
          { x: 3.2, z: 3.2 },
          { x: -3.2, z: -3.2 },
          { x: 3.2, z: -3.2 }
        ];

        nacelleOffsets.forEach((off, nIdx) => {
          const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.8, 12), nacelleMat);
          nacelle.position.set(off.x, 0.35, off.z);
          droneBobbingGroup.add(nacelle);

          // Glowing motor ring
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.66, 0.06, 6, 16),
            new THREE.MeshBasicMaterial({ color: dCfg.color })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.set(off.x, 0.55, off.z);
          droneBobbingGroup.add(ring);

          // Prop Hub & Spinning Rotor
          const rotorGroup = new THREE.Group();
          rotorGroup.position.set(off.x, 0.82, off.z);
          const blade1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.44), bladeMat);
          rotorGroup.add(blade1);

          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 8), nacelleMat);
          hub.position.set(0, 0.08, 0);
          rotorGroup.add(hub);

          rotorGroup.userData = {
            spinDir: nIdx % 2 === 0 ? 1 : -1,
            speed: 0.46
          };
          droneBobbingGroup.add(rotorGroup);
          droneRotorsRef.current.push(rotorGroup as unknown as THREE.Mesh);
        });

        // F. Downward Gimbal Searchlight Beam
        const gimbalHousing = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 10), nacelleMat);
        gimbalHousing.position.set(0, -0.65, 0.5);
        droneBobbingGroup.add(gimbalHousing);

        const lensMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.45, 0.2, 12),
          new THREE.MeshBasicMaterial({ color: dCfg.color })
        );
        lensMesh.rotation.x = Math.PI / 2;
        lensMesh.position.set(0, -0.85, 0.5);
        droneBobbingGroup.add(lensMesh);

        const spotLight = new THREE.SpotLight(dCfg.color, 2.6, 220, Math.PI / 7, 0.55);
        spotLight.position.set(0, -0.9, 0.5);
        spotLight.target.position.set(0, -120, 0.5);
        spotLight.castShadow = false;
        droneBobbingGroup.add(spotLight);
        droneBobbingGroup.add(spotLight.target);
        droneSpotlightsRef.current.push(spotLight);

        // G. Aviation Navigation Beacons
        const portBeacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        portBeacon.position.set(-3.2, 0.75, 0);
        droneBobbingGroup.add(portBeacon);
        droneBeaconsRef.current.push({ mesh: portBeacon, baseColor: new THREE.Color(0xef4444) });

        const stbdBeacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x22c55e })
        );
        stbdBeacon.position.set(3.2, 0.75, 0);
        droneBobbingGroup.add(stbdBeacon);
        droneBeaconsRef.current.push({ mesh: stbdBeacon, baseColor: new THREE.Color(0x22c55e) });

        const tailStrobe = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        tailStrobe.position.set(0, 0.95, -2.6);
        droneBobbingGroup.add(tailStrobe);
        droneBeaconsRef.current.push({ mesh: tailStrobe, baseColor: new THREE.Color(0xffffff), isStrobe: true });

        // H. Interactive Click Hitbox
        const hitbox = new THREE.Mesh(
          new THREE.BoxGeometry(9, 4.5, 9),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.userData = { id: dCfg.id, aliasId: dCfg.aliasId, name: dCfg.name, type: 'drone' };
        droneBobbingGroup.add(hitbox);
        clickableMeshesRef.current.push(hitbox);

        // 4. GSAP Flight Path Animation along 3D Curved Splines
        const pathState = { t: dCfg.initialProgress };
        const pathTween = gsap.to(pathState, {
          t: dCfg.initialProgress + 1.0,
          duration: dCfg.duration,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            const u = pathState.t % 1.0;
            const currentPos = dCfg.curve.getPointAt(u);
            const tangent = dCfg.curve.getTangentAt(u).normalize();

            // Position drone root anchor along 3D flight corridor above skyscrapers
            droneAnchor.position.copy(currentPos);

            // Orient drone smoothly facing along forward path trajectory
            const lookTarget = currentPos.clone().add(tangent);
            droneAnchor.lookAt(lookTarget);

            // Aeronautical banking roll when banking into curved turns
            const nextTangent = dCfg.curve.getTangentAt((u + 0.008) % 1.0).normalize();
            const cross = new THREE.Vector3().crossVectors(tangent, nextTangent);
            const rollAngle = THREE.MathUtils.clamp(cross.y * 38, -0.32, 0.32);
            droneAnchor.rotateZ(rollAngle);
          }
        });
        droneTweens.push(pathTween);

        // 5. GSAP Subtle Vertical Bobbing Animation using Sine Easing
        // Makes the drone movement feel organic and lifelike while patrolling the skyscrapers
        const bobbingTween = gsap.to(droneBobbingGroup.position, {
          y: dCfg.bobHeight, // Subtle organic vertical displacement (2.8m - 3.6m)
          duration: dCfg.bobDuration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut" // GSAP's sine easing for organic hovering!
        });
        droneTweens.push(bobbingTween);

        // Organic micro-pitch and roll fluctuation with GSAP sine easing
        const wobbleTween = gsap.to(droneBobbingGroup.rotation, {
          x: 0.042,
          z: 0.035,
          duration: dCfg.bobDuration * 1.25,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        droneTweens.push(wobbleTween);
      });

      // Register Flight Path Manager for clean external control & teardown
      flightPathManagerRef.current = {
        kill: () => {
          droneTweens.forEach((t) => t.kill());
        },
        setFlightPathsVisible: (v: boolean) => {
          flightPathSplinesRef.current.forEach((line) => {
            line.visible = v && (dronesGroupRef.current ? dronesGroupRef.current.visible : true);
          });
        },
        setDronesVisible: (v: boolean) => {
          if (dronesGroupRef.current) {
            dronesGroupRef.current.visible = v;
          }
          flightPathSplinesRef.current.forEach((line) => {
            line.visible = flightPathsVisibleRef.current && v;
          });
        }
      };
      loadingManager.itemEnd('three/road-network');

      // I. Sensor Nodes Group
      const sensorsGroup = new THREE.Group();
      cityGroup.add(sensorsGroup);
      sensorsGroupRef.current = sensorsGroup;

      for (let s = 0; s < 25; s++) {
        const sensor = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        sensor.position.set(
          (Math.random() - 0.5) * 280,
          2 + Math.random() * 8,
          (Math.random() - 0.5) * 280
        );
        sensorsGroup.add(sensor);
      }
      loadingManager.itemEnd('three/sensor-grid');

      // J. Realistic Indian Residential Colony (H-01 to H-30, Gate, Guard Cabin, Park, Emergency Exit)
      const colonyHandle = buildResidentialColony(
        cityGroup,
        colonyHousesRef.current,
        clickableMeshesRef.current,
        Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
      );
      colonyHandleRef.current = colonyHandle;
      colonyHandle.setGateOpen(gateOpenRef.current);
      colonyHandle.setGateWarning(gateWarningRef.current);

      // K. cannon-es City & Colony Physics World + Third-Person Character Controller
      const cityPhysics = createCityPhysicsWorld(buildingPositions, colonyHousesRef.current);
      const thirdPersonCtrl = new ThirdPersonController(
        cityGroup,
        colonyHousesRef.current,
        clickableMeshesRef.current,
        cityPhysics,
        Math.min(renderer.capabilities.getMaxAnisotropy(), 4),
        (inProximity, isInsideColony) => {
          // Physical Proximity Gate Trigger: approaching within 16.5m automatically opens Boom Barrier!
          if (inProximity) {
            onToggleGate(true);
            if (isInsideColony) {
              setActiveJourneyStep('inside-colony');
              const colZone = CITY_ZONES.find((z) => z.id === 'zone-colony');
              if (colZone) {
                setActiveZone(colZone);
                onSelectZone?.(colZone);
                applyZoneHighlight3D(colZone);
              }
            }
          } else {
            // Smoothly close boom barrier after character walks past checkpoint
            onToggleGate(false);
          }
        }
      );
      thirdPersonRef.current = thirdPersonCtrl;
      thirdPersonCtrl.setGateOpenState(gateOpenRef.current);

      // L. Low-Poly Humanoid User Avatar attached to the OrbitControls camera target
      const camTargetHumanoid = createLowPolyHumanoidMesh(clickableMeshesRef.current);
      camTargetHumanoid.group.position.set(
        orbitTargetRef.current.x,
        thirdPersonCtrl.groundHeightAt(orbitTargetRef.current.x, orbitTargetRef.current.z),
        orbitTargetRef.current.z
      );
      cityGroup.add(camTargetHumanoid.group);

      // 6. Raycaster & Pointer Event Handling
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let clickStartPos = { x: 0, y: 0 };

      const onPointerDownStart = (event: MouseEvent) => {
        clickStartPos = { x: event.clientX, y: event.clientY };
      };

      const handlePointerClick = (event: MouseEvent) => {
        if (event.button !== 0) return;
        const dragDist = Math.hypot(event.clientX - clickStartPos.x, event.clientY - clickStartPos.y);
        if (dragDist > 10) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableMeshesRef.current, false);

        if (intersects.length > 0) {
          const hit = intersects[0];
          const hitObj = hit.object;
          const { id: objId, zoneId, name: bldgName, colonyHouseId, walkSurface } = hitObj.userData;

          // 0. Click on a specific Indian Colony House (H-01 .. H-30)
          if (colonyHouseId) {
            setFollowPerson(false);
            followPersonRef.current = false;
            const house = colonyHousesRef.current.find((h) => h.id === colonyHouseId);
            if (house) {
              flyToCamera(
                [house.coordinates[0] - 18, 22, house.coordinates[2] + 28],
                [house.coordinates[0], 5, house.coordinates[2]]
              );
              inspectColonyHouseById(house.id);
              return;
            }
          }

          // Click on Standing 3P Character OR Colony Main Gate -> Walk through Gate via Proximity Trigger!
          if (objId === 'colony-entry-person' || objId === 'colony-main-gate') {
            enterColonyWithPerson();
            if (objId === 'colony-main-gate') {
              setSelectedObject(INTERACTIVE_OBJECTS['colony-main-gate']);
            }
            return;
          }

          // Click anywhere on Road / Ground -> Navigate Third-Person Character there smoothly!
          if (walkSurface) {
            const pt = hit.point;
            walkCharacterTo(pt.x, pt.z);
            return;
          }

          // 1. Zone selection and highlight update
          if (zoneId) {
            setFollowPerson(false);
            followPersonRef.current = false;
            const targetZone = CITY_ZONES.find(z => z.id === zoneId);
            if (targetZone) {
              handleZoneSelect(targetZone);
            }
          }

          // 2. Open Object / Zone Telemetry drawer
          if (objId && INTERACTIVE_OBJECTS[objId]) {
            const objMeta = INTERACTIVE_OBJECTS[objId];
            setSelectedObject(objMeta);
            onOperationalEventRef.current?.({
              severity: 'INFO',
              source: '3D TWIN',
              zone: bldgName || objMeta.name,
              title: `3D Asset Inspected: ${objMeta.name}`,
              detail: objMeta.status,
              zoneId: zoneId || undefined,
            });
          } else if (zoneId) {
            const targetZone = CITY_ZONES.find(z => z.id === zoneId);
            if (targetZone) {
              setSelectedObject({
                id: objId || zoneId,
                name: bldgName || targetZone.name,
                type: 'building',
                engineers: targetZone.leadEngineers,
                status: `Sector: ${targetZone.shortName} • Active`,
                telemetry: [
                  { label: 'District', value: targetZone.district },
                  { label: 'Air Quality', value: `${targetZone.stats.aqi.value} AQI (${targetZone.stats.aqi.label})` },
                  { label: 'Grid Load', value: `${targetZone.stats.energy.loadMw} MW (${targetZone.stats.energy.renewablePct}% Clean)` },
                  { label: 'Traffic Speed', value: `${targetZone.stats.traffic.speedKmh} km/h (${targetZone.stats.traffic.flow})` }
                ],
                description: targetZone.description
              });
            }
          }
        }
      };

      // Hover feedback for clickable building groups (throttled cleanly)
      let isOrbitInteracting = false;
      let lastHoverCheck = 0;
      const handlePointerHover = (event: MouseEvent) => {
        if (isOrbitInteracting) return;
        const nowHover = performance.now();
        if (nowHover - lastHoverCheck < 75) return;
        lastHoverCheck = nowHover;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableMeshesRef.current, false);

        if (intersects.length > 0) {
          renderer.domElement.style.cursor = intersects[0].object.userData.walkSurface ? 'crosshair' : 'pointer';
        } else {
          renderer.domElement.style.cursor = 'grab';
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDownStart);
      renderer.domElement.addEventListener('click', handlePointerClick);
      renderer.domElement.addEventListener('mousemove', handlePointerHover);

      // 7. Three.js OrbitControls with Keyboard WASD Third-Person Support
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.07;
      controls.minDistance = 8;
      controls.maxDistance = 760;
      controls.maxPolarAngle = Math.PI / 2.04;
      controls.screenSpacePanning = false;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.target.copy(orbitTargetRef.current);
      orbitControlsRef.current = controls;

      let prevOrbCamX = camera.position.x;
      let prevOrbCamZ = camera.position.z;

      const onOrbitStart = () => {
        isOrbitInteracting = true;
        camFlightRef.current.active = false;
      };
      const onOrbitEnd = () => {
        isOrbitInteracting = false;
      };
      const onOrbitChange = () => {
        orbitTargetRef.current.copy(controls.target);
        orbitTargetRef.current.x = THREE.MathUtils.clamp(orbitTargetRef.current.x, -260, 440);
        orbitTargetRef.current.z = THREE.MathUtils.clamp(orbitTargetRef.current.z, -240, 280);
        controls.target.copy(orbitTargetRef.current);

        cyberGridVelocityRef.current = {
          vx: (camera.position.x - prevOrbCamX) * 0.0018,
          vz: (camera.position.z - prevOrbCamZ) * 0.0018,
        };
        prevOrbCamX = camera.position.x;
        prevOrbCamZ = camera.position.z;
      };

      controls.addEventListener('start', onOrbitStart);
      controls.addEventListener('end', onOrbitEnd);
      controls.addEventListener('change', onOrbitChange);

      const onKeyDownWalk = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
          keysPressedRef.current[k] = true;
          if (k !== 'shift') {
            const wasFollowing = followPersonRef.current;
            if (!wasFollowing) {
              setFollowPerson(true);
              followPersonRef.current = true;
              // Smoothly re-frame camera behind character when starting WASD exploration from overview
              const p = thirdPersonCtrl.getPosition();
              if (camera.position.distanceTo(p) > 65 || controls.target.distanceTo(p) > 45) {
                const yaw = thirdPersonCtrl.getHeading();
                flyToCamera(
                  [p.x - Math.sin(yaw) * 19, 10.5, p.z - Math.cos(yaw) * 19],
                  [p.x, 3.4, p.z]
                );
              }
            }
          }
          if (e.key.startsWith('Arrow')) e.preventDefault();
        } else if (e.code === 'Space' && (followPersonRef.current || thirdPersonCtrl.isWalking())) {
          e.preventDefault();
          jumpPendingRef.current = true;
        } else if (k === 'e') {
          if (tpTelemetryRef.current.nearbyHouse) {
            inspectColonyHouseById(tpTelemetryRef.current.nearbyHouse.id);
          } else if (tpTelemetryRef.current.nearbyLandmarkId) {
            inspectCityLandmarkById(tpTelemetryRef.current.nearbyLandmarkId);
          }
        }
      };

      const onKeyUpWalk = (e: KeyboardEvent) => {
        keysPressedRef.current[e.key.toLowerCase()] = false;
      };

      const domElem = renderer.domElement;
      window.addEventListener('keydown', onKeyDownWalk);
      window.addEventListener('keyup', onKeyUpWalk);

      // 8. Animation Loop with IntersectionObserver Offscreen Pause & Smart UI Throttling
      const clock = new THREE.Clock();
      let hudSyncAccum = 0;
      let lastSentTpKey = '';
      let lastTrafficHudUpdate = 0;
      let lastLightHudUpdate = 0;
      let isInViewport = true;
      let isLoopPaused = false;

      // Pre-allocated payload object for zero-GC Mini-Map updates
      const miniMapSyncPayload: MiniMapSyncState = {
        x: 136,
        z: 120,
        heading: Math.PI / 2,
        camYaw: Math.PI / 2,
        isInsideColony: false,
        inGateProximity: false,
        gateOpen: false,
        isWalking: false,
        destX: null,
        destZ: null,
        zoneName: 'Colony Approach Road',
        orbitTargetX: 0,
        orbitTargetZ: 0,
        followPerson: false,
      };

      const animate = () => {
        if (!isInViewport) {
          isLoopPaused = true;
          return;
        }
        isLoopPaused = false;
        animId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.08);
        const time = clock.getElapsedTime();

        const keys = keysPressedRef.current;
        const fwdInput = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
        const strafeInput = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
        const sprintActive = Boolean(keys['shift'] || sprintLockedRef.current);
        const jumpRequested = jumpPendingRef.current;
        jumpPendingRef.current = false;

        if (
          (fwdInput !== 0 || strafeInput !== 0) &&
          camera.position.distanceTo(thirdPersonCtrl.characterGroup.position) < 65
        ) {
          camFlightRef.current.active = false;
        }

        thirdPersonCtrl.setGateOpenState(gateOpenRef.current);
        const tpUpdate = thirdPersonCtrl.update(delta, time, camera, {
          forward: fwdInput,
          strafe: strafeInput,
          sprint: sprintActive,
          jumpRequested,
        });

        // Only update React HUD telemetry when character is moving or state changed
        hudSyncAccum += delta;
        if (hudSyncAccum >= 0.16) {
          hudSyncAccum = 0;
          const t = tpUpdate.telemetry;
          const tpKey = `${Math.round(t.x)}_${Math.round(t.z)}_${t.isInsideColony}_${t.inGateProximity}_${t.nearbyHouse?.id || ''}_${t.nearbyLandmarkId || ''}_${t.physicsContact || ''}_${t.isGrounded}`;
          if (tpKey !== lastSentTpKey || t.isWalking) {
            const prevZone = tpTelemetryRef.current.zoneName;
            lastSentTpKey = tpKey;
            setTpTelemetry(t);
            if (t.isWalking && prevZone && t.zoneName !== prevZone) {
              onOperationalEventRef.current?.({
                severity: t.inGateProximity ? 'SUCCESS' : 'INFO',
                source: 'FIELD EXPLORER',
                zone: t.zoneName,
                title: `3P Explorer Crossed into ${t.zoneName}`,
                detail: `Coordinates (${Math.round(t.x)}, ${Math.round(t.z)}) · Surface: ${t.physicsSurface}.`,
                zoneId: t.isInsideColony ? 'zone-colony' : undefined,
              });
            }
          }
        }

        if (followPersonRef.current && (Math.abs(tpUpdate.deltaX) > 0.0001 || Math.abs(tpUpdate.deltaZ) > 0.0001)) {
          if (camFlightRef.current.active) {
            camFlightRef.current.targetPos.x += tpUpdate.deltaX;
            camFlightRef.current.targetPos.z += tpUpdate.deltaZ;
            camFlightRef.current.targetLook.x += tpUpdate.deltaX;
            camFlightRef.current.targetLook.z += tpUpdate.deltaZ;
          } else {
            camera.position.x += tpUpdate.deltaX;
            camera.position.z += tpUpdate.deltaZ;
            controls.target.x += tpUpdate.deltaX;
            controls.target.z += tpUpdate.deltaZ;
            orbitTargetRef.current.copy(controls.target);
          }
        }

        const distTargetToExplorer = Math.hypot(
          controls.target.x - thirdPersonCtrl.characterGroup.position.x,
          controls.target.z - thirdPersonCtrl.characterGroup.position.z
        );
        const showCamTargetAvatar = !(followPersonRef.current && distTargetToExplorer < 14);
        const avatarGroundY = thirdPersonCtrl.groundHeightAt(controls.target.x, controls.target.z);
        camTargetHumanoid.update(delta, time, controls.target.x, controls.target.z, avatarGroundY, showCamTargetAvatar);

        colonyHandle.update(delta, time);
        colonyHandle.updateHouseVisuals(colonyHousesRef.current, time);
        colonyHandle.setDayNight(cycleProgressRef.current);

        if (camFlightRef.current.active) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, camFlightRef.current.targetPos.x, 4.5, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, camFlightRef.current.targetPos.y, 4.5, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, camFlightRef.current.targetPos.z, 4.5, delta);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, camFlightRef.current.targetLook.x, 5.0, delta);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, camFlightRef.current.targetLook.y, 5.0, delta);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, camFlightRef.current.targetLook.z, 5.0, delta);
          orbitTargetRef.current.copy(controls.target);
          if (camera.position.distanceTo(camFlightRef.current.targetPos) < 0.8) {
            camFlightRef.current.active = false;
          }
        }

        controls.update();

        // Sync top-right Mini-Map imperatively (zero React state re-renders)
        if (miniMapRef.current) {
          const t = tpUpdate.telemetry;
          const dest = thirdPersonCtrl.getActiveDestination();
          miniMapSyncPayload.x = t.x;
          miniMapSyncPayload.z = t.z;
          miniMapSyncPayload.heading = thirdPersonCtrl.getHeading();
          miniMapSyncPayload.camYaw = Math.atan2(
            controls.target.x - camera.position.x,
            controls.target.z - camera.position.z
          );
          miniMapSyncPayload.isInsideColony = t.isInsideColony;
          miniMapSyncPayload.inGateProximity = t.inGateProximity;
          miniMapSyncPayload.gateOpen = gateOpenRef.current;
          miniMapSyncPayload.isWalking = t.isWalking;
          miniMapSyncPayload.destX = dest ? dest.x : null;
          miniMapSyncPayload.destZ = dest ? dest.z : null;
          miniMapSyncPayload.zoneName = t.zoneName;
          miniMapSyncPayload.orbitTargetX = controls.target.x;
          miniMapSyncPayload.orbitTargetZ = controls.target.z;
          miniMapSyncPayload.followPerson = followPersonRef.current;
          miniMapRef.current.sync(miniMapSyncPayload);
        }

        // 3-Second Day / Night Transition Interpolator (updates shadowMap & React UI ONLY while transitioning)
        const now = performance.now();
        const tState = transitionStateRef.current;
        if (tState.isTransitioning) {
          const elapsedMs = now - tState.startTime;
          const alpha = Math.min(1.0, Math.max(0.0, elapsedMs / tState.duration));
          const ease = alpha * alpha * (3 - 2 * alpha);
          cycleProgressRef.current = THREE.MathUtils.lerp(tState.startVal, tState.targetVal, ease);

          applyDayNightCycle(cycleProgressRef.current, emergencyActiveRef.current);
          renderer.shadowMap.needsUpdate = true;

          if (now - lastUiUpdateRef.current > 80 || alpha >= 1.0) {
            lastUiUpdateRef.current = now;
            setUiProgress(cycleProgressRef.current);
            const remaining = Math.max(0, (tState.duration - elapsedMs) / 1000);
            setTransitionTimeRemaining(remaining.toFixed(1));
            setTransitionPercent(Math.min(100, Math.max(0, (elapsedMs / tState.duration) * 100)));
            const elevDeg = Math.round(THREE.MathUtils.lerp(-36, 68, cycleProgressRef.current));
            setSolarElevation(elevDeg >= 0 ? `+${elevDeg}° ZENITH` : `${elevDeg}° SUB-HORIZON`);
          }

          if (alpha >= 1.0) {
            cycleProgressRef.current = tState.targetVal;
            tState.isTransitioning = false;
            setIsTransitioning(false);
            setTransitionPercent(100);
            setTransitionTimeRemaining('0.0');
            setUiProgress(cycleProgressRef.current);

            if (tState.autoCycle) {
              setTimeout(() => {
                if (transitionStateRef.current.autoCycle && !transitionStateRef.current.isTransitioning) {
                  const nextTarget = cycleProgressRef.current > 0.5 ? 0.0 : 1.0;
                  triggerTransition(nextTarget === 1.0 ? 'day' : 'night');
                }
              }, 1500);
            }
          }
        } else if (emergencyActiveRef.current) {
          applyDayNightCycle(cycleProgressRef.current, true);
        }

        // Kinetic wind turbines (responds to renewableEnergyActive)
        if (renewableEnergyActiveRef.current) {
          turbinesRef.current.forEach((t) => {
            t.rotation.z += delta * 1.5;
          });
        }

        // Water canal glow highlight (responds to waterHighlighted)
        if (waterMeshRef.current && waterHighlightedRef.current) {
          const wMat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
          wMat.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;
        }

        // Emergency point light pulsing
        if (emergencyLightRef.current) {
          if (emergencyActiveRef.current) {
            emergencyLightRef.current.intensity = 2.0 + (Math.sin(time * 8) + 1) * 2;
          } else {
            emergencyLightRef.current.intensity = 0;
          }
        }

        // Smart Vehicles Movement & Intersection V2X Deceleration / Emergency Halt Simulation
        if (trafficEnabledRef.current) {
          const isEmergency = emergencyActiveRef.current;
          let stoppedTotal = 0;
          let slowedTotal = 0;
          let cumulativeSpeed = 0;

          // Virtual intersection stop zones along roadways (Cross Boulevard intersection at z = 0)
          // Approaching vehicles coming from -z travel forward (+z), approaching z=0 from [-45, -6]
          const intersectionStopZoneStart = -42;
          const intersectionStopZoneEnd = -8;
          const intersectionSlowZoneStart = -95;

          smartVehiclesRef.current.forEach((sv) => {
            const z = sv.group.position.z;
            let targetSpeed = sv.baseSpeed;

            if (isEmergency) {
              if (sv.isEmergencyVehicle) {
                // Emergency interceptor cruiser accelerates to priority speed
                targetSpeed = sv.baseSpeed * 1.5;
                sv.state = 'cruising';

                // Strobe siren beacon and light pulse
                if (sv.sirenLight) {
                  const flash = Math.sin(time * 16) > 0.1 ? 2.5 : 0.2;
                  sv.sirenLight.intensity = flash;
                }
              } else {
                // Civilian smart vehicle behavior during Emergency:
                // Check if vehicle is approaching or in virtual intersection zone (z around 0)
                if (z >= intersectionStopZoneStart && z <= intersectionStopZoneEnd) {
                  // Full stop at intersection stop bar to yield to emergency vehicles & cross traffic
                  targetSpeed = 0;
                  sv.state = 'stopped';
                  stoppedTotal++;
                } else if (z >= intersectionSlowZoneStart && z < intersectionStopZoneStart) {
                  // Decelerating gently upon receiving V2X Emergency broadcast
                  targetSpeed = sv.baseSpeed * 0.25;
                  sv.state = 'slowing';
                  slowedTotal++;
                } else {
                  // General emergency caution speed restriction
                  targetSpeed = sv.baseSpeed * 0.45;
                  sv.state = 'slowing';
                  slowedTotal++;
                }
              }
            } else {
              // Normal traffic flow: cruise smoothly
              sv.state = 'cruising';
              if (sv.sirenLight) {
                sv.sirenLight.intensity = 0;
              }
            }

            // Smooth acceleration / braking lerp
            sv.currentSpeed = THREE.MathUtils.lerp(sv.currentSpeed, targetSpeed, sv.currentSpeed > targetSpeed ? 0.08 : 0.05);

            // Update 3D position
            sv.group.position.z += sv.currentSpeed;
            if (sv.group.position.z > 220) {
              sv.group.position.z = -220;
            }

            // Update tail lights & brake glow indicators
            const isBraking = sv.state === 'stopped' || sv.state === 'slowing';
            if (sv.tailLightL && sv.tailLightR) {
              const tailMatL = sv.tailLightL.material as THREE.MeshBasicMaterial;
              const tailMatR = sv.tailLightR.material as THREE.MeshBasicMaterial;
              if (isBraking) {
                tailMatL.color.setHex(0xff0022);
                tailMatR.color.setHex(0xff0022);
              } else {
                tailMatL.color.setHex(0x9a3412);
                tailMatR.color.setHex(0x9a3412);
              }
            }

            // Road brake light reflection
            if (sv.brakeGlowMesh) {
              const bgMat = sv.brakeGlowMesh.material as THREE.MeshBasicMaterial;
              bgMat.opacity = sv.state === 'stopped' ? 0.45 : sv.state === 'slowing' ? 0.25 : 0;
            }

            cumulativeSpeed += sv.currentSpeed;
          });

          // Sync smart vehicle coordinates with legacy raycast vehicles array
          smartVehiclesRef.current.forEach((sv, idx) => {
            if (vehiclesRef.current[idx]) {
              vehiclesRef.current[idx].position.copy(sv.group.position);
            }
          });

          // Update HUD Traffic telemetry cleanly at 1Hz
          if (now - lastTrafficHudUpdate >= 1000 && smartVehiclesRef.current.length > 0) {
            lastTrafficHudUpdate = now;
            const avgSpeed = (cumulativeSpeed / smartVehiclesRef.current.length) * 45;
            setSmartTrafficTelemetry({
              stoppedCount: stoppedTotal,
              slowedCount: slowedTotal,
              emergencyVehicleActive: isEmergency,
              avgSpeedKmh: Math.round(avgSpeed)
            });
          }
        }

        // Dynamic Smart Street Lighting System (Pooled corridor point lights + per-pole puddle projections)
        if (smartStreetLightsRef.current.length > 0) {
          const isEnabled = smartLightingActiveRef.current;
          const isNight = cycleProgressRef.current < 0.8;
          let totalIntensity = 0;
          let activeSurgeCount = 0;
          const brightestPosByLane: Record<number, { z: number; intensity: number }> = {
            0: { z: 0, intensity: 0 },
            70: { z: 0, intensity: 0 },
          };

          smartStreetLightsRef.current.forEach((lightObj) => {
            if (!isEnabled || !isNight) {
              (lightObj.headMesh.material as THREE.MeshBasicMaterial).color.setHex(isEnabled ? 0x475569 : 0x334155);
              lightObj.roadPuddleMesh.visible = false;
              return;
            }

            let localTrafficCount = 0;
            let nearestDist = 999;

            if (trafficEnabledRef.current) {
              vehiclesRef.current.forEach((veh) => {
                if (Math.abs(veh.position.x - lightObj.laneX) < 18) {
                  const distZ = Math.abs(veh.position.z - lightObj.lampZ);
                  if (distZ < 45) {
                    localTrafficCount += 1;
                    if (distZ < nearestDist) nearestDist = distZ;
                  }
                }
              });
            }

            let targetIntensity = 0.35;
            if (localTrafficCount > 0 && nearestDist < 45) {
              const proximityFactor = Math.max(0, 1 - nearestDist / 45);
              const densityBoost = Math.min(0.7, localTrafficCount * 0.35);
              targetIntensity = 0.35 + proximityFactor * (0.85 + densityBoost);
              activeSurgeCount++;
            }

            lightObj.currentIntensity = THREE.MathUtils.lerp(lightObj.currentIntensity, targetIntensity, 0.12);

            const track = brightestPosByLane[lightObj.laneX];
            if (track && lightObj.currentIntensity > track.intensity) {
              track.intensity = lightObj.currentIntensity;
              track.z = lightObj.lampZ;
            }

            const headMat = lightObj.headMesh.material as THREE.MeshBasicMaterial;
            if (localTrafficCount > 0) {
              headMat.color.setRGB(1.0, 0.96, 0.85);
            } else {
              headMat.color.setRGB(0.65, 0.55, 0.38);
            }

            lightObj.roadPuddleMesh.visible = true;
            const puddleMat = lightObj.roadPuddleMesh.material as THREE.MeshBasicMaterial;
            puddleMat.opacity = Math.min(0.45, 0.08 + lightObj.currentIntensity * 0.22);
            const puddleScale = 0.85 + lightObj.currentIntensity * 0.38;
            lightObj.roadPuddleMesh.scale.set(puddleScale, puddleScale, 1);

            totalIntensity += lightObj.currentIntensity;
          });

          // Move & modulate our 2 pooled corridor PointLights cleanly
          corridorLightsRef.current.forEach((entry) => {
            if (!isEnabled || !isNight) {
              entry.light.intensity = 0;
              return;
            }
            const best = brightestPosByLane[entry.laneX];
            if (best) {
              entry.light.position.z = THREE.MathUtils.lerp(entry.light.position.z, best.z, 0.1);
              entry.light.intensity = 0.7 + best.intensity * 1.1;
            }
          });

          if (now - lastLightHudUpdate >= 1000 && smartStreetLightsRef.current.length > 0) {
            lastLightHudUpdate = now;
            const avg = totalIntensity / smartStreetLightsRef.current.length;
            const avgPct = Math.round((avg / 1.5) * 100);
            const savedPct = Math.max(20, Math.min(85, Math.round(100 - avgPct * 0.65)));
            setSmartLightTelemetry({
              avgIntensity: avgPct,
              activeSurgePoles: activeSurgeCount,
              energySavedPct: savedPct
            });
          }
        }

        // Drone Rotor Rotation & Aviation Beacons (Movement & bobbing are driven smoothly by GSAP)
        droneRotorsRef.current.forEach((rotor) => {
          const spinDir = (rotor.userData.spinDir as number) || 1;
          const speed = (rotor.userData.speed as number) || 0.46;
          rotor.rotation.y += spinDir * speed;
        });

        droneBeaconsRef.current.forEach((beacon, bIdx) => {
          const bMat = beacon.mesh.material as THREE.MeshBasicMaterial;
          if (beacon.isStrobe) {
            // High-visibility aviation strobe flash
            const isFlash = Math.sin(time * 12 + bIdx * 2) > 0.65;
            bMat.color.copy(beacon.baseColor).multiplyScalar(isFlash ? 1.0 : 0.15);
          } else {
            // Gentle navigational beacon pulse
            const pulse = 0.55 + 0.45 * Math.sin(time * 4 + bIdx);
            bMat.color.copy(beacon.baseColor).multiplyScalar(0.4 + pulse * 0.6);
          }
        });

        // Sensor beacons pulse
        sensorsGroup.children.forEach((s, idx) => {
          const sMesh = s as THREE.Mesh;
          const pulse = (Math.sin(time * 4 + idx) + 1) / 2;
          sMesh.scale.setScalar(0.8 + pulse * 0.5);
        });

        // Atmospheric Weather Particle Animation (Rain & Light Snow Simulation)
        const activeWeather = weatherConditionRef.current;
        if (activeWeather === 'rain' && rainPointsRef.current && rainPositionsRef.current && rainSpeedsRef.current) {
          const positions = rainPositionsRef.current;
          const speeds = rainSpeedsRef.current;
          const count = speeds.length;
          // Gentle lateral wind drift
          const windX = Math.sin(time * 0.5) * 0.8 - 0.5;
          const windZ = Math.cos(time * 0.3) * 0.4;

          for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3 + 1] -= speeds[i];
            positions[i3] += windX;
            positions[i3 + 2] += windZ;

            // Recycle particle upon reaching ground plane level
            if (positions[i3 + 1] < 0) {
              positions[i3 + 1] = 230 + Math.random() * 20;
              positions[i3] = (Math.random() - 0.5) * 440;
              positions[i3 + 2] = (Math.random() - 0.5) * 440;
            }
          }
          rainPointsRef.current.geometry.attributes.position.needsUpdate = true;
        } else if (activeWeather === 'snow' && snowPointsRef.current && snowPositionsRef.current && snowSpeedsRef.current && snowPhasesRef.current && snowDriftsRef.current) {
          const positions = snowPositionsRef.current;
          const speeds = snowSpeedsRef.current;
          const phases = snowPhasesRef.current;
          const drifts = snowDriftsRef.current;
          const count = speeds.length;

          for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // Soft crystalline downward glide
            positions[i3 + 1] -= speeds[i];
            // Organic lateral sway and swirl using sine wave per snowflake phase
            positions[i3] += Math.sin(time * 1.8 + phases[i]) * drifts[i] + 0.15;
            positions[i3 + 2] += Math.cos(time * 1.4 + phases[i]) * drifts[i] * 0.75;

            // Recycle snowflake upon reaching ground plane
            if (positions[i3 + 1] < 0) {
              positions[i3 + 1] = 230 + Math.random() * 20;
              positions[i3] = (Math.random() - 0.5) * 440;
              positions[i3 + 2] = (Math.random() - 0.5) * 440;
            }
          }
          snowPointsRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Animate holographic zone highlight radar rotation
        if (zoneHighlightGroupRef.current && zoneHighlightGroupRef.current.visible) {
          zoneHighlightGroupRef.current.rotation.y += 0.008;
        }

        // 9. Animate Cyber-Grid Base Plane: Directional scroll and luminous breathing pulse
        if (cyberGridTextureRef.current) {
          // Normalize camera orientation relative to city center (0, 0, 0)
          const camAngle = Math.atan2(camera.position.x, camera.position.z);
          // Base steady cinematic forward drift in the camera viewing vector
          const baseScrollSpeed = 0.012 * delta;
          const driftX = -Math.sin(camAngle) * baseScrollSpeed;
          const driftY = Math.cos(camAngle) * baseScrollSpeed;

          // Blend with dynamic user orbit drag velocity
          const dragInfluence = cyberGridVelocityRef.current;
          cyberGridTextureRef.current.offset.x = (cyberGridTextureRef.current.offset.x + driftX + dragInfluence.vx) % 1.0;
          cyberGridTextureRef.current.offset.y = (cyberGridTextureRef.current.offset.y + driftY + dragInfluence.vz) % 1.0;

          // Exponential decay of drag impulse back to smooth baseline
          cyberGridVelocityRef.current.vx *= 0.92;
          cyberGridVelocityRef.current.vz *= 0.92;

          // Luminous cyber-grid pulse effect: harmonic breathing oscillation
          if (cyberGridMaterialRef.current) {
            // Pulse opacity between 0.55 and 0.88 with smooth sinusoidal rhythm
            const pulse = Math.sin(time * 1.6) * 0.5 + 0.5;
            cyberGridMaterialRef.current.opacity = 0.55 + pulse * 0.30;
          }
        }

        // Render via EffectComposer with UnrealBloomPass post-processing (or standard renderer if bloom disabled)
        if (composerRef.current && bloomEnabledRef.current) {
          if (bloomPassRef.current) {
            bloomPassRef.current.strength = bloomStrengthRef.current;
          }
          composerRef.current.render();
        } else {
          renderer.render(scene, camera);
        }
      };

      // Apply initial day-night & zone state once synchronously
      applyDayNightCycle(cycleProgressRef.current, emergencyActiveRef.current);
      if (activeZoneRef.current) {
        applyZoneHighlight3D(activeZoneRef.current);
      }

      loadingManager.itemEnd('three/scene-init-complete');
      animate();

      // Viewport IntersectionObserver: pause 3D WebGL loop completely when off-screen
      const visObserver = new IntersectionObserver(
        ([entry]) => {
          isInViewport = entry.isIntersecting;
          if (isInViewport && isLoopPaused) {
            clock.getDelta();
            animate();
          }
        },
        { threshold: 0.05 }
      );
      visObserver.observe(container);

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: newW, height: newH } = entry.contentRect;
          if (newW > 0 && newH > 0) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
            if (composerRef.current) {
              composerRef.current.setSize(newW, newH);
            }
            if (bloomPassRef.current) {
              bloomPassRef.current.resolution.set(
                Math.max(1, Math.floor(newW / 2)),
                Math.max(1, Math.floor(newH / 2))
              );
            }
          }
        }
      });
      resizeObserver.observe(container);

      // Cleanup
      return () => {
        if (loadingTimer) {
          clearTimeout(loadingTimer);
        }
        loadingManagerRef.current = null;
        isInViewport = false;
        cancelAnimationFrame(animId);
        visObserver.disconnect();
        resizeObserver.disconnect();
        if (flightPathManagerRef.current) {
          flightPathManagerRef.current.kill();
          flightPathManagerRef.current = null;
        }
        if (rainPointsRef.current) {
          rainPointsRef.current.geometry.dispose();
          (rainPointsRef.current.material as THREE.PointsMaterial).dispose();
        }
        if (snowPointsRef.current) {
          snowPointsRef.current.geometry.dispose();
          (snowPointsRef.current.material as THREE.PointsMaterial).dispose();
        }
        domElem.removeEventListener('pointerdown', onPointerDownStart);
        domElem.removeEventListener('click', handlePointerClick);
        domElem.removeEventListener('mousemove', handlePointerHover);
        window.removeEventListener('keydown', onKeyDownWalk);
        window.removeEventListener('keyup', onKeyUpWalk);
        controls.removeEventListener('start', onOrbitStart);
        controls.removeEventListener('end', onOrbitEnd);
        controls.removeEventListener('change', onOrbitChange);
        controls.dispose();
        orbitControlsRef.current = null;
        camTargetHumanoid.dispose();
        if (thirdPersonRef.current) {
          thirdPersonRef.current.dispose();
          thirdPersonRef.current = null;
        }
        cityPhysics.dispose();
        if (colonyHandleRef.current) {
          colonyHandleRef.current.dispose();
          colonyHandleRef.current = null;
        }
        if (cyberGridTextureRef.current) {
          cyberGridTextureRef.current.dispose();
          cyberGridTextureRef.current = null;
        }
        if (cyberGridMaterialRef.current) {
          cyberGridMaterialRef.current.dispose();
          cyberGridMaterialRef.current = null;
        }
        if (composerRef.current) {
          composerRef.current.dispose();
          composerRef.current = null;
        }
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn('Three.js WebGL error or unsupported context:', err);
      setWebGlSupported(false);
    }
  }, []);

  // Sync Colony Gate & Warning State to 3D Boom Barrier
  useEffect(() => {
    colonyHandleRef.current?.setGateOpen(gateOpen);
  }, [gateOpen]);

  useEffect(() => {
    colonyHandleRef.current?.setGateWarning(gateWarning);
  }, [gateWarning]);

  // Fly to a specific house when triggered from the Security Control Room
  useEffect(() => {
    if (!focusHouseTrigger) return;
    const h = colonyHouses.find((item) => item.id === focusHouseTrigger.houseId);
    if (!h) return;
    setActiveJourneyStep('explore-homes');
    flyToCamera(
      [h.coordinates[0] - 18, 22, h.coordinates[2] + 28],
      [h.coordinates[0], 5, h.coordinates[2]]
    );
    setSelectedObject({
      id: h.id,
      houseId: h.id,
      name: `${h.id} · ${h.ownerName}`,
      type: 'colony-house',
      engineers: ['CSE', 'ECE', 'AI / ML', 'Civil Engineering'],
      status:
        h.status === 'ALERT_ACTIVE'
          ? 'CRITICAL SECURITY EVENT ACTIVE'
          : h.awayMode.enabled
            ? `Home Away Mode Armed (${h.awayMode.durationDays} Days)`
            : 'Occupied · All Sensors Nominal',
      description: `${h.floors}-Storey ${h.designType} on ${h.streetName}. Security ID: ${h.securityId}.`,
      telemetry: [
        { label: 'Door / Window', value: `${h.sensors.doorSensor} / ${h.sensors.windowSensor}` },
        { label: 'Motion / Object', value: `${h.sensors.motionSensor} / ${h.sensors.objectPresence}` },
        { label: 'Camera / Net', value: `${h.devices.cameraStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'} / ${h.devices.internetStatus === 'CONNECTED' ? 'SYNCED' : 'LOCAL'}` },
        { label: 'Power / Batt', value: `${h.devices.powerSource} (${h.devices.batteryPct}%)` },
      ],
    });
  }, [focusHouseTrigger]);

  // Sync Emergency Mode with Day/Night cycle
  useEffect(() => {
    applyDayNightCycle(cycleProgressRef.current, emergencyActive);
  }, [emergencyActive]);

  // Sync Building Material Style (Solid vs Wireframe vs Holo)
  useEffect(() => {
    buildingMaterialsRef.current.forEach((mat) => {
      if (buildingStyle === 'wireframe') {
        mat.wireframe = true;
        mat.transparent = true;
        mat.opacity = 0.8;
      } else if (buildingStyle === 'holo') {
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = 0.45;
      } else {
        mat.wireframe = false;
        mat.transparent = false;
        mat.opacity = 1.0;
      }
      mat.needsUpdate = true;
    });
  }, [buildingStyle]);

  // Sync Drones & Flight Path Corridors Visibility
  useEffect(() => {
    if (dronesGroupRef.current) {
      dronesGroupRef.current.visible = dronesVisible;
    }
    flightPathSplinesRef.current.forEach((line) => {
      line.visible = flightPathsVisible && dronesVisible;
    });
  }, [dronesVisible, flightPathsVisible]);

  // Sync Sensors Visibility
  useEffect(() => {
    if (sensorsGroupRef.current) {
      sensorsGroupRef.current.visible = sensorsVisible;
    }
  }, [sensorsVisible]);

  // Sync Weather Condition with Particle Systems & Atmospheric Tone
  useEffect(() => {
    if (rainPointsRef.current) {
      rainPointsRef.current.visible = weatherCondition === 'rain';
    }
    if (snowPointsRef.current) {
      snowPointsRef.current.visible = weatherCondition === 'snow';
    }
    applyDayNightCycle(cycleProgressRef.current, emergencyActive);
  }, [weatherCondition, emergencyActive]);

  // Camera Presets
  const setCameraView = (view: 'isometric' | 'aerial' | 'street' | 'bridge' | 'colony') => {
    setFollowPerson(false);
    followPersonRef.current = false;
    if (view === 'isometric') {
      flyToCamera([220, 160, 240], [0, 20, 0]);
    } else if (view === 'aerial') {
      flyToCamera([110, 410, 40], [110, 0, 20]);
    } else if (view === 'street') {
      flyToCamera([10, 18, 120], [0, 10, 0]);
    } else if (view === 'bridge') {
      flyToCamera([-260, 45, 10], [-180, 15, 0]);
    } else if (view === 'colony') {
      setActiveJourneyStep('explore-homes');
      flyToCamera([265, 118, 258], [262, 6, 120]);
    }
  };

  return (
    <section
      id="digital-twin"
      className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>SPATIAL COMPUTING ENGINE · CITY + RESIDENTIAL COLONY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight">
              Three.js Digital Twin
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-2">
              Navigate from the Smart City Main Entrance along the approach road through the gated Shanti Vihar Residential Colony (H-01 to H-30), inspect smart security homes, or fly back to NEXUS Tower 01.
            </p>
          </div>

          {/* Quick Camera Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#111116] p-1.5 rounded-xl border border-white/[0.08]">
            <span className="text-[11px] font-mono text-zinc-500 px-2">VIEWS:</span>
            <button
              onClick={() => setCameraView('isometric')}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#d4a853] text-[#09090d] font-bold hover:bg-[#e8c678] transition-colors cursor-pointer"
            >
              CITY + COLONY
            </button>
            <button
              onClick={() => setCameraView('colony')}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/35 transition-colors cursor-pointer"
            >
              COLONY H-01..H-30
            </button>
            <button
              onClick={() => setCameraView('aerial')}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#0d0d12] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
            >
              AERIAL TOP-DOWN
            </button>
            <button
              onClick={() => setCameraView('bridge')}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#0d0d12] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
            >
              SMART BRIDGE
            </button>
            <button
              onClick={() => setCameraView('street')}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#0d0d12] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
            >
              STREET LEVEL
            </button>
          </div>
        </div>

        {/* 7-Step Interactive City Navigation Journey Bar */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#111116] border border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="text-xs font-mono font-bold text-[#e8c678] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#d4a853]" />
              <span>GUIDED NAVIGATION (LEFT-DRAG ORBIT · RIGHT-DRAG PAN · CLICK GATE OR HOUSES)</span>
            </div>
            <button
              onClick={() => {
                const idx = CITY_JOURNEY_STEPS.findIndex((s) => s.id === activeJourneyStep);
                const next = CITY_JOURNEY_STEPS[(idx + 1) % CITY_JOURNEY_STEPS.length];
                handleJourneyStep(next.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next Stop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {CITY_JOURNEY_STEPS.map((step) => {
              const isActive = activeJourneyStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleJourneyStep(step.id)}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#d4a853]/15 border-[#d4a853] text-[#f4f1ea]'
                      : 'bg-[#0d0d12] border-white/[0.06] hover:border-[#d4a853]/40 text-zinc-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#d4a853] font-bold">
                    0{step.stepNumber}. {step.subtitle.split(' ')[0]}
                  </div>
                  <div className="text-[11px] font-semibold leading-tight mt-0.5 truncate">{step.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Viewport Box */}
        <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-[#09090d] border border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          {/* 3D Asset Loading Progress Overlay (Opaque — Zero backdrop-blur) */}
          {isLoading3D && webGlSupported && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#09090d]/95">
              <div className="relative flex flex-col items-center max-w-sm w-full px-6">
                <div className="mb-5 w-14 h-14 rounded-xl bg-[#111116] border border-[#d4a853]/40 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-[#d4a853] animate-spin" />
                </div>

                <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-[0.2em] text-[#e8c678]">
                  <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
                  <span>INITIALIZING SPATIAL TWIN</span>
                </div>
                <h4 className="text-[#f4f1ea] font-heading font-bold text-lg mb-1 text-center">
                  Loading 3D City Infrastructure
                </h4>
                <p className="text-zinc-400 text-xs font-mono text-center mb-5 h-5 truncate max-w-xs">
                  {loadingStage}
                </p>

                <div className="w-full bg-[#111116] border border-white/[0.1] rounded-full h-2 overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#d4a853] rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between w-full mt-2 font-mono text-[11px] text-zinc-400 tabular-nums">
                  <span>ASSETS: {loadedAssetCount} / {Math.max(totalAssetCount, 1)}</span>
                  <span className="text-[#e8c678] font-bold">{loadProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* WebGL Canvas Container */}
          {webGlSupported ? (
            <div
              ref={containerRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
          ) : (
            <div className="w-full h-full p-8 flex flex-col justify-center items-center text-center architectural-grid">
              <Compass className="w-16 h-16 text-[#d4a853] mb-4" />
              <h3 className="text-2xl font-heading font-bold text-[#f4f1ea] mb-2">
                2.5D Digital Twin Schematic Active
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mb-6">
                WebGL hardware acceleration is operating in lightweight mode. All city subsystems and telemetry remain fully synchronized.
              </p>
              <button
                onClick={() => setSelectedObject(INTERACTIVE_OBJECTS['smart-building'])}
                className="px-6 py-2.5 rounded-lg bg-[#d4a853] text-[#09090d] font-heading font-bold text-xs cursor-pointer"
              >
                OPEN TELEMETRY HUD
              </button>
            </div>
          )}

          {/* HUD Overlay Top Left: Crisp Solid Telemetry Readout (Zero backdrop-blur over WebGL) */}
          <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1 font-mono text-[11px] bg-[#111116]/95 p-3 rounded-xl border border-white/[0.1] text-zinc-300 shadow-xl tabular-nums">
            <div className="flex items-center gap-2 font-bold text-[#f4f1ea]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>NEXUS SPATIAL TWIN · V4.2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">ATMOSPHERE:</span>
              <span
                className={`font-bold ${
                  uiProgress > 0.75
                    ? 'text-sky-300'
                    : uiProgress < 0.25
                      ? 'text-[#e8c678]'
                      : 'text-amber-300'
                }`}
              >
                {uiProgress > 0.75
                  ? 'ATMOSPHERIC BLUE DAY'
                  : uiProgress < 0.25
                    ? 'OBSIDIAN NIGHT'
                    : 'TWILIGHT GOLDEN HOUR'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">SOLAR:</span>
              <span className="text-[#e8c678] font-bold">{solarElevation}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">SKYWAYS:</span>
              <span className="text-zinc-200 font-bold flex items-center gap-1">
                <Navigation className="w-3 h-3 text-[#d4a853] inline" />
                3 DRONES ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">WEATHER:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  weatherCondition === 'rain'
                    ? 'text-sky-300'
                    : weatherCondition === 'snow'
                      ? 'text-zinc-100'
                      : 'text-[#e8c678]'
                }`}
              >
                {weatherCondition === 'rain' ? (
                  <>
                    <CloudRain className="w-3 h-3 text-sky-400 inline" />
                    RAIN SIMULATION
                  </>
                ) : weatherCondition === 'snow' ? (
                  <>
                    <CloudSnow className="w-3 h-3 text-zinc-200 inline" />
                    LIGHT SNOW
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-[#d4a853] inline" />
                    CLEAR SKIES
                  </>
                )}
              </span>
            </div>
            <div className="text-zinc-500 pt-0.5 border-t border-white/[0.06]">
              28.6139° N, 77.2090° E · CLICK OBJECTS TO INSPECT
            </div>
          </div>

          {/* Active Zone HUD Banner */}
          {activeZone && (
            <div className="hidden sm:block absolute top-44 left-4 z-10 p-3 rounded-xl bg-[#111116]/95 border border-[#d4a853]/50 shadow-xl max-w-xs">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeZone.accentColor }} />
                  <span className="text-[11px] font-mono font-bold text-[#f4f1ea] uppercase tracking-wider">
                    {activeZone.shortName}
                  </span>
                </div>
                <button
                  onClick={() => handleZoneSelect(null)}
                  className="p-0.5 rounded text-zinc-400 hover:text-white cursor-pointer"
                  title="Clear Sector Selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-zinc-300 font-mono mb-2 tabular-nums">
                AQI: <span className="text-[#e8c678] font-bold">{activeZone.stats.aqi.value}</span> · Speed: <span className="text-emerald-400 font-bold">{activeZone.stats.traffic.speedKmh} km/h</span> · Grid: <span className="text-[#f4f1ea] font-bold">{activeZone.stats.energy.loadMw} MW</span>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('zone-telemetry-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-1 px-2 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-[10px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Target className="w-3 h-3" />
                <span>INSPECT ZONE IN DASHBOARD ↓</span>
              </button>
            </div>
          )}

          {/* HUD Overlay Top Right: Lighting & View Reset Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 bg-[#111116]/95 p-1.5 rounded-xl border border-white/[0.1] shadow-xl">
              <button
                onClick={() => triggerTransition('cycle')}
                disabled={isTransitioning}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isTransitioning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/45'
                    : 'bg-[#d4a853]/15 text-[#e8c678] hover:bg-[#d4a853]/25 border border-[#d4a853]/40'
                }`}
                title="Trigger Smooth 3-Second Day/Night Transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>{isTransitioning ? `TRANSIT ${transitionTimeRemaining}s` : '3s CYCLE'}</span>
              </button>

              <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

              <button
                onClick={() => triggerTransition('night')}
                disabled={isTransitioning}
                className={`p-1.5 px-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                  lightingMode === 'night' && !isTransitioning
                    ? 'bg-[#d4a853] text-[#09090d] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Obsidian Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">NIGHT</span>
              </button>

              <button
                onClick={() => triggerTransition('twilight')}
                disabled={isTransitioning}
                className={`p-1.5 px-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                  lightingMode === 'twilight' && !isTransitioning
                    ? 'bg-[#d4a853] text-[#09090d] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Golden Hour Sunset (Twilight)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TWILIGHT</span>
              </button>

              <button
                onClick={() => triggerTransition('day')}
                disabled={isTransitioning}
                className={`p-1.5 px-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                  lightingMode === 'day' && !isTransitioning
                    ? 'bg-[#d4a853] text-[#09090d] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Daylight Mode"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DAY</span>
              </button>

              <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

              <button
                onClick={randomizeWindowPatterns}
                className="p-1.5 px-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer text-[#e8c678] hover:bg-[#d4a853]/15 border border-[#d4a853]/30"
                title="Randomize Illuminated Window Patterns"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#d4a853]" />
                <span className="hidden md:inline">WINDOWS</span>
              </button>

              <button
                onClick={() => setCameraView('isometric')}
                className="p-1.5 px-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer text-zinc-300 hover:text-white border border-white/[0.08] bg-[#0d0d12]"
                title="Smoothly Refresh Camera View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">REFRESH</span>
              </button>

              <button
                onClick={toggleAutoCycle}
                className={`p-1.5 px-2 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                  autoCycleEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/45'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Toggle continuous 3-second cycle"
              >
                <span className="hidden sm:inline">AUTO</span>
              </button>
            </div>

            {isTransitioning && (
              <div className="bg-[#111116]/95 px-3 py-1.5 rounded-lg border border-[#d4a853]/40 text-[11px] font-mono text-[#e8c678] flex items-center gap-2.5 shadow-xl tabular-nums">
                <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
                <span>3s CELESTIAL TRANSITION: {transitionTimeRemaining}s</span>
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4a853]"
                    style={{ width: `${Math.round(transitionPercent)}%` }}
                  />
                </div>
              </div>
            )}

            {/* High-Performance Top-Right City & Colony Mini-Map Overlay */}
            <CityMiniMap
              ref={miniMapRef}
              colonyHouses={colonyHouses}
              selectedHouseId={selectedHouseId}
              activeZone={activeZone}
              emergencyActive={emergencyActive}
              onNavigateTo={(x, z) => walkCharacterTo(x, z)}
              onFocusCharacter={() => toggleThirdPersonMode(true)}
            />
          </div>

          {/* Third-Person Character Controller HUD Overlay */}
          <ThirdPersonHud
            active={followPerson}
            onToggleMode={toggleThirdPersonMode}
            telemetry={tpTelemetry}
            gateOpen={gateOpen}
            onWalkToDestination={(x, z) => walkCharacterTo(x, z)}
            onResetToGate={resetWalkerToGate}
            onVirtualMoveStart={(dir) => {
              keysPressedRef.current[dir] = true;
              if (!followPersonRef.current) {
                toggleThirdPersonMode(true);
              }
            }}
            onVirtualMoveEnd={(dir) => {
              keysPressedRef.current[dir] = false;
            }}
            onSprintToggle={() => setSprintLocked((prev) => !prev)}
            sprintLocked={sprintLocked}
            onJump={() => {
              jumpPendingRef.current = true;
            }}
            onInspectHouse={(houseId) => inspectColonyHouseById(houseId)}
            onInspectLandmark={(landmarkId) => inspectCityLandmarkById(landmarkId)}
            onOpenHouseInControlRoom={(houseId) => onInspectHouseInControlRoom(houseId)}
          />

          {/* Selected Object Telemetry Drawer */}
          {selectedObject && (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[420px] z-20 p-5 rounded-2xl bg-[#111116]/95 border border-[#d4a853]/45 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#e8c678]">
                    OBJECT TELEMETRY
                  </span>
                </div>
                <button
                  onClick={() => setSelectedObject(null)}
                  className="p-1 rounded-lg bg-[#0d0d12] border border-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-xl font-heading font-bold text-[#f4f1ea] mb-1">
                {selectedObject.name}
              </h4>

              <div className="text-xs font-mono text-emerald-400 mb-3">
                {selectedObject.status}
              </div>

              <p className="text-zinc-300 text-xs leading-relaxed mb-4 bg-[#0d0d12] p-3 rounded-xl border border-white/[0.06]">
                {selectedObject.description}
              </p>

              <div className="mb-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  ENGINEERING TEAMS RESPONSIBLE
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedObject.engineers.map((eng, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#0d0d12] border border-[#d4a853]/30 text-[#e8c678] text-[10px] font-mono font-bold"
                    >
                      {eng}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 tabular-nums">
                {selectedObject.telemetry.map((t, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-zinc-400">{t.label}</div>
                    <div className="text-xs font-mono font-bold text-[#f4f1ea]">{t.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedObject.id === 'colony-main-gate' && (
                  <button
                    onClick={() => {
                      onToggleGate(!gateOpen);
                      if (!gateOpen) {
                        handleJourneyStep('inside-colony');
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-heading font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span>{gateOpen ? 'CLOSE BOOM BARRIER' : 'OPEN GATE & ENTER COLONY'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (selectedObject.houseId) {
                      onInspectHouseInControlRoom(selectedObject.houseId);
                    } else {
                      const el = document.getElementById('zone-telemetry-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-heading font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{selectedObject.houseId ? 'COLONY OPERATIONS' : 'INSPECT IN DASHBOARD'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedObject(null)}
                  className="px-3 py-2 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-zinc-300 text-xs font-mono font-bold cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Digital Twin Scene Control Bar */}
        <div
          id="digital-twin-controls"
          className="mt-6 p-4 sm:p-6 rounded-2xl bg-[#111116] border border-white/[0.08]"
        >
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/[0.08] mb-4 gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4a853]">
              <Sliders className="w-4 h-4" />
              <span>DIGITAL TWIN ENVIRONMENT CONTROLS</span>
            </div>

            {/* Quick Atmospheric Weather Selector */}
            <div className="flex items-center gap-1.5 bg-[#0d0d12] p-1 rounded-xl border border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 px-2 uppercase flex items-center gap-1">
                <Cloud className="w-3 h-3 text-[#d4a853]" />
                Weather:
              </span>
              <button
                onClick={() => selectWeather('clear')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  weatherCondition === 'clear'
                    ? 'bg-[#d4a853] text-[#09090d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="w-3 h-3" />
                CLEAR
              </button>
              <button
                onClick={() => selectWeather('rain')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  weatherCondition === 'rain'
                    ? 'bg-[#d4a853] text-[#09090d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CloudRain className="w-3 h-3" />
                RAIN
              </button>
              <button
                onClick={() => selectWeather('snow')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  weatherCondition === 'snow'
                    ? 'bg-[#d4a853] text-[#09090d]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CloudSnow className="w-3 h-3" />
                LIGHT SNOW
              </button>
            </div>
          </div>

          {/* Interactive 3D Zone Sector Focus Selector */}
          <div className="mb-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-300 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>Zone Raycaster & 3D Highlight Selector</span>
              </div>
              {activeZone && (
                <button
                  onClick={() => handleZoneSelect(null)}
                  className="text-[10px] font-mono text-[#e8c678] hover:underline cursor-pointer"
                >
                  Reset to All Zones
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleZoneSelect(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  !activeZone
                    ? 'bg-[#d4a853] text-[#09090d] font-bold'
                    : 'bg-[#0d0d12] text-zinc-400 hover:text-zinc-200 border border-white/[0.08]'
                }`}
              >
                All Sectors Overview
              </button>
              {CITY_ZONES.map((zone) => {
                const isSelected = activeZone?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneSelect(zone)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#d4a853]/20 text-[#f4f1ea] border border-[#d4a853] font-bold'
                        : 'bg-[#0d0d12] text-zinc-300 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: zone.accentColor }}
                    />
                    <span>{zone.shortName}</span>
                    <span className="text-[10px] opacity-75 font-normal hidden sm:inline tabular-nums">
                      ({zone.stats.aqi.value} AQI)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2.5">
            <button
              onClick={() => triggerTransition('cycle')}
              disabled={isTransitioning}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer relative overflow-hidden ${
                isTransitioning || uiProgress > 0.5
                  ? 'bg-[#d4a853]/15 border-[#d4a853]/60 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.1] text-zinc-200 hover:border-[#d4a853]/40'
              }`}
            >
              {uiProgress > 0.5 ? (
                <Sun className="w-4 h-4 mx-auto mb-1 text-[#e8c678]" />
              ) : (
                <Moon className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              )}
              <div className="text-[10px] font-mono font-bold">DAY / NIGHT</div>
              <div className="text-[9px] text-zinc-400 uppercase tabular-nums">
                {isTransitioning ? `TRANSIT ${transitionTimeRemaining}s` : uiProgress > 0.5 ? 'DAYLIGHT' : 'NIGHT'}
              </div>
              {isTransitioning && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-[#d4a853]"
                  style={{ width: `${Math.round(transitionPercent)}%` }}
                />
              )}
            </button>

            <button
              onClick={() => {
                const next = !trafficEnabled;
                setTrafficEnabled(next);
                onOperationalEventRef.current?.({
                  severity: next ? 'SUCCESS' : 'WARNING',
                  source: 'V2X CORRIDOR',
                  zone: 'Metro Central & Innovation',
                  title: next ? 'Autonomous Vehicle Fleet Resumed' : 'Autonomous Vehicle Fleet Paused for Maintenance',
                  detail: next
                    ? 'All 14 C-V2X smart vehicles actively routing along arterial lanes.'
                    : 'Corridor vehicles held in stationary diagnostic standby.',
                  zoneId: 'zone-skyline',
                });
              }}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                trafficEnabled
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
            >
              <Car className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">TRAFFIC</div>
              <div className="text-[9px] text-zinc-400">{trafficEnabled ? 'ACTIVE' : 'PAUSED'}</div>
            </button>

            <button
              onClick={() => setBuildingStyle(buildingStyle === 'solid' ? 'wireframe' : 'solid')}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                buildingStyle === 'wireframe'
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
            >
              <Layers className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">BUILDINGS</div>
              <div className="text-[9px] text-zinc-400 uppercase">{buildingStyle}</div>
            </button>

            <button
              onClick={() => {
                const next = !dronesVisible;
                setDronesVisible(next);
                onOperationalEventRef.current?.({
                  severity: next ? 'INFO' : 'WARNING',
                  source: 'SKYWAY FLEET',
                  zone: 'Aerial Patrol Corridors',
                  title: next ? 'Autonomous Drone Fleet Deployed (3 Units)' : 'Autonomous Drone Fleet Recalled to Sky-Hub',
                  detail: next
                    ? 'Patrol drones Alpha, Beta, and Gamma sweeping city skyline corridors.'
                    : 'Airborne surveillance units docked on charging pads.',
                  zoneId: 'zone-biomedical',
                });
              }}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                dronesVisible
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
            >
              <Radio className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">DRONES</div>
              <div className="text-[9px] text-zinc-400">{dronesVisible ? '3 FLEET ON' : 'HIDDEN'}</div>
            </button>

            <button
              onClick={toggleFlightPaths}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                flightPathsVisible
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
              title="Toggle 3D flight path spline corridors"
            >
              <Navigation className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">SKYWAYS</div>
              <div className="text-[9px] text-zinc-400">{flightPathsVisible ? 'PATHS ON' : 'OFF'}</div>
            </button>

            <button
              onClick={() => {
                const next = !sensorsVisible;
                setSensorsVisible(next);
                onOperationalEventRef.current?.({
                  severity: next ? 'SUCCESS' : 'WARNING',
                  source: 'IOT SENSOR GRID',
                  zone: 'All Districts',
                  title: next ? 'City-Wide IoT Sensor Overlay Enabled' : 'IoT Sensor Overlay Hidden',
                  detail: '25 spatial micro-climate & acoustic nodes monitored across districts.',
                });
              }}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                sensorsVisible
                  ? 'bg-emerald-500/12 border-emerald-500/45 text-emerald-300'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
            >
              <Cpu className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <div className="text-[10px] font-mono font-bold">SENSORS</div>
              <div className="text-[9px] text-zinc-400">{sensorsVisible ? 'ACTIVE' : 'OFF'}</div>
            </button>

            <button
              onClick={() => {
                const next = !renewableEnergyActive;
                setRenewableEnergyActive(next);
                onOperationalEventRef.current?.({
                  severity: next ? 'SUCCESS' : 'WARNING',
                  source: 'SMART GRID',
                  zone: 'District 02 Substation',
                  title: next ? 'Wind & Solar Turbine Array Engaged (87% Clean)' : 'Wind Turbine Array Feathered to Standby',
                  detail: next
                    ? 'Offshore wind rotors & solar farms supplying clean city baseload.'
                    : 'Substation shifting transient load to battery storage reserves.',
                  zoneId: 'zone-grid',
                });
              }}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                renewableEnergyActive
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
            >
              <Wind className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">RENEWABLES</div>
              <div className="text-[9px] text-zinc-400">{renewableEnergyActive ? '87% LOAD' : 'OFF'}</div>
            </button>

            <button
              onClick={() => setWaterHighlighted(!waterHighlighted)}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                waterHighlighted
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">WATER FLOW</div>
              <div className="text-[9px] text-zinc-400">{waterHighlighted ? 'RESERVE' : 'NOMINAL'}</div>
            </button>

            <button
              onClick={() => onEmergencyToggle(!emergencyActive)}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                emergencyActive
                  ? 'bg-rose-500/25 border-rose-500 text-rose-200'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400 hover:border-rose-500/40 hover:text-rose-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-rose-400" />
              <div className="text-[10px] font-mono font-bold">EMERGENCY</div>
              <div className="text-[9px] text-zinc-400">{emergencyActive ? 'V2X HOLD' : 'STANDBY'}</div>
            </button>

            <button
              onClick={randomizeWindowPatterns}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                uiProgress < 0.75 && windowLightsActive
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
              }`}
              title="Randomize illuminated skyscraper window patterns"
            >
              <Lightbulb className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">WINDOWS</div>
              <div className="text-[9px] text-zinc-400 uppercase">
                {uiProgress >= 0.75 ? 'DAY (OFF)' : 'RANDOMIZE'}
              </div>
            </button>

            <button
              onClick={() => setBloomEnabled(!bloomEnabled)}
              className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                bloomEnabled
                  ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                  : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle UnrealBloomPass cinematic post-processing"
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-[#d4a853]" />
              <div className="text-[10px] font-mono font-bold">BLOOM FX</div>
              <div className="text-[9px] text-zinc-400 uppercase tabular-nums">
                {bloomEnabled ? `${Math.round(bloomStrength * 100)}%` : 'OFF'}
              </div>
            </button>
          </div>

          {/* Cinematic Bloom Telemetry Bar */}
          {bloomEnabled && !isSoftwareGlRef.current && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#d4a853]" />
                <span className="font-bold text-[#e8c678]">POST-PROCESSING PIPELINE:</span>
                <span className="text-zinc-400">
                  Half-res UnrealBloomPass active · ACESFilmic Tone Mapping
                </span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <div className="flex items-center gap-2">
                  <span>STRENGTH:</span>
                  <div className="flex items-center gap-1">
                    {[0.35, 0.55, 0.85].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setBloomStrength(val);
                          bloomStrengthRef.current = val;
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                          Math.abs(bloomStrength - val) < 0.08
                            ? 'bg-[#d4a853] text-[#09090d] font-bold'
                            : 'bg-[#17171f] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {val === 0.35 ? 'Subtle' : val === 0.55 ? 'Balanced' : 'Cinematic'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Street Lighting Telemetry Bar */}
          {smartLightingActive && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono tabular-nums">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#d4a853]" />
                <span className="font-bold text-[#e8c678]">ADAPTIVE STREET LIGHTING MESH:</span>
                <span className="text-zinc-400">
                  {smartLightTelemetry.activeSurgePoles > 0
                    ? `Illuminating ${smartLightTelemetry.activeSurgePoles} road segments under active traffic`
                    : 'Standby conservation mode (30% flux) · Monitoring road corridors'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <div>
                  AVG FLUX: <span className="text-[#e8c678] font-bold">{smartLightTelemetry.avgIntensity}%</span>
                </div>
                <div>
                  ENERGY SAVED: <span className="text-emerald-400 font-bold">{smartLightTelemetry.energySavedPct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Smart Traffic V2X Telemetry Bar */}
          <div
            className={`mt-2.5 p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono tabular-nums ${
              emergencyActive
                ? 'bg-rose-950/35 border-rose-500/45 text-rose-200'
                : 'bg-[#0d0d12] border-white/[0.08] text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${emergencyActive ? 'bg-rose-500' : 'bg-emerald-400'}`} />
              <span className={`font-bold ${emergencyActive ? 'text-rose-400' : 'text-[#e8c678]'}`}>
                {emergencyActive ? 'V2X PRIORITY EMERGENCY PREEMPTION:' : 'AUTONOMOUS TRAFFIC SIMULATION:'}
              </span>
              <span className="text-zinc-400">
                {emergencyActive
                  ? `${smartTrafficTelemetry.stoppedCount} vehicles held at intersections · ${smartTrafficTelemetry.slowedCount} decelerated`
                  : `14 autonomous vehicles cruising at ${smartTrafficTelemetry.avgSpeedKmh} km/h`}
              </span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400">
              <div>
                HOLDS: <span className={`font-bold ${emergencyActive ? 'text-rose-400' : 'text-emerald-400'}`}>{smartTrafficTelemetry.stoppedCount}</span>
              </div>
              <div>
                V2X SPEED: <span className="text-[#e8c678] font-bold">{smartTrafficTelemetry.avgSpeedKmh} KM/H</span>
              </div>
              <div className="hidden sm:inline">
                DISPATCH: <span className={`font-bold ${emergencyActive ? 'text-rose-400' : 'text-zinc-300'}`}>{emergencyActive ? 'PRIORITY 1' : 'PATROL'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
