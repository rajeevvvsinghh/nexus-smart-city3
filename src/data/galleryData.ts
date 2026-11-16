export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  engineers: string[];
  specs: string[];
}

export const CITY_GALLERY: GalleryItem[] = [
  {
    id: 'future-skyline',
    title: 'Future Skyline & Skybridge Matrix',
    category: 'Architecture & Civil Engineering',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    description: 'Interconnected mega-skyscrapers joined by aerodynamic biophilic skybridges at heights exceeding 250 meters. Features dynamic vibration damping and solar-harvesting glass facades.',
    engineers: ['Civil Engineering', 'Architecture', 'Mechanical Engineering', 'Electrical Engineering'],
    specs: ['Structural Height: 480m', 'Seismic Damping: Tuned Mass 800t', 'Solar Glass: 45W/m² yield']
  },
  {
    id: 'smart-transportation',
    title: 'Autonomous EV & Maglev Corridors',
    category: 'Automobile & Civil Engineering',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    description: 'Multi-tiered highway arterials equipped with continuous dynamic inductive charging coils, guiding autonomous passenger pods and high-speed subterranean maglev shuttles.',
    engineers: ['Automobile Engineering', 'Civil Engineering', 'Electrical Engineering', 'AI / Machine Learning'],
    specs: ['Wireless In-Road Power: 50kW', 'V2X Latency: < 1.2ms', 'Platoon Speed: 110 km/h']
  },
  {
    id: 'green-infrastructure',
    title: 'Vertical Biophilic Living Towers',
    category: 'Environmental & Architecture',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    description: 'Skyscrapers clad in over 20,000 living plants and trees, acting as natural thermal insulation layers and urban oxygen micro-factories that eliminate street-level heat island effects.',
    engineers: ['Environmental Engineering', 'Agricultural Engineering', 'Architecture', 'Mechanical Engineering'],
    specs: ['CO₂ Absorption: 180t/yr/tower', 'Temp Reduction: -3.8°C', 'Automated Aeroponic Dosing']
  },
  {
    id: 'smart-buildings',
    title: 'Kinetic Facade Intelligent Towers',
    category: 'Mechanical & ECE',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Self-adjusting origami kinetic shading louvers that open and close in synchronization with solar azimuth angles to minimize thermal solar gain while preserving panoramic skyline views.',
    engineers: ['Mechanical Engineering', 'ECE', 'Architecture', 'CSE'],
    specs: ['Motorized Actuators: 4,200 units', 'Cooling Energy Savings: 38%', 'Sensor Refresh: 200ms']
  },
  {
    id: 'renewable-energy',
    title: 'Offshore Floating Wind & Solar Arrays',
    category: 'Electrical & Mechanical',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
    description: 'Direct-drive 15MW offshore wind turbines anchored to ocean floor tension legs, paired with floating bifacial solar photovoltaic arrays feeding clean power directly to the city grid.',
    engineers: ['Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Civil Engineering'],
    specs: ['Installed Capacity: 1.8 GW', 'Transmission: 500kV HVDC', 'Electrolyzer Output: 50t H₂/day']
  },
  {
    id: 'connected-city',
    title: '5G/6G Dense Terahertz Mesh Grid',
    category: 'Electronics & Communication',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    description: 'Pervasive millimeter-wave and sub-terahertz micro-antennas integrated seamlessly into smart street lamps, bus shelters, and bridge pillars, enabling seamless vehicle-to-infrastructure connectivity.',
    engineers: ['ECE', 'CSE', 'Electrical Engineering'],
    specs: ['Active IoT Nodes: 25.4M', 'Throughput: 100 Gbps/cell', 'Packet Reliability: 99.9999%']
  },
  {
    id: 'drone-network',
    title: 'Autonomous Skyway Air Traffic Management',
    category: 'Aerospace & Robotics',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
    description: 'Geofenced 3D aerial transit corridors reserved for electric VTOL passenger air taxis, medical blood delivery multirotors, and autonomous inspection quadcopters.',
    engineers: ['Aerospace Engineering', 'Robotics Engineering', 'ECE', 'AI / Machine Learning'],
    specs: ['Corridor Altitudes: 120m-350m', 'Collision Avoidance: Active Radar', 'Response Radius: 180s']
  },
  {
    id: 'future-healthcare',
    title: 'Smart Trauma Center & Biosensor Hub',
    category: 'Biomedical & CSE',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    description: 'Next-generation trauma hospital featuring rooftop eVTOL emergency pads, robotic surgical suites, and automated diagnostic isolation wings connected in real time to municipal emergency dispatch.',
    engineers: ['Biomedical Engineering', 'CSE', 'Electrical Engineering', 'Civil Engineering'],
    specs: ['Triage Latency: Instantaneous', 'Clean Air Rating: Class 100 Cleanroom', 'Uninterrupted Power: Level 4']
  }
];

export const GALLERY_ITEMS = CITY_GALLERY;
