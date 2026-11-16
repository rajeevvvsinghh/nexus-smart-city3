import { CityMetric, CityZone } from '../types';

export const CITY_METRICS: CityMetric[] = [
  {
    id: 'aqi',
    label: 'AIR QUALITY',
    value: '94 AQI',
    subValue: 'GOOD (PM2.5: 11.4 µg/m³)',
    status: 'optimal',
    iconName: 'Wind',
    trend: '-3.2% vs yesterday',
    unit: 'AQI'
  },
  {
    id: 'energy',
    label: 'ENERGY USAGE',
    value: '68%',
    subValue: '412 MW / 605 MW Peak Capacity',
    status: 'good',
    iconName: 'Zap',
    trend: '+1.5% load efficiency',
    unit: '%'
  },
  {
    id: 'renewable',
    label: 'RENEWABLE ENERGY',
    value: '87%',
    subValue: 'Solar: 54% | Wind: 33%',
    status: 'optimal',
    iconName: 'Sun',
    trend: '+5.4% solar yield',
    unit: '%'
  },
  {
    id: 'traffic',
    label: 'TRAFFIC FLOW',
    value: 'LOW',
    subValue: 'Avg Speed 48 km/h | 14% Congestion',
    status: 'optimal',
    iconName: 'Car',
    trend: 'Green wave active',
    unit: 'Level'
  },
  {
    id: 'water',
    label: 'WATER RESERVE',
    value: '92%',
    subValue: '18.4M Liters | 72% Recycled Flow',
    status: 'optimal',
    iconName: 'Droplet',
    trend: 'Zero pressure anomalies',
    unit: '%'
  },
  {
    id: 'waste',
    label: 'WASTE PROCESSING',
    value: '81%',
    subValue: 'Pneumatic Sorting Active',
    status: 'good',
    iconName: 'Trash2',
    trend: 'Landfill diversion: 89%',
    unit: '%'
  },
  {
    id: 'emergency',
    label: 'EMERGENCY RESPONSE',
    value: '2.4 MIN',
    subValue: 'Autonomous Dispatch & Drone Flight',
    status: 'optimal',
    iconName: 'ShieldAlert',
    trend: 'Citywide average',
    unit: 'Min'
  }
];

export const ENERGY_CHART_DATA = [
  { time: '00:00', consumption: 290, renewable: 210, grid: 80 },
  { time: '03:00', consumption: 240, renewable: 195, grid: 45 },
  { time: '06:00', consumption: 380, renewable: 320, grid: 60 },
  { time: '09:00', consumption: 510, renewable: 460, grid: 50 },
  { time: '12:00', consumption: 580, renewable: 550, grid: 30 },
  { time: '15:00', consumption: 540, renewable: 490, grid: 50 },
  { time: '18:00', consumption: 490, renewable: 390, grid: 100 },
  { time: '21:00', consumption: 390, renewable: 280, grid: 110 }
];

export const TRAFFIC_CHART_DATA = [
  { zone: 'Sector 1 (North Tech Hub)', volume: 38, speed: 52, index: 'Smooth' },
  { zone: 'Sector 2 (Central Financial)', volume: 62, speed: 41, index: 'Moderate' },
  { zone: 'Sector 3 (Riverfront Arts)', volume: 29, speed: 56, index: 'Free' },
  { zone: 'Sector 4 (Green Residential)', volume: 24, speed: 58, index: 'Free' },
  { zone: 'Sector 5 (Aerospace Port)', volume: 45, speed: 49, index: 'Smooth' }
];

export const AIR_QUALITY_ZONES = [
  { district: 'Skyline Core', aqi: 42, status: 'Pristine' },
  { district: 'Harbor Marina', aqi: 56, status: 'Good' },
  { district: 'Industrial Ring', aqi: 82, status: 'Moderate' },
  { district: 'Aerospace Corridor', aqi: 61, status: 'Good' },
  { district: 'Agri-Valley Park', aqi: 31, status: 'Pristine' }
];

