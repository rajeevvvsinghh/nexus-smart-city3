import { SmartSystem } from '../types';

export const SMART_CITY_SYSTEMS: SmartSystem[] = [
  {
    id: 'smart-buildings',
    title: 'SMART BUILDINGS',
    category: 'Structural & Built Environment',
    iconName: 'Building',
    description: 'Autonomous high-rises equipped with kinetic sun-shading facades, predictive HVAC zoning, and real-time structural health monitoring.',
    engineersInvolved: ['Civil Engineering', 'Electrical Engineering', 'CSE', 'ECE', 'Mechanical Engineering', 'Architecture'],
    technologies: ['BIM Telemetry', 'Tuned Mass Seismic Dampers', 'Smart Electrochromic Glass', 'BACnet / IP Protocols', 'LoRaWAN Micro-Environmental Nodes'],
    benefits: [
      '42% reduction in commercial building energy consumption',
      'Millisecond structural vibration detection during micro-quakes',
      'Dynamic daylight harvesting reducing artificial lighting by 65%',
      'Predictive maintenance alerts preventing elevator downtime'
    ],
    explanation: {
      overview: 'Modern smart buildings are living machines that breathe, adapt to solar irradiance, and structurally self-monitor.',
      flow: [
        { discipline: 'Civil & Architecture', action: 'Design aerodynamic, earthquake-resistant high-rise structures with conduit pathways.' },
        { discipline: 'Mechanical', action: 'Installs variable refrigerant flow HVAC and tuned mass vibration counter-weights.' },
        { discipline: 'Electrical & ECE', action: 'Wires low-voltage LED networks, sub-metering, and wireless ambient sensors.' },
        { discipline: 'CSE & AI/ML', action: 'Aggregates environmental data to automate temperature zones before occupants arrive.' }
      ],
      realImpact: 'Transforms concrete and steel towers from passive energy drains into active carbon-neutral power balancers.'
    }
  },
  {
    id: 'smart-traffic',
    title: 'SMART TRAFFIC',
    category: 'Mobility & Infrastructure',
    iconName: 'TrafficCone',
    description: 'Dynamic signal timing that adjusts green waves in real time based on computer vision, vehicle density, and emergency vehicle preemption.',
    engineersInvolved: ['ECE', 'CSE', 'AI / Machine Learning', 'Civil Engineering', 'Automobile Engineering'],
    technologies: ['C-V2X (Cellular Vehicle-to-Everything)', 'Edge AI Tensor Cameras', 'Adaptive Signal Algorithms (SCATS/SCOOT)', 'Inductive Loop Sensors', 'Digital Twin Traffic Simulation'],
    benefits: [
      'Average commute time decreased by 28% across downtown arterials',
      'Idling emissions slashed by 34% through green wave optimization',
      'Emergency response vehicles arrive 4.2 minutes faster with priority signals',
      'Zero pedestrian-vehicle accidents in school zones over 18 months'
    ],
    explanation: {
      overview: 'Traffic lights no longer use rigid mechanical timers; they act as a coordinated neural network matching real-time vehicle flow.',
      flow: [
        { discipline: 'ECE', action: 'Connects intersection LiDAR and millimeter-wave radar sensors with sub-millisecond latency.' },
        { discipline: 'CSE', action: 'Ingests streaming telemetry across millions of vehicles into the city message broker.' },
        { discipline: 'AI / Machine Learning', action: 'Calculates global citywide green-wave light timing to disperse choke points.' },
        { discipline: 'Civil', action: 'Optimizes lane geometries, turning radius, and dedicated autonomous bus lanes.' },
        { discipline: 'Automobile', action: 'Enables vehicles to receive upcoming speed recommendations directly to in-dash displays.' }
      ],
      realImpact: 'Eliminates gridlock and reduces vehicular fuel burn by keeping arterial traffic moving continuously.'
    }
  },
  {
    id: 'smart-grid',
    title: 'SMART GRID',
    category: 'Energy & Power Infrastructure',
    iconName: 'Zap',
    description: 'Decentralized bidirectional electrical network with sub-second microgrid islanding, battery storage balancing, and real-time demand response.',
    engineersInvolved: ['Electrical Engineering', 'CSE', 'ECE', 'Mechanical Engineering', 'Chemical Engineering'],
    technologies: ['Phasor Measurement Units (PMU)', 'High-Voltage DC (HVDC)', 'Battery Energy Storage Systems (BESS)', 'SCADA Grid Control', 'Smart Inverters with Frequency Regulation'],
    benefits: [
      'Zero blackout record across 4 consecutive years using autonomous islanding',
      '87% of peak daytime electrical demand powered by renewable generation',
      'Instantaneous damping of voltage sag within 16 milliseconds',
      'Vehicle-to-Grid (V2G) integration feeding stored EV power back during peak hours'
    ],
    explanation: {
      overview: 'A smart grid treats energy as a two-way digital internet, routing electricity dynamically from rooftop solar and wind turbines directly to demand centers.',
      flow: [
        { discipline: 'Electrical', action: 'Designs solid-state transformers and automated switchgear capable of sub-cycle switching.' },
        { discipline: 'Chemical', action: 'Develops long-cycle lithium iron phosphate and vanadium redox flow storage cells.' },
        { discipline: 'ECE & CSE', action: 'Installs secure SCADA networks to track millivolt phase angles across every substation.' },
        { discipline: 'AI / Machine Learning', action: 'Forecasts cloud cover and wind gusts to pre-charge city batteries before generation dips.' }
      ],
      realImpact: 'Provides uninterrupted, clean power that prevents multi-million dollar outages for hospitals and research labs.'
    }
  },
  {
    id: 'smart-water',
    title: 'SMART WATER',
    category: 'Hydraulics & Environmental Resources',
    iconName: 'Droplets',
    description: 'Acoustic leak detection, automated stormwater retention reservoirs, and multi-stage membrane purification tracking every drop of potable water.',
    engineersInvolved: ['Civil Engineering', 'Environmental Engineering', 'Chemical Engineering', 'ECE', 'Mechanical Engineering'],
    technologies: ['Hydrodynamic Acoustic Leak Correlators', 'Membrane Bioreactors (MBR)', 'Smart Water Ultrasonic Meters', 'Automated Sluice Gates', 'Dissolved Oxygen Real-Time Probes'],
    benefits: [
      'Non-revenue water loss dropped below 4.5% compared to global average of 30%',
      '92% of city wastewater treated to potable and greywater irrigation standards',
      'Stormwater retention reservoirs buffer 50-year flash floods seamlessly',
      'Continuous contaminant testing detecting micro-toxins in parts-per-billion'
    ],
    explanation: {
      overview: 'Clean water is conserved, monitored for biochemical contaminants in real time, and recycled through closed loops.',
      flow: [
        { discipline: 'Civil', action: 'Engineers aqueducts, pressurized pipe gradients, and subterranean overflow tanks.' },
        { discipline: 'Mechanical', action: 'Configures variable-speed magnetic bearing pumps with zero cavitation risk.' },
        { discipline: 'Chemical & Environmental', action: 'Runs multi-barrier ozone and reverse-osmosis filtration membranes.' },
        { discipline: 'ECE & CSE', action: 'Monitors acoustic frequency signatures across the pipe network to detect pinhole leaks.' }
      ],
      realImpact: 'Ensures water security for generations even amidst extreme regional climate droughts.'
    }
  },
  {
    id: 'smart-waste',
    title: 'SMART WASTE',
    category: 'Sanitation & Circular Economy',
    iconName: 'Trash2',
    description: 'Underground pneumatic suction waste transit pipes, robotic optical sorting facilities, and fill-level ultrasonic smart bin arrays.',
    engineersInvolved: ['Mechanical Engineering', 'Robotics Engineering', 'Environmental Engineering', 'CSE', 'Chemical Engineering'],
    technologies: ['Pneumatic Underground Waste Chutes (Envac)', 'Hyperspectral Optical Sorters', 'Ultrasonic Depth Sensors', 'Anaerobic Bio-Digesters', 'Refuse-Derived Fuel Plants'],
    benefits: [
      'Eliminated 85% of diesel garbage truck traffic and exhaust on city streets',
      '81% total municipal waste diverted from landfills into circular recycling',
      'Organic food waste converted into 14 MW of clean biomethane electricity',
      'Zero odor emission in pedestrian districts through vacuum seal seals'
    ],
    explanation: {
      overview: 'Instead of noisy garbage trucks stopping at every corner, waste is vacuumed through subterranean high-velocity tubes directly to an automated sorting facility.',
      flow: [
        { discipline: 'Mechanical', action: 'Constructs vacuum propulsion tubes with supersonic air exhaust scrubbers.' },
        { discipline: 'Robotics', action: 'Directs multi-axis delta arms with computer vision to sort plastics, metals, and cardboard.' },
        { discipline: 'Environmental & Chemical', action: 'Oversees anaerobic digestion tanks that ferment food scrap into bio-gas.' },
        { discipline: 'CSE & ECE', action: 'Tracks container fill capacities and schedules automated vacuum cycles.' }
      ],
      realImpact: 'Removes street-level odor, rodents, and diesel exhaust while turning organic trash into renewable energy.'
    }
  },
  {
    id: 'smart-healthcare',
    title: 'SMART HEALTHCARE',
    category: 'Biomedical & Public Health',
    iconName: 'HeartPulse',
    description: 'Interconnected city hospitals with autonomous medical delivery drones, continuous chronic patient telemetry, and emergency triage prioritization.',
    engineersInvolved: ['Biomedical Engineering', 'CSE', 'Aerospace Engineering', 'ECE', 'Electrical Engineering'],
    technologies: ['Continuous Physiological Telemetry', 'Autonomous eVTOL Medical Delivery', 'FHIR / HL7 Interoperability', 'Negative Pressure Infection Isolation', 'Hospital Asset RFID Real-Time Location (RTLS)'],
    benefits: [
      'Average AED defibrillator response delivered within 2.1 minutes via rapid aerial drone',
      'Zero patient record synchronization delays across all 14 city emergency trauma centers',
      'Early outbreak detection through continuous sewer wastewater viral screening',
      '99.9999% clean power reliability for neonatal and surgical ICU wings'
    ],
    explanation: {
      overview: 'Healthcare extends beyond hospital walls: wearable biosensors and rapid drone corridors create an omnipresent medical safety net.',
      flow: [
        { discipline: 'Biomedical', action: 'Develops wearable biosensors and automated clinical triage algorithms.' },
        { discipline: 'Aerospace', action: 'Deploys autonomous medical drones carrying blood, organs, and defibrillators.' },
        { discipline: 'ECE & CSE', action: 'Maintains ultra-secure, encrypted wireless links with zero packet loss.' },
        { discipline: 'Civil & Electrical', action: 'Constructs vibration-isolated hospital towers with multi-redundant power loops.' }
      ],
      realImpact: 'Turns critical cardiac and trauma survivability into a near certainty through rapid intervention.'
    }
  },
  {
    id: 'smart-agriculture',
    title: 'SMART AGRICULTURE',
    category: 'Food Security & Bio-Systems',
    iconName: 'Sprout',
    description: 'Vertical skyscraper aeroponic farms, spectral LED photosynthesis tuning, closed-loop water misting, and robotic harvesting.',
    engineersInvolved: ['Agricultural Engineering', 'Mechanical Engineering', 'Environmental Engineering', 'AI / Machine Learning', 'Architecture'],
    technologies: ['High-Pressure Aeroponic Atomizers', 'Targeted Chlorophyll-A/B LED Spectra', 'Autonomous Gantry Harvesters', 'Dissolved Nutrient Dosing Sensors', 'Carbon Dioxide Injection Systems'],
    benefits: [
      '95% less water required compared to conventional horizontal open-field agriculture',
      'Zero synthetic pesticides or herbicides required in sterile positive-pressure chambers',
      'Fresh produce delivered to urban supermarkets within 2 hours of harvesting',
      'Year-round harvest cycles completely immune to droughts, freezes, or hailstorms'
    ],
    explanation: {
      overview: 'Skyscrapers double as indoor vertical farms, growing food directly where citizens live without miles of long-haul shipping.',
      flow: [
        { discipline: 'Agricultural', action: 'Formulates nutrient ion concentrations and plant growth light recipe protocols.' },
        { discipline: 'Mechanical', action: 'Fabricates micro-droplet mist nozzles that feed plant roots suspended in air.' },
        { discipline: 'AI / Machine Learning', action: 'Uses multispectral cameras to identify the exact hour of peak vegetable ripeness.' },
        { discipline: 'Architecture', action: 'Integrates vertical greenhouses into high-rise facades to maximize natural daylight.' }
      ],
      realImpact: 'Guarantees food security and eliminates millions of food transport shipping miles.'
    }
  },
  {
    id: 'public-safety',
    title: 'PUBLIC SAFETY',
    category: 'Resilience & Emergency Response',
    iconName: 'ShieldAlert',
    description: 'Autonomous disaster sensing, seismic shake alarms, automated emergency route evacuation lighting, and coordinated multi-agency dispatch.',
    engineersInvolved: ['Civil Engineering', 'ECE', 'CSE', 'Aerospace Engineering', 'Robotics Engineering'],
    technologies: ['MEMS Accelerometer Seismic Networks', 'Thermal Imaging Aerial Drones', 'Emergency Wayfinding Floor Beacons', 'Unified Incident Command Systems', 'Autonomous Fire Suppression Sprinklers'],
    benefits: [
      '14-second advance earthquake warning automatically stops trains and opens elevator doors',
      'Coordinated dispatch response time reduced to 2.4 minutes citywide',
      'Thermal drone perimeter scans identify structural hot-spots before wall collapse',
      'Encrypted emergency communications mesh operates independently of the commercial cellular grid'
    ],
    explanation: {
      overview: 'Public safety is an automated, proactive reflex system that detects hazards seconds before humans can sense them.',
      flow: [
        { discipline: 'Civil', action: 'Equips foundations with accelerometers to verify structural integrity after an earthquake.' },
        { discipline: 'ECE', action: 'Broadcasts instant evacuation alerts across dynamic digital street signage.' },
        { discipline: 'Aerospace & Robotics', action: 'Dispatches thermal imaging quadcopters to guide search teams into smoke.' },
        { discipline: 'CSE', action: 'Synchronizes police, medical, and fire units onto a live 3D tactical map.' }
      ],
      realImpact: 'Minimizes loss of life during catastrophic natural disasters through autonomous split-second action.'
    }
  },
  {
    id: 'renewable-energy',
    title: 'RENEWABLE ENERGY',
    category: 'Clean Generation & Decarbonization',
    iconName: 'Sun',
    description: 'Offshore floating wind turbines, building-integrated photovoltaics (BIPV), and green hydrogen storage systems generating 87% of the city’s power.',
    engineersInvolved: ['Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Civil Engineering', 'Environmental Engineering'],
    technologies: ['Perovskite-Silicon Tandem Solar Cells', 'Direct-Drive Permanent Magnet Wind Turbines', 'Proton Exchange Membrane Electrolyzers', 'Solar Thermal Molten Salt Reservoirs', 'Maximum Power Point Tracking (MPPT)'],
    benefits: [
      'Over 1.8 Gigawatt-hours of clean electricity generated daily without fossil fuel combustion',
      '41% drop in net carbon emissions compared to baseline metropolitan standards',
      'BIPV transparent solar windows turn entire glass skyscrapers into clean power generators',
      'Excess midday generation converted cleanly into 50 tons of green hydrogen daily'
    ],
    explanation: {
      overview: 'The city generates its own electricity cleanly on every exposed surface—from windows and rooftops to offshore coastal breezes.',
      flow: [
        { discipline: 'Civil & Mechanical', action: 'Anchors towering 15-megawatt offshore wind turbine foundations to ocean bedrock.' },
        { discipline: 'Electrical', action: 'Converts fluctuating turbine AC voltage to high-efficiency DC transmission corridors.' },
        { discipline: 'Chemical', action: 'Uses surplus solar power to split purified water into zero-emission hydrogen gas fuel.' },
        { discipline: 'Environmental', action: 'Monitors marine and avian safety around renewable generation zones.' }
      ],
      realImpact: 'Proves that a metropolis of millions can sustain heavy industry and comfort with zero fossil fuel smoke.'
    }
  },
  {
    id: 'smart-transport',
    title: 'SMART TRANSPORT',
    category: 'Transit & Multi-Modal Mobility',
    iconName: 'Train',
    description: 'Integrated autonomous maglev rapid transit, electric bus rapid transit (eBRT), micro-mobility lanes, and seamless digital fare integration.',
    engineersInvolved: ['Automobile Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'CSE'],
    technologies: ['High-Speed Linear Induction Motors (Maglev)', 'Dynamic Inductive In-Road Wireless Charging', 'Autonomous Platoon Braking Systems', 'Real-Time Passenger Density Tracking', 'Unified MaaS (Mobility as a Service) Engine'],
    benefits: [
      'Citizens travel anywhere in the city within 15 minutes via synchronized transit hubs',
      '100% electrified municipal transit fleet with zero tailpipe emissions',
      '99.8% on-time arrival schedule accuracy managed by machine learning dispatch',
      'Dynamic routing changes during major stadium concerts or unexpected rainstorms'
    ],
    explanation: {
      overview: 'Mobility is unified: passengers step from autonomous local shuttles directly into high-speed subterranean maglevs with zero wait times.',
      flow: [
        { discipline: 'Civil', action: 'Constructs vibration-damped elevated tracks and deep underground interchange stations.' },
        { discipline: 'Mechanical & Automobile', action: 'Fabricates aerodynamic carbon-composite passenger shells and levitation chassis.' },
        { discipline: 'Electrical', action: 'Supplies high-amperage linear motors and dynamic roadside inductive charging beds.' },
        { discipline: 'CSE', action: 'Powers the single-tap universal transit ticketing and predictive seating algorithm.' }
      ],
      realImpact: 'Renders personal fossil fuel car ownership completely unnecessary while returning hours of daily time to residents.'
    }
  },
  {
    id: 'iot-sensor-network',
    title: 'IoT SENSOR NETWORK',
    category: 'Telemetry & Pervasive Computing',
    iconName: 'Cpu',
    description: 'Over 25 million ultra-low-power micro-sensors monitoring air quality, road strain, water pressure, pedestrian footfall, and noise pollution.',
    engineersInvolved: ['ECE', 'CSE', 'AI / Machine Learning', 'Electrical Engineering', 'Environmental Engineering'],
    technologies: ['Energy-Harvesting Triboelectric Sensors', 'MQTT-SN Telemetry Protocols', 'LoRaWAN Long-Range Gateways', 'Edge RISC-V Neural Processors', 'Encrypted Hardware Secure Elements'],
    benefits: [
      'Sub-meter granularity across 12 environmental metrics updated every 500 milliseconds',
      'Battery-free sensor nodes powered indefinitely by solar harvesting and ambient RF energy',
      'Zero data spoofing or man-in-the-middle tampering protected by hardware enclave keys',
      'Instantaneous notification of abnormal gas or chemical emissions before human smell threshold'
    ],
    explanation: {
      overview: 'The city possesses continuous digital senses—feeling pressure, breathing air chemistry, and listening for structural stress.',
      flow: [
        { discipline: 'ECE', action: 'Designs ultra-low power silicon microchips that harvest energy from ambient light and heat.' },
        { discipline: 'CSE', action: 'Builds massive ingestion clusters capable of handling 50 million telemetry packets per second.' },
        { discipline: 'Environmental', action: 'Calibrates optical sensors to distinguish fine PM2.5 particulates from pollen.' },
        { discipline: 'AI / Machine Learning', action: 'Correlates micro-changes across millions of sensors to isolate anomalies.' }
      ],
      realImpact: 'Transforms invisible environmental and physical changes into actionable digital reality.'
    }
  },
  {
    id: 'digital-governance',
    title: 'DIGITAL GOVERNANCE',
    category: 'Civic Technology & Citizen Trust',
    iconName: 'Server',
    description: 'Transparent digital twin public portal, cryptographic citizen identity, automated building permits, and open municipal data APIs.',
    engineersInvolved: ['CSE', 'AI / Machine Learning', 'Architecture', 'Civil Engineering', 'ECE'],
    technologies: ['Cryptographic Zero-Knowledge Identity', 'Spatial Digital Twin WebGL Rendering', 'Automated Code Compliance Checkers', 'Open Data REST / GraphQL Gateways', 'Decentralized Audit Logs'],
    benefits: [
      'Building permit approvals accelerated from 6 months to 14 minutes using automated BIM code checkers',
      '100% transparent public spending and carbon budget tracking accessible to every citizen',
      'Zero physical paper documentation required for city utilities or healthcare enrollment',
      'Public crowdsourced problem reporting verified by drone confirmation in under 10 minutes'
    ],
    explanation: {
      overview: 'City hall is in the palm of your hand: citizens interact with an open, verified digital twin where government is transparent, fast, and accountable.',
      flow: [
        { discipline: 'CSE', action: 'Architects decentralized, privacy-preserving digital identity credentials.' },
        { discipline: 'Architecture & Civil', action: 'Uploads 3D BIM models into automated compliance checkers that verify building codes.' },
        { discipline: 'AI / Machine Learning', action: 'Answers citizen questions in 12 languages instantly with verified data citations.' },
        { discipline: 'ECE', action: 'Ensures municipal service kiosks provide equal high-speed access in all neighborhoods.' }
      ],
      realImpact: 'Replaces bureaucratic red tape with instant, verifiable digital services that respect citizen privacy.'
    }
  }
];
