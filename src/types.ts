export interface Department {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  role: string;
  description: string;
  technologies: string[];
  smartCityContribution: string;
  collaboratesWith: string[];
  keyDeliverable: string;
  color: string;
}

export interface SmartSystem {
  id: string;
  title: string;
  category: string;
  iconName: string;
  description: string;
  engineersInvolved: string[];
  technologies: string[];
  benefits: string[];
  explanation: {
    overview: string;
    flow: { discipline: string; action: string }[];
    realImpact: string;
  };
}

export interface CityMetric {
  id: string;
  label: string;
  value: string;
  subValue: string;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  iconName: string;
  trend: string;
  unit?: string;
}

export interface CityOperationalAlert {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  source: string;
  zone: string;
  title: string;
  detail: string;
  zoneId?: string;
}

export interface EmergencyScenario {
  id: string;
  name: string;
  level: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedZones: string[];
  respondingTeams: string[];
  telemetryImpact: {
    aqi: number;
    energyUsage: number;
    trafficCongestion: number;
    waterPressure: number;
  };
  stages: {
    detection: { title: string; desc: string; disciplines: string[] };
    analysis: { title: string; desc: string; disciplines: string[] };
    response: { title: string; desc: string; disciplines: string[] };
    recovery: { title: string; desc: string; disciplines: string[] };
  };
}

export interface Interactive3DObject {
  id: string;
  name: string;
  type:
    | 'building'
    | 'bridge'
    | 'grid'
    | 'vehicle'
    | 'hospital'
    | 'drone'
    | 'farm'
    | 'colony-house'
    | 'colony-gate'
    | 'guard-cabin'
    | 'colony-park'
    | 'emergency-exit';
  engineers: string[];
  status: string;
  telemetry: { label: string; value: string }[];
  description: string;
  houseId?: string;
}

export interface PresentationSlide {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  bulletPoints: string[];
  highlight: string;
  engineersInvolved?: string[];
  speakerNotes: string;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  engineeringFocus?: string[];
  telemetryRef?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  engineers: string[];
  specs: string[];
}

export interface CityZone {
  id: string;
  name: string;
  shortName: string;
  district: string;
  color: string;
  accentColor: string;
  accentHex: number;
  center: [number, number, number];
  boundsRadius: number;
  description: string;
  leadEngineers: string[];
  stats: {
    aqi: { value: number; label: string; status: 'optimal' | 'good' | 'moderate' };
    energy: { loadMw: number; renewablePct: number; status: string };
    traffic: { speedKmh: number; congestionPct: number; flow: string };
    water: { pressureBar: number; recycledPct: number; status: string };
    systemsActive: number;
  };
  keyFacilities: string[];
}

// ==========================================
// ENGINEER-X AI SMART SECURITY RESIDENCY TYPES
// ==========================================

export type HouseDesignType =
  | 'Modern Duplex Villa'
  | '3-Storey Courtyard Home'
  | '2-Storey Terrace Bungalow'
  | 'Corner Veranda Residence';

export type HouseSecurityStatus = 'OCCUPIED' | 'AWAY_MODE' | 'ALERT_ACTIVE';

export interface RegisteredObject {
  id: string;
  name: string;
  room: string;
  category: 'Valuable' | 'Vehicle' | 'Utility' | 'Appliance';
  status: 'STATIONARY' | 'MOVED_DETECTED' | 'VERIFIED_SAFE';
  lastChecked: string;
}

export interface HouseSensors {
  doorSensor: 'CLOSED' | 'OPEN' | 'FORCED';
  windowSensor: 'CLOSED' | 'OPEN' | 'TAMPERED';
  motionSensor: 'IDLE' | 'DETECTED';
  objectPresence: 'VERIFIED' | 'MOVED' | 'MISSING';
  occupancyDetection: 'PRESENT' | 'EMPTY' | 'UNKNOWN_PRESENCE';
  wirelessMesh: 'ONLINE' | 'DEGRADED';
}

