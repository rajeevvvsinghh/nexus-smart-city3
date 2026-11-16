import {
  ColonyHouse,
  HouseDesignType,
  SecurityAlert,
  GuardOfficer,
  GateEntryRecord,
  CityJourneyStep,
} from '../types';

export const CITY_JOURNEY_STEPS: CityJourneyStep[] = [
  {
    id: 'city-entrance',
    stepNumber: 1,
    title: 'Smart City Main Entrance',
    subtitle: 'Metro Central Ave Gateway',
    description:
      'Start outside the NEXUS Smart City perimeter gate on Metro Central Avenue overlooking the intelligent urban skyline.',
    cameraPos: [0, 34, 295],
    lookAt: [0, 22, 40],
    badge: 'STEP 01 · OUTSIDE CITY',
  },
  {
    id: 'approach-road',
    stepNumber: 2,
    title: 'Colony Approach Road',
    subtitle: 'Eastbound Boulevard Link',
    description:
      'Drive east along the landscaped arterial road connecting the NEXUS metropolitan core directly to Shanti Vihar Residency.',
    cameraPos: [108, 20, 120],
    lookAt: [175, 10, 120],
    badge: 'STEP 02 · APPROACH ROAD',
  },
  {
    id: 'colony-gate',
    stepNumber: 3,
    title: 'Gated Colony Entrance',
    subtitle: 'Shanti Vihar Main Gate & Boom Barrier',
    description:
      'Arrive at the smart residential gate featuring ANPR vehicle scanning, automated boom barrier, and visitor/delivery access lanes.',
    cameraPos: [134, 15, 134],
    lookAt: [162, 7, 118],
    badge: 'STEP 03 · SECURITY GATE',
  },
  {
    id: 'guard-cabin',
    stepNumber: 4,
    title: 'Security Checkpoint & Guard Cabin',
    subtitle: '24/7 Guard Station & Visitor Desk',
    description:
      'Inspect the colony security checkpoint cabin, guard telemetry terminal, and independent fail-safe emergency exit monitoring.',
    cameraPos: [148, 12, 92],
    lookAt: [165, 6, 108],
    badge: 'STEP 04 · GUARD CABIN',
  },
  {
    id: 'inside-colony',
    stepNumber: 5,
    title: 'Enter Residential Colony',
    subtitle: 'Boom Barrier Open · Inside Shanti Vihar',
    description:
      'Boom barrier opens automatically for authorized inspection. Glide down the central tree-lined avenue past the community park.',
    cameraPos: [195, 22, 120],
    lookAt: [285, 8, 120],
    badge: 'STEP 05 · INSIDE COLONY',
  },
  {
    id: 'explore-homes',
    stepNumber: 6,
    title: 'Explore Homes (H-01 to H-30)',
    subtitle: 'Interactive Indian Smart Colony Overview',
    description:
      'Explore 30 modern 2-storey and 3-storey Indian houses with footpaths, streetlights, central park, parking bays, and click any home to inspect AI security.',
    cameraPos: [265, 118, 258],
    lookAt: [262, 6, 120],
    badge: 'STEP 06 · H-01 TO H-30',
  },
  {
    id: 'smart-building',
    stepNumber: 7,
    title: 'Continue to Smart Building',
    subtitle: 'NEXUS Tower 01 (Existing Project)',
    description:
      'Return westward along the smart city corridor to inspect the original NEXUS Tower 01 Smart Building project in Downtown Skyline Core.',
    cameraPos: [-105, 88, 35],
    lookAt: [-50, 58, -40],
    badge: 'STEP 07 · SMART BUILDING',
  },
];

const INDIAN_OWNERS = [
  'Vikramaditya Rao',
  'Priya Nair',
  'Siddharth Kulkarni',
  'Ananya Chatterjee',
  'Rohan Deshmukh',
  'Meera Krishnan',
  'Aditya Verma',
  'Arjun Mehta', // H-08 flagship Away Mode house
  'Kavita Joshi',
  'Nikhil Kapoor',
  'Sneha Agarwal',
  'Harishankar Iyer',
  'Pooja Malhotra',
  'Deepak Bansal',
  'Ritika Sengupta',
  'Prashant Tiwari',
  'Nandini Menon',
  'Karanveer Singh',
  'Shruti Gokhale',
  'Abhishek Mishra',
  'Divya Subramanian',
  'Tarun Khanna',
  'Pallavi Patil',
  'Gaurav Saxena',
  'Aishwarya Hegde',
  'Manish Chawla',
  'Swati Kulkarni',
  'Rajeshwar Prasad',
  'Bhavna Choudhary',
  'Sandeep Reddy',
];

