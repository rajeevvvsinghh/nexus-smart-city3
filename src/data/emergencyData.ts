import { EmergencyScenario } from '../types';

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'normal',
    name: 'NORMAL (Steady State)',
    level: 'NORMAL',
    description: 'All municipal services operating within nominal parameters. Smart grid balancing load, traffic moving freely, and environmental metrics optimal.',
    affectedZones: ['All Sectors (A, B, C, D) - Nominal'],
    respondingTeams: ['CSE', 'ECE', 'AI / Machine Learning', 'Electrical Engineering'],
    telemetryImpact: {
      aqi: 94,
      energyUsage: 68,
      trafficCongestion: 14,
      waterPressure: 92
    },
    stages: {
      detection: {
        title: 'Continuous IoT Telemetry',
        desc: 'Sensors across 14 sectors stream 25M readings/sec with zero anomalies detected.',
        disciplines: ['ECE', 'CSE']
      },
      analysis: {
        title: 'Neural Baseline Verification',
        desc: 'AI models verify traffic speeds and grid frequencies adhere to nominal bounds.',
        disciplines: ['AI / Machine Learning']
      },
      response: {
        title: 'Autonomous Optimization',
        desc: 'Micro-adjustments to solar panel angles and traffic signal green waves run in the background.',
        disciplines: ['Electrical', 'Automobile']
      },
      recovery: {
        title: 'Nominal Health Check',
        desc: 'Automated digital twin audit logs confirm 99.999% system readiness.',
        disciplines: ['CSE', 'Civil']
      }
    }
  },
  {
    id: 'flood',
    name: 'FLASH FLOOD EMERGENCY',
    level: 'CRITICAL',
    description: 'Severe monsoon rainfall detected exceeding 85mm/hr in District 3. River basin level rising rapidly toward critical crest threshold.',
    affectedZones: ['Sector 3 (Riverfront District)', 'Sector 4 (Lowland Marina)'],
    respondingTeams: ['Civil Engineering', 'Environmental Engineering', 'CSE', 'Electrical Engineering', 'AI / Machine Learning', 'Mechanical Engineering'],
    telemetryImpact: {
      aqi: 88,
      energyUsage: 79,
      trafficCongestion: 62,
      waterPressure: 100
    },
    stages: {
      detection: {
        title: 'Acoustic & Radar Level Detection',
        desc: 'Ultrasonic river sensors and civil telemetry alert of rapid 1.4m surge in 12 minutes.',
        disciplines: ['ECE', 'Civil Engineering', 'Environmental']
      },
      analysis: {
        title: 'Hydrodynamic Surge Simulation',
        desc: 'AI hydrologic models calculate flood inundation boundaries and predict choke points.',
        disciplines: ['AI / Machine Learning', 'CSE']
      },
      response: {
        title: 'Automated Barrier Deployment',
        desc: 'Civil flood gates engage hydraulically; mechanical stormwater pumps activate at 150,000 L/min.',
        disciplines: ['Civil Engineering', 'Mechanical Engineering', 'Electrical']
      },
      recovery: {
        title: 'Water Redirection to Storage',
        desc: 'Surge diverted into subterranean reservoirs; environmental teams test for sediment contamination.',
        disciplines: ['Environmental', 'Chemical Engineering']
      }
    }
  },
  {
    id: 'fire',
    name: 'HIGH-RISE FIRE INCIDENT',
    level: 'CRITICAL',
    description: 'Thermal sensor trigger in commercial tower 42. Smoke detected on 38th floor with possible electrical duct ignition.',
    affectedZones: ['Sector 2 (Financial District)', 'Sky Tower 42 Floors 36-40'],
    respondingTeams: ['Robotics Engineering', 'Aerospace Engineering', 'ECE', 'CSE', 'Biomedical Engineering', 'Civil Engineering'],
    telemetryImpact: {
      aqi: 165,
      energyUsage: 72,
      trafficCongestion: 58,
      waterPressure: 95
    },
    stages: {
      detection: {
        title: 'Infrared & Air Particulate Alert',
        desc: 'Building smoke sensor and thermal ceiling arrays trip within 400 milliseconds of ignition.',
        disciplines: ['ECE', 'Electrical Engineering']
      },
      analysis: {
        title: 'Structural Heat Propagation Model',
        desc: 'Civil and mechanical BIM models map airflow dynamics and isolate elevator shafts.',
        disciplines: ['Civil Engineering', 'Mechanical', 'AI/ML']
      },
      response: {
        title: 'Drone Aerial Suppression & Evacuation',
        desc: 'Aerospace autonomous firefighting drones deploy foam; magnetic elevators park safely.',
        disciplines: ['Aerospace', 'Robotics Engineering', 'Automobile']
      },
      recovery: {
        title: 'Biomedical Triage & Structural Scan',
        desc: 'Biomedical trauma drones land on rooftop; civil engineers inspect steel column thermal stress.',
        disciplines: ['Biomedical', 'Civil Engineering']
      }
    }
  },
  {
    id: 'power-failure',
    name: 'GRID POWER FAILURE (TRANSFORMER TRIP)',
    level: 'HIGH',
    description: 'High-voltage substation feeder 7 experiences sudden insulation breakdown due to lightning strike.',
    affectedZones: ['Sector 1 (North Industrial)', 'Substation 7 Grid Corridor'],
    respondingTeams: ['Electrical Engineering', 'CSE', 'ECE', 'Mechanical Engineering', 'AI / Machine Learning'],
    telemetryImpact: {
      aqi: 92,
      energyUsage: 51,
      trafficCongestion: 38,
      waterPressure: 86
    },
    stages: {
      detection: {
        title: 'Phasor Measurement Unit Trigger',
        desc: 'Substation PMU detects 60Hz frequency deviation and phase shift in 8 milliseconds.',
        disciplines: ['Electrical Engineering', 'ECE']
      },
      analysis: {
        title: 'Fault Isolation Calculation',
        desc: 'Grid software isolates feeder 7 to prevent cascading blackout across the metropolitan ring.',
        disciplines: ['CSE', 'AI / Machine Learning']
      },
      response: {
        title: 'BESS Battery Islanding & Reroute',
        desc: 'Solid-state storage systems kick in; rooftop solar arrays supply critical infrastructure instantly.',
        disciplines: ['Electrical Engineering', 'Mechanical']
      },
      recovery: {
        title: 'Robotic Substation Inspection',
        desc: 'Autonomous crawler inspects transformer bushing oil; power restored seamlessly via backup loop.',
        disciplines: ['Robotics Engineering', 'Electrical']
      }
    }
  },
  {
    id: 'traffic-accident',
    name: 'ARTERIAL TRAFFIC ACCIDENT',
    level: 'ELEVATED',
    description: 'Freight vehicle mechanical wheel detachment on Expressway Alpha creating 3-lane obstruction.',
    affectedZones: ['Sector 2 (Central Expressway Northbound)'],
    respondingTeams: ['Automobile Engineering', 'AI / Machine Learning', 'CSE', 'Civil Engineering', 'ECE'],
    telemetryImpact: {
      aqi: 104,
      energyUsage: 69,
      trafficCongestion: 74,
      waterPressure: 92
    },
    stages: {
      detection: {
        title: 'Computer Vision Anomaly Detection',
        desc: 'Overhead optical tensor cameras flag sudden deceleration and lane obstruction in 1.2 seconds.',
        disciplines: ['ECE', 'AI / Machine Learning']
      },
      analysis: {
        title: 'Dynamic Congestion Divert Routing',
        desc: 'Traffic digital twin simulates downstream backpressure and calculates bypass routes.',
        disciplines: ['AI / Machine Learning', 'CSE']
      },
      response: {
        title: 'V2X Vehicle Notification & Green Wave',
        desc: 'Connected vehicles rerouted via in-car displays; traffic lights clear path for tow robots.',
        disciplines: ['Automobile Engineering', 'Civil Engineering']
      },
      recovery: {
        title: 'Rapid Robotic Clearance',
        desc: 'Autonomous heavy-duty tow unit clears debris; road reopened in under 9 minutes.',
        disciplines: ['Robotics Engineering', 'Automobile']
      }
    }
  },
  {
    id: 'water-leak',
    name: 'MUNICIPAL WATER LEAK (PRESSURE DROP)',
    level: 'HIGH',
    description: 'High-pressure trunk aqueduct in Sector 4 experiences crack with 1,200 L/min localized discharge.',
    affectedZones: ['Sector 4 (South Residential & Hospital District)'],
    respondingTeams: ['Civil Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'ECE', 'Robotics Engineering'],
    telemetryImpact: {
      aqi: 94,
      energyUsage: 71,
      trafficCongestion: 22,
      waterPressure: 61
    },
    stages: {
      detection: {
        title: 'Acoustic Wave Correlation',
        desc: 'Sub-surface acoustic hydrophones pinpoint leak coordinate to within 1.5 meters.',
        disciplines: ['ECE', 'Environmental Engineering']
      },
      analysis: {
        title: 'Hydraulic Pressure Rebalance',
        desc: 'Fluid dynamics simulation calculates bypass pressure to prevent water cutoff to hospital.',
        disciplines: ['Mechanical Engineering', 'CSE']
      },
      response: {
        title: 'Automated Isolation Valve Closure',
        desc: 'SCADA motorized valves close surrounding segment; backup reservoir feeds neighborhood.',
        disciplines: ['Mechanical', 'Civil Engineering']
      },
      recovery: {
        title: 'Subterranean Robot Pipe Sealing',
        desc: 'Internal pipe crawler robot applies carbon-epoxy composite sleeve inside the pipeline.',
        disciplines: ['Robotics Engineering', 'Chemical Engineering']
      }
    }
  },
  {
    id: 'air-pollution',
    name: 'AIR POLLUTION / SMOG SPIKE',
    level: 'ELEVATED',
    description: 'Thermal inversion traps fine particulate matter (PM2.5) over Industrial Corridor due to wind stillness.',
    affectedZones: ['Sector 1 (Industrial East)', 'Sector 3 (Perimeter Zone)'],
    respondingTeams: ['Environmental Engineering', 'Chemical Engineering', 'Agricultural Engineering', 'AI / Machine Learning', 'CSE'],
    telemetryImpact: {
      aqi: 182,
      energyUsage: 65,
      trafficCongestion: 18,
      waterPressure: 92
    },
    stages: {
      detection: {
        title: 'Spectroscopic Gas Sensor Network',
        desc: 'Micro-spectrometers register PM2.5 spike above 85 µg/m³ with nitrogen dioxide traces.',
        disciplines: ['ECE', 'Environmental Engineering']
      },
      analysis: {
        title: 'Microclimate Wind Dispersion Model',
        desc: 'Atmospheric fluid models predict dispersion patterns and calculate population exposure.',
        disciplines: ['Environmental', 'AI / Machine Learning']
      },
      response: {
        title: 'High-Altitude Mist & Bioreactor Activation',
        desc: 'Rooftop water atomizers spray neutralizing mist; industrial emissions temporarily throttle.',
        disciplines: ['Chemical Engineering', 'Mechanical Engineering']
      },
      recovery: {
        title: 'Vertical Forest Air Filtering',
        desc: 'Skyscraper biophilic living walls accelerate transpiration, returning AQI to 65 in 45 minutes.',
        disciplines: ['Agricultural Engineering', 'Architecture']
      }
    }
  }
];
