import { PresentationSlide } from '../types';

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 1,
    title: '1. The Urban Challenge',
    subtitle: 'Why Isolated Engineering Silos Fail Modern Megacities',
    summary: 'Global urbanization will place 70% of the world population in cities by 2050. Conventional cities operate in disconnected departmental silos where roads, power grids, and water systems are designed in total isolation.',
    bulletPoints: [
      'Isolated civil infrastructure creates traffic choke points without real-time ECE/CSE telemetry.',
      'Unbalanced electrical grids experience brownouts due to blind spot consumption peaks.',
      'Disjointed emergency response costs vital minutes during natural disasters and medical crises.',
      'Environmental emissions remain uncontrolled without continuous cross-departmental telemetry.'
    ],
    highlight: 'A Smart City cannot be constructed or operated by any single engineering branch alone.',
    engineersInvolved: ['Civil', 'Electrical', 'Mechanical', 'CSE'],
    speakerNotes: 'Start by explaining that modern urban problems are fundamentally interdisciplinary. A traffic jam is not just a civil road problem—it is a data communication (ECE), machine learning (AI/ML), and vehicle technology (Automobile) opportunity.'
  },
  {
    id: 2,
    title: '2. The NEXUS Smart City Concept',
    subtitle: 'Cyber-Physical Digital Twin Architecture for 2035',
    summary: 'NEXUS SMART CITY redefines the urban ecosystem as an interconnected, living machine governed by real-time digital twin synchronization and closed-loop cyber-physical control.',
    bulletPoints: [
      'Every physical structure, conduit, and vehicle is mirrored continuously in a high-fidelity 3D digital twin.',
      'Sensors stream 25 million data packets per second across low-latency 5G/6G wireless backbones.',
      'Edge artificial intelligence analyzes incoming patterns to make sub-second automated decisions.',
      'Physical actuators—from hydraulic floodgates to variable frequency chillers—respond autonomously.'
    ],
    highlight: 'Connecting the physical world with the digital realm through real-time telemetry.',
    engineersInvolved: ['CSE', 'ECE', 'AI/ML', 'Civil', 'Architecture'],
    speakerNotes: 'Highlight the digital twin aspect. Emphasize that NEXUS is not just a visual model; it is a bidirectional control plane where software changes physical behavior and physical changes update the simulation.'
  },
  {
    id: 3,
    title: '3. Engineering Collaboration Matrix',
    subtitle: '14 Disciplines, One Unified Ecosystem',
    summary: 'No system in NEXUS exists in a vacuum. Every single municipal subsystem represents a collaborative interface between at least three distinct engineering disciplines.',
    bulletPoints: [
      'Civil builds the structural conduits, while Electrical & ECE lay the fiber and power backbones.',
      'Mechanical designs the HVAC thermodynamics, while AI/ML algorithms optimize predictive cooling.',
      'Automobile creates the electric autonomous shuttles, while Civil shapes inductive charging roadbeds.',
      'Biomedical monitors citizen vitals, while Aerospace dispatches autonomous AED defibrillator drones.'
    ],
    highlight: 'ONE CITY. MANY ENGINEERS. ONE INTELLIGENT FUTURE.',
    engineersInvolved: ['All 14 Disciplines'],
    speakerNotes: 'Walk through the 14-discipline formula. Show the judges how each discipline has a dedicated purpose, but their true brilliance comes from seamless integration.'
  },
  {
    id: 4,
    title: '4. Smart Systems & Infrastructure',
    subtitle: '12 Autonomous Subsystems Keeping the City Resilient',
    summary: 'From intelligent roads to self-healing electrical grids and pneumatic waste chutes, NEXUS integrates 12 mission-critical smart systems into one coordinated network.',
    bulletPoints: [
      'Smart Traffic: Green-wave light timing powered by computer vision cameras reduces commute delays by 28%.',
      'Smart Grid: 87% renewable energy with instantaneous microgrid islanding preventing citywide blackouts.',
      'Smart Water & Waste: Acoustic leak detection and underground vacuum tubes eliminate garbage trucks.',
      'Public Safety: Automated seismic alarms shut down trains and open elevator doors 14 seconds before tremors arrive.'
    ],
    highlight: 'Transforming dumb concrete into responsive, intelligent urban organs.',
    engineersInvolved: ['Civil', 'Mechanical', 'Electrical', 'ECE', 'Robotics'],
    speakerNotes: 'Point to the interactive systems panel on screen. Mention that the audience can click any system to see the exact flow of engineering tasks.'
  },
  {
    id: 5,
    title: '5. The 3D Digital Twin Engine',
    subtitle: 'Interactive Spatial Computing with Three.js',
    summary: 'Built natively with Three.js, our spatial visualization engine maps every skyscraper, road vector, autonomous drone corridor, and sensor beacon in real time.',
    bulletPoints: [
      'Full 6-DOF camera navigation allowing orbital, street-level, and aerial panoramic inspection.',
      'Live raycast selection enabling judges to inspect individual structures and view engineering ownership.',
      'Dynamic scene controls for lighting, traffic simulation, sensor mesh visualization, and emergency state.',
      'Resilient WebGL architecture with automatic fallback ensuring uninterrupted presentation performance.'
    ],
    highlight: 'A 2035 Smart City Command Center running directly inside modern web browsers.',
    engineersInvolved: ['CSE', 'ECE', 'Architecture'],
    speakerNotes: 'Demonstrate clicking on a 3D building, bridge, or drone in the Three.js viewport. Show how clicking an object reveals the exact engineers responsible for its design and operation.'
  },
  {
    id: 6,
    title: '6. AI & Data Analytics Backbone',
    subtitle: 'From Big Data Ingestion to Autonomous Action',
    summary: 'The NEXUS AI Command Center processes continuous telemetry streams, turning raw sensor data into predictive actions before disruptions can occur.',
    bulletPoints: [
      'Predictive time-series neural networks forecast electricity and water demand 24 hours in advance.',
      'Autonomous incident dispatch routes robotic response teams and emergency vehicles with zero human lag.',
      'Simulated natural language command interface allows city administrators to query telemetry instantly.',
      'Edge tensor processors on streetlights classify anomalies locally, preserving citizen privacy.'
    ],
    highlight: 'Data is the blood of the smart city, and Artificial Intelligence is its cognitive brain.',
    engineersInvolved: ['AI/ML', 'CSE', 'ECE'],
    speakerNotes: 'Explain how the AI Command Center responds to queries. Show that rather than a generic chatbot, it acts as a synthetic municipal dispatch operator with engineering attribution.'
  },
  {
    id: 7,
    title: '7. Sustainability & Circular Economy',
    subtitle: 'Net-Zero Carbon, Water Stewardship & Urban Agriculture',
    summary: 'NEXUS proves that high-density technological living can coexist in perfect equilibrium with nature through regenerative engineering design.',
    bulletPoints: [
      '87% Renewable Energy powered by offshore direct-drive wind turbines and building-integrated solar windows.',
      '72% Wastewater Recycled back to drinking standards using advanced nanofiltration membranes.',
      'Skyscraper vertical farms producing 35% of fresh produce using 95% less water and zero pesticides.',
      '46% Green urban coverage through biophilic skybridges and vertical living forest facades.'
    ],
    highlight: 'True smartness is measured by how lightly the city touches the biosphere.',
    engineersInvolved: ['Environmental', 'Chemical', 'Agricultural', 'Architecture'],
    speakerNotes: 'Highlight the work of Environmental, Chemical, and Agricultural engineers. Show how vertical farms and membrane filtration transform resource scarcity into abundance.'
  },
  {
    id: 8,
    title: '8. Future Vision & Conclusion',
    subtitle: 'The Blueprint for 2035 and Beyond',
    summary: 'Engineering is not just about building isolated machines; it is about building the world around us. NEXUS SMART CITY represents what is possible when every engineering discipline unites.',
    bulletPoints: [
      'Civil builds the infrastructure. Electrical powers it. ECE connects it.',
      'CSE digitizes it. AI/ML makes it intelligent. Mechanical builds its machines.',
      'Environmental keeps it sustainable. Robotics automates it. Automobile moves it.',
      'Biomedical improves healthcare. Chemical supports processes. Aerospace monitors from above.',
      'Agricultural feeds it. Architecture plans the harmonious whole.'
    ],
    highlight: 'ONE CITY. MANY ENGINEERS. ONE INTELLIGENT FUTURE.',
    engineersInvolved: ['All 14 Disciplines', 'Rajeev Singh Rajpoot', 'Rahul Ahirwar'],
    speakerNotes: 'Conclude with the powerful closing statement. Thank the faculty, judges, and audience on behalf of the project team: Rajeev Singh Rajpoot and Rahul Ahirwar.'
  }
];