const DESIGN_TYPES: HouseDesignType[] = [
  'Modern Duplex Villa',
  '3-Storey Courtyard Home',
  '2-Storey Terrace Bungalow',
  'Corner Veranda Residence',
];

// Realistic Indian residential exterior plaster & stone accents
const WALL_PALETTES = [
  { wall: 0xf2e9dc, accent: 0xb45309 }, // Warm sandstone ivory + terracotta
  { wall: 0xe8e4dc, accent: 0x334155 }, // Travertine cream + slate charcoal
  { wall: 0xf4efe6, accent: 0x0f766e }, // Lime stucco + teal architectural band
  { wall: 0xebe0d0, accent: 0x9a3412 }, // Rajasthan beige + burnt sienna
  { wall: 0xe2e8f0, accent: 0x1e3a8a }, // Cool concrete white + indigo trim
  { wall: 0xf5ebe0, accent: 0x4d7c0f }, // Soft almond + olive stone
];

const STREET_NAMES = [
  'Gulmohar Marg (North Lane)',
  'Amaltas Avenue (Central Park)',
  'Ashoka Enclave Road (South Lane)',
];

function buildInitialObjects(houseId: string): ColonyHouse['registeredObjects'] {
  if (houseId === 'H-08') {
    return [
      {
        id: 'obj-h08-1',
        name: 'Study Room Safe Locker',
        room: '1st Floor Study',
        category: 'Valuable',
        status: 'STATIONARY',
        lastChecked: '2 mins ago',
      },
      {
        id: 'obj-h08-2',
        name: 'Brass Heritage Lamp Stand',
        room: 'Living Hall',
        category: 'Valuable',
        status: 'STATIONARY',
        lastChecked: '2 mins ago',
      },
      {
        id: 'obj-h08-3',
        name: 'Ather 450X Electric Scooter',
        room: 'Covered Carport',
        category: 'Vehicle',
        status: 'STATIONARY',
        lastChecked: '2 mins ago',
      },
      {
        id: 'obj-h08-4',
        name: 'Hybrid Solar Inverter Unit',
        room: 'Utility Balcony',
        category: 'Utility',
        status: 'STATIONARY',
        lastChecked: '2 mins ago',
      },
    ];
  }

  return [
    {
      id: `obj-${houseId}-1`,
      name: 'Home Locker Vault',
      room: 'Master Bedroom',
      category: 'Valuable',
      status: 'STATIONARY',
      lastChecked: '4 mins ago',
    },
    {
      id: `obj-${houseId}-2`,
      name: 'Family EV Sedan',
      room: 'Front Driveway',
      category: 'Vehicle',
      status: 'STATIONARY',
      lastChecked: '4 mins ago',
    },
    {
      id: `obj-${houseId}-3`,
      name: 'UPS & Battery Bank',
      room: 'Staircase Lobby',
      category: 'Utility',
      status: 'STATIONARY',
      lastChecked: '4 mins ago',
    },
  ];
}