export interface HouseDeviceHealth {
  cameraStatus: 'ONLINE' | 'OFFLINE_TAMPER';
  cameraTamper: boolean;
  powerSource: 'GRID_AC' | 'BATTERY_BACKUP';
  batteryPct: number;
  internetStatus: 'CONNECTED' | 'OFFLINE_LOCAL_MODE';
  localStorageStatus: 'SYNCED' | 'BUFFERING_LOCAL';
  localQueuedEvents: number;
  localUsedGb: number;
  localCapacityGb: number;
}

export interface HouseEventRecord {
  id: string;
  timestamp: string;
  type:
    | 'AWAY_ARMED'
    | 'HOME_RETURNED'
    | 'DOOR_ACTIVITY'
    | 'WINDOW_ACTIVITY'
    | 'UNKNOWN_MOVEMENT'
    | 'OBJECT_MOVED'
    | 'CAMERA_TAMPER'
    | 'INTERNET_OFFLINE'
    | 'LOCAL_SYNC'
    | 'POWER_FAILURE'
    | 'GUARD_ACK'
    | 'RESOLVED';
  title: string;
  detail: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  synced: boolean;
}

export interface ColonyHouse {
  id: string; // H-01 to H-30
  securityId: string; // NX-RES-01 to NX-RES-30
  ownerName: string;
  ownerPhone: string;
  designType: HouseDesignType;
  floors: 2 | 3;
  streetName: string;
  plotAreaSqFt: number;
  coordinates: [number, number, number];
  facingAngle: number;
  wallColor: number;
  accentColor: number;
  status: HouseSecurityStatus;
  awayMode: {
    enabled: boolean;
    durationDays: number;
    departureDate: string;
    returnDate: string;
    lastActivity: string;
  };
  sensors: HouseSensors;
  devices: HouseDeviceHealth;
  registeredObjects: RegisteredObject[];
  eventHistory: HouseEventRecord[];
}

export type AlertCategory =
  | 'Suspicious Movement'
  | 'Door/Window Activity'
  | 'Object Movement'
  | 'Camera Tampering'
  | 'Device Offline'
  | 'Power Failure'
  | 'Unauthorized Gate Entry';

export type AlertVerificationState =
  | 'SIMULATED_DETECTION'
  | 'UNDER_GUARD_REVIEW'
  | 'HUMAN_VERIFIED_INCIDENT'
  | 'FALSE_ALARM_CLEARED';

export interface SecurityAlert {
  id: string;
  houseId: string;
  securityId: string;
  category: AlertCategory;
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  title: string;
  description: string;
  timestamp: string;
  snapshotMode?: 'motion' | 'object-before-after' | 'camera-offline' | 'gate-denied';
  objectName?: string;
  verificationState: AlertVerificationState;
  acknowledgedByGuard: boolean;
  assignedGuardId?: string;
  resolved: boolean;
  localBuffered: boolean;
}

export interface GuardOfficer {
  id: string;
  name: string;
  badge: string;
  role: string;
  station: string;
  status: 'AVAILABLE' | 'AT_GATE' | 'PATROLLING' | 'RESPONDING';
  assignedIncidentId: string | null;
  lastCheckIn: string;
}

export interface GateEntryRecord {
  id: string;
  timestamp: string;
  visitorName: string;
  entryType: 'Resident' | 'Visitor' | 'Delivery' | 'Unauthorized';
  targetHouseId: string;
  vehicleNumber: string;
  purpose: string;
  authorized: boolean;
  gateAction: 'BOOM_OPENED' | 'ACCESS_DENIED' | 'GUARD_INTERCEPTED';
}

export type CityJourneyStepId =
  | 'city-entrance'
  | 'approach-road'
  | 'colony-gate'
  | 'guard-cabin'
  | 'inside-colony'
  | 'explore-homes'
  | 'smart-building';

export interface CityJourneyStep {
  id: CityJourneyStepId;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  cameraPos: [number, number, number];
  lookAt: [number, number, number];
  badge: string;
}
