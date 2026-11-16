import React, { useState, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SmartCitySystems } from './components/SmartCitySystems';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { CityDashboard } from './components/CityDashboard';
import { AboutProject } from './components/AboutProject';
import { PresentationMode } from './components/PresentationMode';
import { Footer } from './components/Footer';
import { CityZone, ColonyHouse, CityOperationalAlert } from './types';
import { INITIAL_COLONY_HOUSES } from './data/colonyData';
import { CITY_ZONES } from './data/dashboardData';
import { playSingleAlertBeep } from './utils/securityAudio';

function nowTimeString(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

const INITIAL_OPERATIONAL_ALERTS: CityOperationalAlert[] = [
  {
    id: 'op-init-1',
    timestamp: '07:42:10 am',
    severity: 'SUCCESS',
    source: 'SMART GRID',
    zone: 'District 02 Substation',
    title: 'Solar & Hydrogen Microgrid Balanced at 87% Clean Share',
    detail: 'Photovoltaic arrays and offshore wind feed nominal 418 MW reserve with zero voltage sag across arterial feeders.',
    zoneId: 'zone-grid',
  },
  {
    id: 'op-init-2',
    timestamp: '07:41:34 am',
    severity: 'INFO',
    source: 'COLONY GATE',
    zone: 'Shanti Vihar Colony',
    title: 'ANPR Security Checkpoint Armed (H-01 to H-30)',
    detail: 'Boom barrier sensors and local hybrid Sub-GHz residential mesh nodes synced cleanly.',
    zoneId: 'zone-colony',
  },
  {
    id: 'op-init-3',
    timestamp: '07:40:52 am',
    severity: 'INFO',
    source: 'V2X CORRIDOR',
    zone: 'Skyline Financial Core',
    title: 'Adaptive Signal Timing Synchronized on Metro Central Ave',
    detail: '14 autonomous vehicles cruising at 48 km/h average velocity with zero intersection queuing.',
    zoneId: 'zone-skyline',
  },
  {
    id: 'op-init-4',
    timestamp: '07:39:18 am',
    severity: 'WARNING',
    source: 'COLONY WATCH',
    zone: 'Shanti Vihar · H-08',
    title: 'Home Away Mode Active on Villa H-08 (8-Day Trip)',
    detail: 'Perimeter reed contacts, PIR motion, and Study Room Safe monitor operating in armed autonomous mode.',
    zoneId: 'zone-colony',
  },
  {
    id: 'op-init-5',
    timestamp: '07:38:05 am',
    severity: 'SUCCESS',
    source: 'HYDRAULIC NET',
    zone: 'Harbor Marina',
    title: 'Nanofiltration Aqueduct Purity Verified at 99.8%',
    detail: 'Closed-loop stormwater retention basins stabilized at 18.4M liters reserve.',
    zoneId: 'zone-harbor',
  },
];

export function App() {
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<CityZone | null>(null);

  const [colonyHouses] = useState<ColonyHouse[]>(INITIAL_COLONY_HOUSES);
  const [selectedHouseId, setSelectedHouseId] = useState<string>('H-08');
  const [gateOpen, setGateOpen] = useState<boolean>(false);
  const [gateWarning, setGateWarning] = useState<boolean>(false);

  const [operationalAlerts, setOperationalAlerts] = useState<CityOperationalAlert[]>(
    INITIAL_OPERATIONAL_ALERTS
  );
  const lastZoneAlertIdRef = useRef<string | null>(null);

  const pushOperationalAlert = useCallback(
    (event: Omit<CityOperationalAlert, 'id' | 'timestamp'>) => {
      const next: CityOperationalAlert = {
        ...event,
        id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowTimeString(),
      };
      setOperationalAlerts((prev) => {
        // Avoid duplicating identical consecutive alerts fired back-to-back
        if (prev[0] && prev[0].title === next.title && prev[0].source === next.source) {
          return prev;
        }
        return [next, ...prev].slice(0, 30);
      });
    },
    []
  );

  const handleEmergencyToggle = useCallback(
    (active: boolean) => {
      setEmergencyActive(active);
      pushOperationalAlert(
        active
          ? {
              severity: 'CRITICAL',
              source: 'V2X EMERGENCY',
              zone: 'Metro Central Ave',
              title: 'V2X Emergency Preemption Activated',
              detail:
                'Cross-boulevard signals locked for Priority Trauma Interceptor clearance; civilian AVs decelerating to corridor hold.',
              zoneId: 'zone-biomedical',
            }
          : {
              severity: 'SUCCESS',
              source: 'V2X EMERGENCY',
              zone: 'Metropolitan Grid',
              title: 'Emergency Protocol Cleared · Normal Flow Resumed',
              detail: 'Intersection controllers released back to dynamic AI green-wave optimization.',
              zoneId: 'zone-skyline',
            }
      );
    },
    [pushOperationalAlert]
  );

  const handleSelectZone = useCallback(
    (zone: CityZone | null) => {
      setSelectedZone(zone);
      if (zone && zone.id !== lastZoneAlertIdRef.current) {
        lastZoneAlertIdRef.current = zone.id;
        pushOperationalAlert({
          severity: 'INFO',
          source: 'SECTOR LOCK',
          zone: zone.shortName,
          title: `Spatial Telemetry Stream Focused: ${zone.name}`,
          detail: `Live readout active — ${zone.stats.aqi.value} AQI, ${zone.stats.energy.loadMw} MW grid draw, ${zone.stats.traffic.speedKmh} km/h traffic flow.`,
          zoneId: zone.id,
        });
      } else if (!zone) {
        lastZoneAlertIdRef.current = null;
      }
    },
    [pushOperationalAlert]
  );

  const handleToggleGate = useCallback(
    (open: boolean) => {
      setGateOpen((prev) => {
        if (prev === open) return prev;
        if (open) {
          setGateWarning(false);
          playSingleAlertBeep('gate');
          pushOperationalAlert({
            severity: 'SUCCESS',
            source: 'COLONY GATE',
            zone: 'Shanti Vihar Main Gate',
            title: 'Boom Barrier Opened · Proximity Access Cleared',
            detail: 'Automated ANPR & proximity ring verified crossing into Shanti Vihar Residential Colony.',
            zoneId: 'zone-colony',
          });
        } else {
          playSingleAlertBeep('chime');
          pushOperationalAlert({
            severity: 'INFO',
            source: 'COLONY GATE',
            zone: 'Shanti Vihar Main Gate',
            title: 'Boom Barrier Closed & Perimeter Re-Secured',
            detail: 'Entry lane barrier lowered; guard cabin monitoring nominal.',
            zoneId: 'zone-colony',
          });
        }
        return open;
      });
    },
    [pushOperationalAlert]
  );

  const handleInspectHouseInOperations = useCallback(
    (houseId: string) => {
      setSelectedHouseId(houseId);
      const house = colonyHouses.find((h) => h.id === houseId);
      const colZone = CITY_ZONES.find((z) => z.id === 'zone-colony') || null;
      if (colZone) {
        setSelectedZone(colZone);
      }
      if (house) {
        pushOperationalAlert({
          severity:
            house.status === 'ALERT_ACTIVE'
              ? 'CRITICAL'
              : house.awayMode.enabled
                ? 'WARNING'
                : 'INFO',
          source: 'COLONY INSPECT',
          zone: `Shanti Vihar · ${house.id}`,
          title: `${house.id} (${house.ownerName}) Routed to Operations Telemetry`,
          detail: `Security ID ${house.securityId} · Status: ${house.status.replace('_', ' ')} · Power: ${house.devices.powerSource} (${house.devices.batteryPct}%).`,
          zoneId: 'zone-colony',
        });
      }
      const el = document.getElementById('zone-telemetry-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [colonyHouses, pushOperationalAlert]
  );

  const handleFocusZoneIn3D = useCallback((zoneId: string) => {
    const z = CITY_ZONES.find((item) => item.id === zoneId) || null;
    if (z) {
      setSelectedZone(z);
    }
    const twinElem = document.getElementById('digital-twin');
    if (twinElem) {
      twinElem.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      className={`min-h-screen bg-[#09090d] text-[#f4f1ea] selection:bg-[#d4a853]/30 selection:text-[#f8e6be] ${
        emergencyActive ? 'ring-2 ring-rose-500/60' : ''
      }`}
    >
      {/* Fixed Navigation Bar */}
      <Navbar
        onOpenPresentation={() => setIsPresentationOpen(true)}
        emergencyActive={emergencyActive}
      />

      {/* Focused 4-Section Page Flow: 3D Twin, 12 Smart City Systems, Operations, About */}
      <main>
        {/* 1. Three.js Digital Twin + Shanti Vihar Residential Colony */}
        <DigitalTwin3D
          emergencyActive={emergencyActive}
          onEmergencyToggle={handleEmergencyToggle}
          selectedZone={selectedZone}
          onSelectZone={handleSelectZone}
          colonyHouses={colonyHouses}
          selectedHouseId={selectedHouseId}
          onSelectHouse={setSelectedHouseId}
          onInspectHouseInControlRoom={handleInspectHouseInOperations}
          gateOpen={gateOpen}
          onToggleGate={handleToggleGate}
          gateWarning={gateWarning}
          focusHouseTrigger={null}
          onOperationalEvent={pushOperationalAlert}
        />

        {/* 2. 12 Smart City Systems */}
        <SmartCitySystems onOpenExplainThis={() => {}} />

        {/* 3. City Operations Dashboard */}
        <CityDashboard
          emergencyActive={emergencyActive}
          selectedZone={selectedZone}
          onSelectZone={handleSelectZone}
          operationalAlerts={operationalAlerts}
          onPushOperationalAlert={pushOperationalAlert}
          onClearOperationalAlerts={() => setOperationalAlerts([])}
          onFocusZoneIn3D={handleFocusZoneIn3D}
        />

        {/* 4. About Project & Team */}
        <AboutProject />
      </main>

      {/* Footer */}
      <Footer onOpenPresentation={() => setIsPresentationOpen(true)} />

      {/* Full-Screen Presentation Mode Overlay */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />
    </div>
  );
}

export default App;