// Generate 30 realistic Indian houses H-01 to H-30 positioned neatly inside x: [185..345], z: [32..208]
// Layout:
// Row 1 (North edge, facing South +Z): H-01 .. H-06 at z = 34, x = 195..345
// Row 2 (North of Central Ave, facing South +Z, flanking Park): H-07 .. H-10 at z = 88 (left & right of central park)
// Row 3 (South of Central Ave, facing North -Z, flanking Park): H-11 .. H-14 at z = 152 (left & right of central park)
// Row 4 (North of South Lane, facing South +Z): H-15 .. H-20 at z = 168? Wait — let's make 3 clean avenues with non-overlapping plots!
// Let's map exact coordinates cleanly:
// Colony bounds: x = 160 to 365 (width 205), z = 15 to 225 (depth 210)
// Main Gate at x = 160, z = 120
// Central Avenue at z = 120 (x = 160..365)
// North Street at z = 62 (x = 180..350)
// South Street at z = 178 (x = 180..350)
// Cross Connector West at x = 182 (z = 55..185)
// Cross Connector East at x = 348 (z = 55..185)
//
// Plot Rows (each house plot is ~20 wide x 20 deep, spaced 25 units on X):
// - Row A (North of North Street, z = 34, facing South +Z): 7 houses H-01..H-07 at x = 195, 220, 245, 270, 295, 320, 345
// - Row B (South of North Street, z = 88, facing North -Z):
//     Left of Park: H-08, H-09 at x = 198, 223
//     Central Park occupies x = 240..292, z = 82..158 (with Central Ave passing z=114..126 or Park split/north-south? Even better: Central Park at x = 244..294, z = 80..108 AND z = 132..160 OR Park centered at x = 266, z = 120 and Central Ave loops around Park, OR Park at x = 246..292, z = 80..160 while Central Ave splits into a roundabout around the Community Park!)
// Wait — a roundabout around the central Community Park looks SO authentic for an Indian residential sector!
// Let's check:
//   - Gate Road enters at x=160, z=120 -> runs to x=238, z=120
//   - Roundabout / Park Perimeter Road wraps around Park (x=242..294, z=90..150)
//   - East Avenue continues x=298..365, z=120 to Emergency Exit at x=365, z=120!
//   - North Street at z=62 (x=182..348)
//   - South Street at z=178 (x=182..348)
// Now check the 30 house plots with zero overlap:
//   - Row 1 (North side of North Street, z=36, facing South): H-01 to H-07 (7 houses: x = 192, 218, 244, 270, 296, 322, 348)
//   - Row 2 (Between North Street z=62 and Park/Central Ave):
//       West Wing (z=88, facing North toward z=62): H-08, H-09 (x = 196, 222)
//       East Wing (z=88, facing North toward z=62): H-10, H-11, H-12 (x = 304, 326, 348)
//   - Row 3 (Flanking Central Ave West & East, facing Central Ave):
//       West of Park (z=100, facing South? No, Park is z=92..148, x=242..294. Let's make sure z=88 doesn't overlap z=100!):
//       Let's tighten the grid math cleanly so every single house has >= 22 units spacing!
//
// Exact clean grid math (zero overlap guaranteed):
// Streets:
//   - North Street: z = 58 (width 10 -> z = 53..63)
//   - Central Avenue: z = 120 (width 12 -> z = 114..126)
//   - South Street: z = 182 (width 10 -> z = 177..187)
//   - West Spine Street: x = 182 (z = 53..187)
//   - East Spine Street: x = 352 (z = 53..187)
//   - Mid-East Cross Street: x = 302 (z = 53..187)
//
// House Plot Positions (plot footprint ~18x18, minimum center-to-center >= 24 units!):
//   - Row 1 (North of North Street, z = 34, facing South [rotY=0]):
//       H-01..H-07 at x = 196, 221, 246, 271, 296, 321, 346 (7 houses)
//   - Row 2 (South of North Street, z = 82, facing North [rotY=PI]):
//       West of Park: H-08, H-09 at x = 204, 230 (2 houses) -> Park occupies x=248..292, z=74..108!
//       East of Cross St: H-10, H-11 at x = 320, 344 (2 houses)
//   - Row 3 (North of Central Ave, z = 100? Wait: 100 - 82 = 18, too close! Instead, put Row 2 at z = 86 (depth 18 -> z=77..95) facing North/South, and Community Park occupies x = 248..292, z = 72..108 AND z = 132..168, OR single large Community Park on the West-Center block x = 246..292, z = 72..166 with Central Ave running along z=120? If Central Ave runs through x=246..292 at z=120, Park can sit at z=72..108 (North Park) and z=132..168 (Play Lawn), OR Park sits at x=246..294, z=72..168 and Central Ave loops at x=238 and x=302!)
//   Let's check looping around Park OR putting Park at x=246..294, z=74..106 (Park Lawn) + z=134..166 (Clubhouse & Gazebo) while z=120 is a grand palm-lined boulevard dividing the twin parks! That gives 30+ units spacing everywhere!
//   Let's verify all 30 house positions with >= 23 units between EVERY pair of houses:
//   - Row 1 (z = 33, facing South +Z): 7 houses -> x = 196, 220, 244, 268, 292, 316, 340 (H-01 .. H-07)
//   - Row 2 (z = 88, facing North -Z toward North St z=58):
//       Left of Park: x = 202, 226 (H-08, H-09)
//       Right of Park: x = 316, 340 (H-10, H-11)
//       (Park North sits at x = 246..296, z = 72..108)
//   - Row 3 (z = 152, facing South +Z toward South St z=182):
//       Left of Park: x = 202, 226 (H-12, H-13)
//       Right of Park: x = 316, 340 (H-14, H-15)
//       (Park South / Community Garden sits at x = 246..296, z = 132..168)
//   - Row 4 (z = 207, facing North -Z toward South St z=182): 7 houses -> x = 196, 220, 244, 268, 292, 316, 340 (H-16 .. H-22)
//   - That's 7 + 4 + 4 + 7 = 22 houses so far. We want 30 houses (H-01 to H-30)!
//   Let's add 8 more houses cleanly on an East Extension Block (x = 365..405) OR West/North/South blocks!
//   Wait: if we widen Colony X slightly from `160..395` (depth `z: 10..235`), let's check:
//   - Row 1 (z = 32, facing +Z): 9 houses -> x = 194, 218, 242, 266, 290, 314, 338, 362, 386 (H-01 .. H-09)
//   - Row 2 (z = 88, facing -Z):
//       Left of Park: x = 198, 222 (H-10, H-11) -- wait, user prompt specifically uses `H-08` as an example! Putting H-08 in Row 1 or right inside the main entrance (e.g. Row 2 left right near the gate!) makes H-08 super easy to spot when entering the colony!
//       Let's put:
//       - Row 2 Left (right inside the main gate, North side of Central Ave / South of North St): `H-07`, `H-08`! Look how cool that is: as soon as you enter the colony gate at `(160, 0, 120)` and look left, `H-08` is right there!
//       Let's count 30 houses cleanly across 4 rows (x = 192 to 384, step = 24):
//       - Row 1 (z = 33, facing +Z, North Street North): 9 houses: x = 192, 216, 240, 264, 288, 312, 336, 360, 384 -> H-01 to H-09 (WAIT: let's put H-08 near the gate if we like, or Row 1 H-01..H-07, Row 2 H-08..H-13!)
//       Let's check Row 1 with 8 houses (x = 194..376, step 26):
//         H-01..H-07? No, 8 houses: x = 196, 222, 248, 274, 300, 326, 352, 378 (8 houses: H-01..H-08, or 7 houses H-01..H-07 + H-08 as the Corner Villa right at x=198, z=88!).
//       Let's verify:
//       - Row 1 (North of North St z=58, z=32, facing South): 7 houses at x = 200, 226, 252, 278, 304, 330, 356 -> H-01 to H-07
//       - Row 2 (Between North St z=58 and Central Ave z=120, z=86, facing North):
//           West of Park: x = 200, 226 -> H-08, H-09 (H-08 is right inside the colony entrance block!)
//           East of Park: x = 318, 344, 370 -> H-10, H-11, H-12 (Park occupies x=246..298, z=72..108)
//       - Row 3 (Between Central Ave z=120 and South St z=182, z=154, facing South):
//           West of Park: x = 200, 226 -> H-13, H-14
//           East of Park: x = 318, 344, 370 -> H-15, H-16, H-17 (South Park Lawn occupies x=246..298, z=132..168)
//       - Row 4 (South of South St z=182, z=208, facing North): 8 houses at x = 200, 226, 252, 278, 304, 330, 356, 382 -> H-18 to H-25
//       - Row 5 (East Avenue Row along x=394, facing West -X toward East Spine St x=372? No, East Spine St is at x=372? If East Spine is at x=382, then at x=406 facing West -X: z = 34, 62, 90, 150, 178 -> 5 houses H-26 to H-30!)
//       Wait: let's check distance between Row 1 (x=356) and Row 5 (x=404): 404 - 356 = 48! Plenty of room for East Spine Street at x=382!
//       And check Row 2 East (x=370) and Row 5 (x=404): 404 - 370 = 34! Wait: Row 5 is East of East Spine Street (x=384), so put Row 5 at x=408 facing West (-X): 408 - 370 = 38 units, and East Spine Street at x=388!
//       Even simpler: put 8 houses in Row 1 (x = 196..378, step 26 -> H-01..H-07 + H-26), 8 houses in Row 4 (H-18..H-25), and 5 houses in Row 5 (x=406)!
//       Let's verify ALL 30 positions:
//       - Row 1 (z=32, facing 0 / South): 7 houses (H-01..H-07) at x = 200, 226, 252, 278, 304, 330, 356
//       - Row 2 (z=86, facing Math.PI / North): 5 houses:
//           H-08 (x=200), H-09 (x=226), H-10 (x=316), H-11 (x=342), H-12 (x=368)
//       - Row 3 (z=154, facing 0 / South): 5 houses:
//           H-13 (x=200), H-14 (x=226), H-15 (x=316), H-16 (x=342), H-17 (x=368)
//       - Row 4 (z=208, facing Math.PI / North): 8 houses (H-18..H-25):
//           x = 200, 226, 252, 278, 304, 330, 356, 382
//       - Row 5 (x=410, facing -Math.PI/2 / West): 5 houses (H-26..H-30):
//           z = 34, 62, 90, 150, 178
//       Total = 7 + 5 + 5 + 8 + 5 = 30 houses (H-01 to H-30)!
//       And minimum distance between any two house centers is >= 26 units (with each plot 19x19), so ZERO collisions, super crisp streets, footpaths, parking, park, gate, guard cabin, and emergency exit at (424, 0, 120)!

