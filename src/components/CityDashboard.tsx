import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Wind,
  Zap,
  Car,
  Droplet,
  Trash2,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  Sun,
  MapPin,
  Target,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  Radio,
  X,
  Bell,
  Pause,
  Play,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  CITY_METRICS,
  ENERGY_CHART_DATA,
  TRAFFIC_CHART_DATA,
  AIR_QUALITY_ZONES,
  CITY_ZONES
} from '../data/dashboardData';
import { CityOperationalAlert, CityZone } from '../types';

interface CityDashboardProps {
  emergencyActive: boolean;
  selectedZone?: CityZone | null;
  onSelectZone?: (zone: CityZone | null) => void;
  operationalAlerts?: CityOperationalAlert[];
  onPushOperationalAlert?: (event: Omit<CityOperationalAlert, 'id' | 'timestamp'>) => void;
  onClearOperationalAlerts?: () => void;
  onFocusZoneIn3D?: (zoneId: string) => void;
}

const AMBIENT_TELEMETRY_POOL: Array<Omit<CityOperationalAlert, 'id' | 'timestamp'>> = [
  {
    severity: 'INFO',
    source: 'DRONE ALPHA',
    zone: 'Skyline Perimeter',
    title: 'Skyway Alpha Completed 155m Roof Thermal Scan',
    detail: 'Zero thermal hotspots detected across NEXUS Tower 01 HVAC banks.',
    zoneId: 'zone-skyline',
  },
  {
    severity: 'SUCCESS',
    source: 'AGRITECH ARRAY',
    zone: 'Vertical Sky-Farm',
    title: 'Hydroponic Nutrient Loop Balanced (pH 6.1)',
    detail: 'LED spectrum tuned to afternoon irradiance; 94% greywater recirculation.',
    zoneId: 'zone-agritech',
  },
  {
    severity: 'INFO',
    source: 'BIOMEDICAL GRID',
    zone: 'Smart Hospital',
    title: 'Trauma Microgrid Battery Bank Verified at 99% SOC',
    detail: 'Medical cryo-storage and surgical wings running on dual redundant UPS.',
    zoneId: 'zone-biomedical',
  },
  {
    severity: 'WARNING',
    source: 'COLONY MESH',
    zone: 'Shanti Vihar · H-14',
    title: 'Sub-GHz Mesh Node Auto-Switched Channel',
    detail: 'Local residential telemetry node hopped to interference-free 865 MHz band cleanly.',
    zoneId: 'zone-colony',
  },
  {
    severity: 'INFO',
    source: 'HARBOR SENSORS',
    zone: 'Harbor Bridge',
    title: 'Cable-Stayed Resonance Damping Nominal (0.04 mm)',
    detail: 'Optical strain gauges calibrated under cross-canal breeze.',
    zoneId: 'zone-harbor',
  },
];