export const SUSTAINABILITY_METRICS = [
  { title: 'Renewable Energy', value: '87%', change: '+12% YoY', desc: 'Solar, offshore wind and green hydrogen storage' },
  { title: 'Water Recycled', value: '72%', change: '+9% YoY', desc: 'Nanofiltration membrane closed loops' },
  { title: 'CO₂ Reduction', value: '41%', change: '-41% vs 2025', desc: 'Net-zero carbon emission standards across all towers' },
  { title: 'Smart Waste', value: '81%', change: '+15% YoY', desc: 'Automated pneumatic transport & biomethane conversion' },
  { title: 'Green Coverage', value: '46%', change: '+18% YoY', desc: 'Vertical sky-forests, living facades & pocket wetlands' }
];

export const CITY_ZONES: CityZone[] = [
  {
    id: 'zone-skyline',
    name: 'Sector 1 • Downtown Financial Core',
    shortName: 'Skyline Core',
    district: 'Central Metro',
    color: 'cyan',
    accentColor: '#00f0ff',
    accentHex: 0x00f0ff,
    center: [-50, 0, 30],
    boundsRadius: 75,
    description: 'High-density commercial center featuring autonomous smart towers with kinetic solar shading louvers, tuned mass dampers, and subterranean pneumatic waste dispatch.',
    leadEngineers: ['Civil Engineering', 'Electrical Engineering', 'CSE', 'ECE'],
    stats: {
      aqi: { value: 42, label: 'Pristine Clean', status: 'optimal' },
      energy: { loadMw: 184, renewablePct: 91, status: 'Solar-Integrated Peak' },
      traffic: { speedKmh: 52, congestionPct: 38, flow: 'Green Wave Active' },
      water: { pressureBar: 4.8, recycledPct: 84, status: 'Dual-line Potable' },
      systemsActive: 18
    },
    keyFacilities: ['Nexus Tower 01', 'Civic Innovation Center', 'Skyline West Towers', 'South Commercial Complex']
  },
  {
    id: 'zone-biomedical',
    name: 'Sector 2 • Biomedical & Health District',
    shortName: 'Health District',
    district: 'North Tech Hub',
    color: 'emerald',
    accentColor: '#10b981',
    accentHex: 0x10b981,
    center: [-10, 0, -110],
    boundsRadius: 70,
    description: 'Mission-critical trauma and biotech research precinct equipped with emergency drone defibrillator skyways, uninterruptible Level-4 clean microgrids, and negative-pressure isolation wards.',
    leadEngineers: ['Biomedical Engineering', 'CSE', 'Electrical Engineering', 'Robotics'],
    stats: {
      aqi: { value: 38, label: 'Filtered Pristine', status: 'optimal' },
      energy: { loadMw: 92, renewablePct: 100, status: 'Redundant Microgrid' },
      traffic: { speedKmh: 41, congestionPct: 62, flow: 'Priority Transit Armed' },
      water: { pressureBar: 5.1, recycledPct: 96, status: 'Ultra-pure Medical' },
      systemsActive: 22
    },
    keyFacilities: ['Metropolitan Trauma Center', 'Bio-Genomics Institute', 'MedTech Research Complex', 'North Air-Hub']
  },
  {
    id: 'zone-harbor',
    name: 'Sector 3 • Harbor & Smart Suspension Bridge',
    shortName: 'Harbor Marina',
    district: 'Riverfront Arts',
    color: 'blue',
    accentColor: '#38bdf8',
    accentHex: 0x38bdf8,
    center: [-180, 0, 0],
    boundsRadius: 80,
    description: 'Autonomous maritime logistics and intelligent suspension bridge corridor utilizing dynamic optical strain gauges, resonance vortex damping, and closed-loop hydraulic aqueducts.',
    leadEngineers: ['Civil Engineering', 'Mechanical Engineering', 'Structural Engineering', 'ECE'],
    stats: {
      aqi: { value: 56, label: 'Coastal Fresh', status: 'good' },
      energy: { loadMw: 64, renewablePct: 78, status: 'Tidal & Kinetic' },
      traffic: { speedKmh: 56, congestionPct: 29, flow: 'Free Flowing' },
      water: { pressureBar: 4.6, recycledPct: 99.8, status: 'Nanofiltration Active' },
      systemsActive: 15
    },
    keyFacilities: ['Nexus Smart Bridge', 'Autonomous Aqueduct Canal', 'Deepwater Marine Port', 'Tidal Energy Gates']
  },
  {
    id: 'zone-agritech',
    name: 'Sector 4 • Eco-Agri & Vertical Sky-Farm',
    shortName: 'Agri-Valley Park',
    district: 'Green Residential',
    color: 'lime',
    accentColor: '#84cc16',
    accentHex: 0x84cc16,
    center: [55, 0, 85],
    boundsRadius: 65,
    description: 'Autonomous 30-story vertical greenhouse and circular biosphere powered by ultrasonic nutrient misting, zero-pesticide bio-filtration, and AI computer vision harvesting.',
    leadEngineers: ['Agricultural Engineering', 'Environmental Engineering', 'AI / ML', 'Mechanical'],
    stats: {
      aqi: { value: 31, label: 'Pure Oxygen Yield', status: 'optimal' },
      energy: { loadMw: 36, renewablePct: 98, status: 'Agri-photovoltaic' },
      traffic: { speedKmh: 58, congestionPct: 24, flow: 'Uncongested EV Only' },
      water: { pressureBar: 4.2, recycledPct: 98, status: 'Closed Biosphere Loop' },
      systemsActive: 14
    },
    keyFacilities: ['Aeroponic Sky-Farm', 'Bio-Dome Ecosystems', 'Green Habitat Towers', 'Botanical Microclimate']
  },
  {
    id: 'zone-grid',
    name: 'Sector 5 • Smart Grid & Aerospace Hub',
    shortName: 'Aerospace Corridor',
    district: 'Industrial Ring',
    color: 'amber',
    accentColor: '#f59e0b',
    accentHex: 0xf59e0b,
    center: [115, 0, -65],
    boundsRadius: 65,
    description: 'High-voltage solid-state energy distribution substation featuring automated sub-cycle fault isolation, battery energy storage systems (BESS), and aerospace drone telemetry towers.',
    leadEngineers: ['Electrical Engineering', 'Aerospace Engineering', 'CSE', 'ECE'],
    stats: {
      aqi: { value: 61, label: 'Moderate Urban', status: 'good' },
      energy: { loadMw: 412, renewablePct: 87, status: 'Grid Islanding Armed' },
      traffic: { speedKmh: 49, congestionPct: 45, flow: 'Autonomous Platoon' },
      water: { pressureBar: 4.4, recycledPct: 76, status: 'Industrial Chilled Loop' },
      systemsActive: 26
    },
    keyFacilities: ['District 02 Smart Substation', 'BESS Battery Storage (140 MWh)', 'Pulsing Telecom Tower', 'Aerospace Flight Base']
  },
  {
    id: 'zone-colony',
    name: 'Sector 6 • Shanti Vihar AI Smart Security Residency',
    shortName: 'Smart Residency',
    district: 'Indian Residential Enclave',
    color: 'emerald',
    accentColor: '#22d3ee',
    accentHex: 0x22d3ee,
    center: [285, 0, 120],
    boundsRadius: 135,
    description: 'Gated 30-home modern Indian residential colony (H-01 to H-30) with hybrid AI smart home security, Home Away Mode, object presence monitoring, automated boom barrier gate, guard cabin, and fail-safe emergency exit.',
    leadEngineers: ['CSE', 'ECE', 'AI / Machine Learning', 'Civil Engineering'],
    stats: {
      aqi: { value: 36, label: 'Parkland Fresh', status: 'optimal' },
      energy: { loadMw: 18, renewablePct: 94, status: 'Rooftop Solar + Battery' },
      traffic: { speedKmh: 22, congestionPct: 8, flow: 'Residential Calm' },
      water: { pressureBar: 4.5, recycledPct: 88, status: 'Dual-Tank Rainwater' },
      systemsActive: 30
    },
    keyFacilities: ['Main Boom Gate & Guard Cabin', '30 Smart Homes (H-01 to H-30)', 'Central Community Park', 'Fail-Safe Emergency Exit']
  }
];