interface HouseSlot {
  x: number;
  z: number;
  rotY: number;
  street: string;
}

const HOUSE_SLOTS: HouseSlot[] = [
  // H-01 .. H-07 (Row 1 - North Lane)
  ...[200, 226, 252, 278, 304, 330, 356].map((x) => ({
    x,
    z: 32,
    rotY: 0,
    street: STREET_NAMES[0],
  })),
  // H-08 .. H-12 (Row 2 - Central Park North Block)
  ...[200, 226, 316, 342, 368].map((x) => ({
    x,
    z: 86,
    rotY: Math.PI,
    street: STREET_NAMES[0],
  })),
  // H-13 .. H-17 (Row 3 - Central Park South Block)
  ...[200, 226, 316, 342, 368].map((x) => ({
    x,
    z: 154,
    rotY: 0,
    street: STREET_NAMES[2],
  })),
  // H-18 .. H-25 (Row 4 - South Lane)
  ...[200, 226, 252, 278, 304, 330, 356, 382].map((x) => ({
    x,
    z: 208,
    rotY: Math.PI,
    street: STREET_NAMES[2],
  })),
  // H-26 .. H-30 (Row 5 - East Enclave)
  ...[34, 62, 90, 150, 178].map((z) => ({
    x: 412,
    z,
    rotY: -Math.PI / 2,
    street: STREET_NAMES[1],
  })),
];