export const CityDashboard: React.FC<CityDashboardProps> = ({
  emergencyActive,
  selectedZone,
  onSelectZone,
  operationalAlerts = [],
  onPushOperationalAlert,
  onClearOperationalAlerts,
  onFocusZoneIn3D,
}) => {
  const [metrics] = useState(CITY_METRICS);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'energy' | 'traffic' | 'air' | 'water'>('energy');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS'>('ALL');
  const [liveFeedActive, setLiveFeedActive] = useState(true);
  const [feedHovered, setFeedHovered] = useState(false);
  const feedScrollRef = useRef<HTMLDivElement | null>(null);
  const ambientCursorRef = useRef(0);

  // Subtle ambient telemetry pulse when dashboard is visible and feed is live (zero render storms)
  useEffect(() => {
    if (!liveFeedActive || !onPushOperationalAlert) return;
    const timer = window.setInterval(() => {
      if (document.hidden || feedHovered) return;
      const sample = AMBIENT_TELEMETRY_POOL[ambientCursorRef.current % AMBIENT_TELEMETRY_POOL.length];
      ambientCursorRef.current += 1;
      onPushOperationalAlert(sample);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 11000);
    return () => window.clearInterval(timer);
  }, [liveFeedActive, feedHovered, onPushOperationalAlert]);

  // Smoothly scroll vertical feed back to top when a fresh alert arrives (unless user is hovering/reading)
  useEffect(() => {
    if (!feedHovered && feedScrollRef.current) {
      feedScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [operationalAlerts.length, feedHovered]);

  const filteredAlerts =
    alertFilter === 'ALL'
      ? operationalAlerts
      : operationalAlerts.filter((a) => a.severity === alertFilter);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 350);
  };

  const scrollToTwin = () => {
    const twinElem = document.getElementById('digital-twin');
    if (twinElem) {
      twinElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getMetricIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Wind': return <Wind className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Droplet': return <Droplet className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      default: return <Activity className={className} />;
    }
  };

  return (
    <section
      id="dashboard"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b10] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>COMMAND CENTER TELEMETRY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight">
              City Operations Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYNCED · {lastUpdated}</span>
            </div>
            <button
              onClick={handleManualRefresh}
              className="px-3 py-2 rounded-lg bg-[#111116] border border-white/[0.1] hover:border-[#d4a853]/45 text-[#e8c678] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sync Latest Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isRefreshing ? 'rotate-180' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 7 Telemetry Headline Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-10">
          {metrics.map((m) => {
            const isAlert = emergencyActive && (m.id === 'traffic' || m.id === 'emergency');
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                  isAlert
                    ? 'bg-rose-950/35 border-rose-500/50'
                    : 'bg-[#111116] border-white/[0.08] hover:border-[#d4a853]/35'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      {m.label}
                    </span>
                    <div className="text-[#d4a853]">
                      {getMetricIcon(m.iconName, 'w-4 h-4')}
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-[#f4f1ea] tabular-nums mb-1">
                    {isAlert && m.id === 'traffic' ? 'HIGH' : isAlert && m.id === 'emergency' ? '1.8 MIN' : m.value}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {m.subValue}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400 flex items-center gap-1 tabular-nums">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{m.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone Specific Telemetry & Operations Inspector */}
        <div id="zone-telemetry-section" className="mb-10">
          {/* Quick Zone Selector Strip */}
          <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-[#111116] border border-white/[0.08] mb-4 gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4a853]">
              <MapPin className="w-4 h-4" />
              <span className="font-bold">METROPOLITAN SECTORS:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectZone?.(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  !selectedZone
                    ? 'bg-[#d4a853] text-[#09090d] font-bold'
                    : 'bg-[#0d0d12] text-zinc-400 hover:text-[#f4f1ea] border border-white/[0.08]'
                }`}
              >
                ALL SECTORS
              </button>

              {CITY_ZONES.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => onSelectZone?.(zone)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#d4a853] text-[#09090d] font-bold'
                        : 'bg-[#0d0d12] text-zinc-300 hover:text-[#f4f1ea] border border-white/[0.08]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isSelected ? '#09090d' : zone.accentColor
                      }}
                    />
                    <span>{zone.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Zone Telemetry Card */}
          {selectedZone ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111116] border border-[#d4a853]/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] mb-6 gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d4a853]/15 border border-[#d4a853]/40 text-[#e8c678] flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      3D SECTOR SELECTION
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      District: <strong className="text-[#f4f1ea]">{selectedZone.district}</strong>
                    </span>
                    <span className="text-xs font-mono text-zinc-500 tabular-nums">
                      Coords: [{selectedZone.center.join(', ')}]
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#f4f1ea]">
                    {selectedZone.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                    {selectedZone.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={scrollToTwin}
                    className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>VIEW IN 3D SCENE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectZone?.(null)}
                    className="p-2 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear Zone Filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Zone-Specific Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 tabular-nums">
                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>AIR QUALITY INDEX</span>
                    <Wind className="w-4 h-4 text-[#d4a853]" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-[#e8c678] mb-1">
                    {selectedZone.stats.aqi.value} <span className="text-xs font-normal text-zinc-400">AQI</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{selectedZone.stats.aqi.label}</span>
                    <span className="text-zinc-500">Optical Array</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>SECTOR POWER LOAD</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-[#f4f1ea] mb-1">
                    {selectedZone.stats.energy.loadMw} <span className="text-xs font-normal text-zinc-400">MW</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{selectedZone.stats.energy.renewablePct}% Clean</span>
                    <span className="text-zinc-500">{selectedZone.stats.energy.status}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>TRAFFIC FLOW SPEED</span>
                    <Car className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-[#f4f1ea] mb-1">
                    {selectedZone.stats.traffic.speedKmh} <span className="text-xs font-normal text-zinc-400">km/h</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#e8c678] font-bold">{selectedZone.stats.traffic.congestionPct}% Vol</span>
                    <span className="text-zinc-500">{selectedZone.stats.traffic.flow}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>HYDRAULIC PRESSURE</span>
                    <Droplet className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-[#f4f1ea] mb-1">
                    {selectedZone.stats.water.pressureBar} <span className="text-xs font-normal text-zinc-400">BAR</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{selectedZone.stats.water.recycledPct}% Purity</span>
                    <span className="text-zinc-500">{selectedZone.stats.water.status}</span>
                  </div>
                </div>
              </div>

              {/* Facilities & Engineering Systems */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#d4a853]" />
                    <span>KEY MONITORED FACILITIES</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedZone.keyFacilities.map((fac, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#0d0d12] border border-white/[0.08] text-zinc-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase mb-2 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#d4a853]" />
                    <span>LEAD ENGINEERING DEPARTMENTS</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedZone.leadEngineers.map((eng, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#0d0d12] border border-[#d4a853]/30 text-[#e8c678]"
                      >
                        {eng}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#111116] border border-dashed border-white/[0.12] text-center flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
              <Target className="w-4 h-4 text-[#d4a853]" />
              <span>Click any tower, residential colony home, or sector button to inspect real-time telemetry</span>
            </div>
          )}
        </div>

        {/* Interactive Charts Panel & Vertical City Operational Alerts Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Interactive Charts Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#111116] border border-white/[0.08] flex flex-col justify-between">
          {/* Chart Tabs */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/[0.08] mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'energy', label: '24H Energy Grid' },
                  { id: 'traffic', label: 'Traffic Congestion' },
                  { id: 'air', label: 'Air Quality (AQI)' },
                  { id: 'water', label: 'Water & Recycling' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#d4a853] text-[#09090d]'
                      : 'bg-[#0d0d12] text-zinc-300 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-zinc-500">
              BUFFER: 24 HOURS
            </div>
          </div>

          {/* Tab 1: 24h Energy Grid Chart */}
          {activeTab === 'energy' && (
            <div>
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div>
                  <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">
                    Power Generation vs Load Consumption
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    87% powered by solar photovoltaics, offshore wind turbines and green hydrogen
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#d4a853]" />
                    <span className="text-zinc-300">Renewables (MW)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-zinc-300">City Consumption (MW)</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-64 relative bg-[#0d0d12] rounded-xl p-4 border border-white/[0.06] flex items-end justify-between gap-2 tabular-nums">
                {ENERGY_CHART_DATA.map((d, idx) => {
                  const renHeight = (d.renewable / 600) * 100;
                  const conHeight = (d.consumption / 600) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[28px] flex items-end justify-center gap-1 h-[80%]">
                        <div
                          className="w-1/2 bg-[#d4a853] rounded-t transition-opacity group-hover:opacity-85"
                          style={{ height: `${renHeight}%` }}
                          title={`Renewable: ${d.renewable} MW`}
                        />
                        <div
                          className="w-1/2 bg-emerald-500 rounded-t transition-opacity group-hover:opacity-85"
                          style={{ height: `${conHeight}%` }}
                          title={`Consumption: ${d.consumption} MW`}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-2">
                        {d.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Traffic Flow */}
          {activeTab === 'traffic' && (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">
                  Multi-District Traffic Density & Signal Preemption
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Autonomous C-V2X synchronization active across all five arterial zones
                </p>
              </div>

              <div className="space-y-3 tabular-nums">
                {TRAFFIC_CHART_DATA.map((zone, idx) => {
                  const isZoneActive = selectedZone && (
                    zone.zone.toLowerCase().includes(selectedZone.district.toLowerCase()) ||
                    zone.zone.toLowerCase().includes(selectedZone.shortName.toLowerCase()) ||
                    (selectedZone.id === 'zone-skyline' && zone.zone.includes('Sector 2')) ||
                    (selectedZone.id === 'zone-biomedical' && zone.zone.includes('Sector 1')) ||
                    (selectedZone.id === 'zone-harbor' && zone.zone.includes('Sector 3')) ||
                    (selectedZone.id === 'zone-agritech' && zone.zone.includes('Sector 4')) ||
                    (selectedZone.id === 'zone-grid' && zone.zone.includes('Sector 5'))
                  );
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isZoneActive
                          ? 'bg-[#17171f] border border-[#d4a853]'
                          : 'bg-[#0d0d12] border border-white/[0.06]'
                      }`}
                    >
                      <div className="sm:w-1/3">
                        <div className="text-xs font-mono font-bold text-[#f4f1ea] flex items-center gap-2">
                          <span>{zone.zone}</span>
                          {isZoneActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#d4a853] text-[#09090d] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Flow: {zone.index}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                          <span>Congestion: {zone.volume}%</span>
                          <span>Avg Speed: {zone.speed} km/h</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isZoneActive ? 'bg-[#d4a853]' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${zone.volume}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Air Quality Across Zones */}
          {activeTab === 'air' && (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">
                  Metropolitan Air Quality Index (AQI) Dispersion
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Real-time micro-spectrometer readings measuring PM2.5, PM10, and Ozone concentrations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 tabular-nums">
                {AIR_QUALITY_ZONES.map((zone, idx) => {
                  const isDistrictActive = selectedZone && (
                    zone.district === selectedZone.shortName ||
                    selectedZone.name.toLowerCase().includes(zone.district.toLowerCase()) ||
                    (selectedZone.id === 'zone-skyline' && zone.district === 'Skyline Core') ||
                    (selectedZone.id === 'zone-harbor' && zone.district === 'Harbor Marina') ||
                    (selectedZone.id === 'zone-grid' && zone.district === 'Aerospace Corridor') ||
                    (selectedZone.id === 'zone-agritech' && zone.district === 'Agri-Valley Park') ||
                    (selectedZone.id === 'zone-biomedical' && zone.district === 'Industrial Ring')
                  );
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl text-center transition-colors ${
                        isDistrictActive
                          ? 'bg-[#17171f] border border-[#d4a853]'
                          : 'bg-[#0d0d12] border border-white/[0.06]'
                      }`}
                    >
                      <div className="text-xs font-mono text-zinc-400 mb-2">
                        {zone.district}
                      </div>
                      <div className="text-3xl font-mono font-bold text-[#e8c678] mb-1">
                        {zone.aqi} <span className="text-xs font-normal text-zinc-400">AQI</span>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/12 border border-emerald-500/35 text-emerald-400">
                        {zone.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Water Pressure & Closed Loop Recycling */}
          {activeTab === 'water' && (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">
                  Aqueduct Hydraulic Pressures & Nanofiltration Recycled Flow
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Closed loop membrane purification tracking 18.4 million liters in real time
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 tabular-nums">
                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
                  <div className="text-xs font-mono text-zinc-400 mb-1">POTABLE WATER PRESSURE</div>
                  <div className="text-2xl font-mono font-bold text-[#e8c678] mb-2">4.8 BAR (NOMINAL)</div>
                  <div className="text-xs text-zinc-400">Zero pressure drop across 14 trunk aqueducts.</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
                  <div className="text-xs font-mono text-zinc-400 mb-1">RECYCLED WATER PURITY</div>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mb-2">99.8% PURITY</div>
                  <div className="text-xs text-zinc-400">Graphene nanofiltration removes 100% of micro-particulates.</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
                  <div className="text-xs font-mono text-zinc-400 mb-1">STORMWATER BUFFER RESERVE</div>
                  <div className="text-2xl font-mono font-bold text-[#f4f1ea] mb-2">18.4M LITERS (92%)</div>
                  <div className="text-xs text-zinc-400">Subterranean buffer tanks ready for monsoon overflow.</div>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Right: Live Vertical Scrolling City Operational Alerts Feed */}
          <div
            className="lg:col-span-5 p-6 rounded-2xl bg-[#111116] border border-white/[0.08] flex flex-col"
            onMouseEnter={() => setFeedHovered(true)}
            onMouseLeave={() => setFeedHovered(false)}
          >
            {/* Alerts Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08] mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#d4a853]" />
                  <h3 className="text-lg font-heading font-bold text-[#f4f1ea]">
                    City Operational Alerts
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#0d0d12] border border-white/[0.1] text-[10px] font-mono text-[#e8c678] tabular-nums">
                    {operationalAlerts.length}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Synchronized with 3D Digital Twin events & municipal telemetry
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLiveFeedActive((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                    liveFeedActive
                      ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-300'
                      : 'bg-[#0d0d12] border-white/[0.08] text-zinc-400'
                  }`}
                  title="Toggle Ambient Telemetry Feed"
                >
                  {liveFeedActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{liveFeedActive ? 'LIVE' : 'PAUSED'}</span>
                </button>
                {onClearOperationalAlerts && operationalAlerts.length > 0 && (
                  <button
                    onClick={onClearOperationalAlerts}
                    className="px-2 py-1 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.08] text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                    title="Clear All Operational Alerts"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {(
                [
                  { id: 'ALL', label: 'ALL' },
                  { id: 'CRITICAL', label: 'CRITICAL' },
                  { id: 'WARNING', label: 'WARNING' },
                  { id: 'INFO', label: 'INFO' },
                  { id: 'SUCCESS', label: 'NOMINAL' },
                ] as const
              ).map((f) => {
                const count =
                  f.id === 'ALL'
                    ? operationalAlerts.length
                    : operationalAlerts.filter((a) => a.severity === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setAlertFilter(f.id)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer tabular-nums ${
                      alertFilter === f.id
                        ? 'bg-[#d4a853] text-[#09090d]'
                        : 'bg-[#0d0d12] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
                    }`}
                  >
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Vertical Scrolling Alert Stream */}
            <div
              ref={feedScrollRef}
              className="flex-1 max-h-[340px] min-h-[280px] overflow-y-auto pr-1 space-y-2.5"
            >
              {filteredAlerts.length === 0 ? (
                <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 rounded-xl bg-[#0d0d12] border border-dashed border-white/[0.08]">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-2" />
                  <p className="text-xs font-mono text-zinc-300 font-bold">
                    No Alerts in Current Filter
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                    Interact with buildings, colony gates, weather, or 3P navigation in the 3D Twin above to stream live operational events here.
                  </p>
                </div>
              ) : (
                filteredAlerts.map((alert, idx) => {
                  const isNewest = idx === 0;
                  const accentClass =
                    alert.severity === 'CRITICAL'
                      ? 'border-l-rose-500 bg-rose-950/20'
                      : alert.severity === 'WARNING'
                        ? 'border-l-amber-400 bg-amber-950/15'
                        : alert.severity === 'SUCCESS'
                          ? 'border-l-emerald-400 bg-emerald-950/15'
                          : 'border-l-[#d4a853] bg-[#0d0d12]';

                  const badgeClass =
                    alert.severity === 'CRITICAL'
                      ? 'text-rose-300 bg-rose-500/15 border-rose-500/35'
                      : alert.severity === 'WARNING'
                        ? 'text-amber-300 bg-amber-500/15 border-amber-500/35'
                        : alert.severity === 'SUCCESS'
                          ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/35'
                          : 'text-[#e8c678] bg-[#d4a853]/15 border-[#d4a853]/35';

                  const Icon =
                    alert.severity === 'CRITICAL'
                      ? ShieldAlert
                      : alert.severity === 'WARNING'
                        ? AlertTriangle
                        : alert.severity === 'SUCCESS'
                          ? CheckCircle2
                          : Info;

                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border border-white/[0.07] border-l-[3px] transition-colors ${accentClass} ${
                        isNewest ? 'ring-1 ring-[#d4a853]/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border flex items-center gap-1 shrink-0 ${badgeClass}`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            {alert.source}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 truncate">
                            {alert.zone}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 tabular-nums shrink-0">
                          {alert.timestamp}
                        </span>
                      </div>

                      <div className="text-xs font-heading font-bold text-[#f4f1ea] leading-snug mb-1">
                        {alert.title}
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {alert.detail}
                      </p>

                      {alert.zoneId && onFocusZoneIn3D && (
                        <div className="mt-2 pt-1.5 border-t border-white/[0.05] flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">
                            Linked Sector: {alert.zoneId.replace('zone-', '')}
                          </span>
                          <button
                            onClick={() => onFocusZoneIn3D(alert.zoneId!)}
                            className="text-[10px] font-mono font-bold text-[#e8c678] hover:text-[#f8e6be] flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Focus in 3D</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Status Hint */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>{feedHovered ? 'Auto-scroll paused while inspecting' : 'Newest events pinned at top'}</span>
              <button
                onClick={scrollToTwin}
                className="text-[#d4a853] hover:text-[#e8c678] cursor-pointer flex items-center gap-1"
              >
                <span>Open 3D Twin</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