export const INITIAL_COLONY_HOUSES: ColonyHouse[] = HOUSE_SLOTS.map((slot, index) => {
  const num = index + 1;
  const numStr = String(num).padStart(2, '0');
  const id = `H-${numStr}`;
  const securityId = `NX-RES-${numStr}`;
  const designType = DESIGN_TYPES[index % DESIGN_TYPES.length];
  const floors: 2 | 3 = designType === '3-Storey Courtyard Home' || index % 3 === 1 ? 3 : 2;
  const palette = WALL_PALETTES[index % WALL_PALETTES.length];

  // Put H-08 (8 days), H-14 (4 days), H-22 (11 days) in Away Mode initially so user immediately sees rich states
  const isH08 = id === 'H-08';
  const isAway = isH08 || id === 'H-14' || id === 'H-22';
  const awayDays = isH08 ? 8 : id === 'H-14' ? 4 : id === 'H-22' ? 11 : 0;

  return {
    id,
    securityId,
    ownerName: INDIAN_OWNERS[index],
    ownerPhone: `+91 98${String(10 + index).padStart(2, '0')}4 ${String(21000 + index * 317).slice(0, 5)}`,
    designType,
    floors,
    streetName: slot.street,
    plotAreaSqFt: floors === 3 ? 2400 : 1850,
    coordinates: [slot.x, 0, slot.z],
    facingAngle: slot.rotY,
    wallColor: palette.wall,
    accentColor: palette.accent,
    status: isAway ? 'AWAY_MODE' : 'OCCUPIED',
    awayMode: {
      enabled: isAway,
      durationDays: awayDays,
      departureDate: isAway ? '16 Nov 2026' : '—',
      returnDate: isH08 ? '24 Nov 2026' : id === 'H-14' ? '20 Nov 2026' : id === 'H-22' ? '27 Nov 2026' : '—',
      lastActivity: isH08
        ? 'Main door locked via smart deadbolt · 08:15 AM'
        : isAway
          ? 'Perimeter sensors armed · Quiet'
          : 'Routine family occupancy detected',
    },
    sensors: {
      doorSensor: 'CLOSED',
      windowSensor: 'CLOSED',
      motionSensor: 'IDLE',
      objectPresence: 'VERIFIED',
      occupancyDetection: isAway ? 'EMPTY' : 'PRESENT',
      wirelessMesh: 'ONLINE',
    },
    devices: {
      cameraStatus: 'ONLINE',
      cameraTamper: false,
      powerSource: 'GRID_AC',
      batteryPct: 96 - (index % 7),
      internetStatus: 'CONNECTED',
      localStorageStatus: 'SYNCED',
      localQueuedEvents: 0,
      localUsedGb: 18 + (index % 14),
      localCapacityGb: 128,
    },
    registeredObjects: buildInitialObjects(id),
    eventHistory: [
      {
        id: `evt-${id}-init`,
        timestamp: isH08 ? '08:15:10 AM' : '09:00:00 AM',
        type: isAway ? 'AWAY_ARMED' : 'HOME_RETURNED',
        title: isH08
          ? 'Home Away Mode Armed (8 Days)'
          : isAway
            ? `Home Away Mode Armed (${awayDays} Days)`
            : 'Home Security Nominal (Occupied)',
        detail: isH08
          ? 'Owner Arjun Mehta departed for 8 days. Door, window, PIR motion, and 4 registered objects armed on local + cloud sync.'
          : isAway
            ? 'All perimeter reed switches and motion detectors armed.'
            : 'Indoor occupancy verified; perimeter alerts on standby.',
        severity: 'INFO',
        synced: true,
      },
    ],
  };
});

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alt-baseline-1',
    houseId: 'H-08',
    securityId: 'NX-RES-08',
    category: 'Door/Window Activity',
    severity: 'LOW',
    title: 'H-08 Armed for 8-Day Away Mode',
    description:
      'Simulated baseline log: Arjun Mehta locked main smart deadbolt and activated 8-day Home Away Mode with 4 monitored objects.',
    timestamp: '08:15:10 AM',
    verificationState: 'FALSE_ALARM_CLEARED',
    acknowledgedByGuard: true,
    assignedGuardId: 'guard-1',
    resolved: true,
    localBuffered: false,
  },
];

export const INITIAL_GUARDS: GuardOfficer[] = [
  {
    id: 'guard-1',
    name: 'Rajesh Verma',
    badge: 'NX-SEC-01',
    role: 'Chief Colony Security Officer',
    station: 'Main Gate Guard Cabin',
    status: 'AT_GATE',
    assignedIncidentId: null,
    lastCheckIn: 'Just now',
  },
  {
    id: 'guard-2',
    name: 'Suresh Patel',
    badge: 'NX-SEC-02',
    role: 'Gate & Boom Barrier Operator',
    station: 'Main Gate Lane 1',
    status: 'AT_GATE',
    assignedIncidentId: null,
    lastCheckIn: '1 min ago',
  },
  {
    id: 'guard-3',
    name: 'Manoj Kumar',
    badge: 'NX-SEC-03',
    role: 'Rapid Mobile Patrol Unit',
    station: 'Sector Park & North Lane',
    status: 'PATROLLING',
    assignedIncidentId: null,
    lastCheckIn: '2 mins ago',
  },
  {
    id: 'guard-4',
    name: 'Kavita Nair',
    badge: 'NX-SEC-04',
    role: 'AI Control Room Supervisor',
    station: 'Colony Command Desk',
    status: 'AVAILABLE',
    assignedIncidentId: null,
    lastCheckIn: 'Just now',
  },
];

export const INITIAL_GATE_ENTRIES: GateEntryRecord[] = [
  {
    id: 'gate-1',
    timestamp: '09:42:18 AM',
    visitorName: 'Ramesh (Blinkit Express)',
    entryType: 'Delivery',
    targetHouseId: 'H-04',
    vehicleNumber: 'DL-03-EV-4821',
    purpose: 'Grocery parcel delivery — OTP verified by resident',
    authorized: true,
    gateAction: 'BOOM_OPENED',
  },
  {
    id: 'gate-2',
    timestamp: '09:28:04 AM',
    visitorName: 'Dr. Kavita Joshi',
    entryType: 'Resident',
    targetHouseId: 'H-09',
    vehicleNumber: 'DL-08-CA-9012',
    purpose: 'Resident ANPR tag match',
    authorized: true,
    gateAction: 'BOOM_OPENED',
  },
  {
    id: 'gate-3',
    timestamp: '09:05:51 AM',
    visitorName: 'Unregistered Courier Van',
    entryType: 'Unauthorized',
    targetHouseId: 'H-08',
    vehicleNumber: 'HR-26-TEMP-00',
    purpose: 'No resident approval & H-08 in Away Mode — denied at gate',
    authorized: false,
    gateAction: 'ACCESS_DENIED',
  },
];

export interface DemoStepMeta {
  step: number;
  title: string;
  description: string;
  actionLabel: string;
}

export const DEMO_SIMULATION_STEPS: DemoStepMeta[] = [
  {
    step: 1,
    title: 'Owner Leaving Home (H-08)',
    description: 'Resident Arjun Mehta leaves H-08 for an 8-day outstation trip; occupancy sensors verify house is empty.',
    actionLabel: 'Simulate Owner Leaving',
  },
  {
    step: 2,
    title: 'Home Away Mode Activation',
    description: 'H-08 activates 8-Day Home Away Mode, arming door/window reed switches, PIR motion, and 4 registered objects.',
    actionLabel: 'Activate Away Mode',
  },
  {
    step: 3,
    title: 'Unknown Movement Detected',
    description: 'Simulated radar + PIR detects unscheduled indoor motion (no facial recognition used — pure event + human verification).',
    actionLabel: 'Trigger Unknown Movement',
  },
  {
    step: 4,
    title: 'Door Opening Sensor Triggered',
    description: 'Front smart door reed sensor detects unauthorized opening on H-08 during Away Mode; audible alarm activates.',
    actionLabel: 'Trigger Door Opening',
  },
  {
    step: 5,
    title: 'Registered Object Movement',
    description: 'AI object presence monitor flags "Study Room Safe Locker" displacement and generates Before/After frames.',
    actionLabel: 'Trigger Object Movement',
  },
  {
    step: 6,
    title: 'Camera Disconnected / Tamper Alert',
    description: 'Primary porch camera loses signal (CAMERA OFFLINE), triggering tamper alert while independent Sub-GHz sensors keep monitoring.',
    actionLabel: 'Disconnect Camera',
  },
  {
    step: 7,
    title: 'Internet Connectivity Failure',
    description: 'Fiber link drops; local edge hub switches to offline buffering mode, retaining all events locally without loss.',
    actionLabel: 'Simulate Internet Outage',
  },
  {
    step: 8,
    title: 'Power Failure (Battery Backup)',
    description: 'Grid AC fails; H-08 smart hub seamlessly transfers to LiFePO4 Battery Backup (94% SOC, ~14 hrs runtime).',
    actionLabel: 'Simulate Power Failure',
  },
  {
    step: 9,
    title: 'Guard Receives Alert & Restores Sync',
    description: 'Guard Rajesh Verma receives priority alert, acknowledges incident, restores internet link & syncs local buffer.',
    actionLabel: 'Guard Acknowledge & Sync',
  },
  {
    step: 10,
    title: 'Security Incident Resolution',
    description: 'Patrol inspects H-08, logs human verification, restores camera/power, and marks the incident resolved.',
    actionLabel: 'Resolve Incident',
  },
];
