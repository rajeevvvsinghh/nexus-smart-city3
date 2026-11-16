import React, { useState, useMemo } from 'react';
import {
  Shield,
  Home,
  Users,
  Bell,
  Camera,
  CameraOff,
  Lock,
  Unlock,
  Play,
  Square,
  Volume2,
  VolumeX,
  Eye,
  Package,
  Radio,
  DoorOpen,
  Activity,
  Car,
  Siren,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import {
  ColonyHouse,
  SecurityAlert,
  GuardOfficer,
  GateEntryRecord,
  AlertCategory,
} from '../types';
import { DEMO_SIMULATION_STEPS } from '../data/colonyData';
import { SimulatedFeedCanvas } from './SimulatedFeedCanvas';

export type ControlRoomTab = 'overview' | 'houses' | 'alerts' | 'guards' | 'gate';

interface SecurityControlRoomProps {
  houses: ColonyHouse[];
  alerts: SecurityAlert[];
  guards: GuardOfficer[];
  gateEntries: GateEntryRecord[];
  selectedHouseId: string;
  onSelectHouseId: (id: string) => void;
  gateOpen: boolean;
  onToggleGate: (open: boolean) => void;
  gateWarning: boolean;
  alarmActive: boolean;
  alarmMuted: boolean;
  onToggleAlarmMute: () => void;
  onStopAlarm: () => void;
  activeDemoStep: number | null;
  isDemoAutoPlaying: boolean;
  onStartDemoAutoPlay: () => void;
  onStopDemoAutoPlay: () => void;
  onRunDemoStep: (step: number) => void;
  onResetSimulation: () => void;
  onToggleAwayMode: (houseId: string, enabled: boolean, days?: number) => void;
  onTriggerHouseEvent: (
    houseId: string,
    eventType:
      | 'unknown-motion'
      | 'door-open'
      | 'window-open'
      | 'object-moved'
      | 'camera-tamper'
      | 'internet-fail'
      | 'internet-restore'
      | 'power-fail'
      | 'power-restore'
  ) => void;
  onAcknowledgeAlert: (alertId: string, guardId?: string) => void;
  onVerifyAlert: (alertId: string, verdict: 'HUMAN_VERIFIED_INCIDENT' | 'FALSE_ALARM_CLEARED') => void;
  onResolveAlert: (alertId: string) => void;
  onAssignGuard: (guardId: string, alertId: string | null) => void;
  onRegisterGateEntry: (entry: {
    visitorName: string;
    entryType: GateEntryRecord['entryType'];
    targetHouseId: string;
    vehicleNumber: string;
    purpose: string;
  }) => void;
  onSimulateUnauthorizedGate: () => void;
  onFocusHouseIn3D: (houseId: string) => void;
}

export const SecurityControlRoom: React.FC<SecurityControlRoomProps> = ({
  houses,
  alerts,
  guards,
  gateEntries,
  selectedHouseId,
  onSelectHouseId,
  gateOpen,
  onToggleGate,
  gateWarning,
  alarmActive,
  alarmMuted,
  onToggleAlarmMute,
  onStopAlarm,
  activeDemoStep,
  isDemoAutoPlaying,
  onStartDemoAutoPlay,
  onStopDemoAutoPlay,
  onRunDemoStep,
  onResetSimulation,
  onToggleAwayMode,
  onTriggerHouseEvent,
  onAcknowledgeAlert,
  onVerifyAlert,
  onResolveAlert,
  onAssignGuard,
  onRegisterGateEntry,
  onSimulateUnauthorizedGate,
  onFocusHouseIn3D,
}) => {
  const [activeTab, setActiveTab] = useState<ControlRoomTab>('overview');
  const [houseFilter, setHouseFilter] = useState<'ALL' | 'OCCUPIED' | 'AWAY_MODE' | 'ALERT_ACTIVE'>('ALL');
  const [alertCategoryFilter, setAlertCategoryFilter] = useState<AlertCategory | 'ALL'>('ALL');
  const [awayDaysInput, setAwayDaysInput] = useState<number>(8);

  const [visitorName, setVisitorName] = useState('');
  const [entryType, setEntryType] = useState<GateEntryRecord['entryType']>('Visitor');
  const [targetHouseId, setTargetHouseId] = useState('H-04');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('');

  const selectedHouse = useMemo(
    () => houses.find((h) => h.id === selectedHouseId) || houses[7] || houses[0],
    [houses, selectedHouseId]
  );

  const metrics = useMemo(() => {
    const totalHouses = houses.length;
    const occupiedCount = houses.filter((h) => h.status === 'OCCUPIED').length;
    const awayCount = houses.filter((h) => h.awayMode.enabled).length;
    const activeAlertsCount = alerts.filter((a) => !a.resolved).length;

    let onlineSensors = 0;
    let offlineDevices = 0;
    houses.forEach((h) => {
      onlineSensors += h.sensors.wirelessMesh === 'ONLINE' ? 6 : 4;
      if (h.devices.cameraStatus === 'OFFLINE_TAMPER') offlineDevices += 1;
      if (h.devices.internetStatus === 'OFFLINE_LOCAL_MODE') offlineDevices += 1;
      if (h.devices.powerSource === 'BATTERY_BACKUP') offlineDevices += 1;
    });

    return {
      totalHouses,
      occupiedCount,
      awayCount,
      activeAlertsCount,
      onlineSensors,
      offlineDevices,
    };
  }, [houses, alerts]);

  const filteredHouses = useMemo(() => {
    if (houseFilter === 'ALL') return houses;
    return houses.filter((h) => h.status === houseFilter);
  }, [houses, houseFilter]);

  const filteredAlerts = useMemo(() => {
    if (alertCategoryFilter === 'ALL') return alerts;
    return alerts.filter((a) => a.category === alertCategoryFilter);
  }, [alerts, alertCategoryFilter]);

  const handleGateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    onRegisterGateEntry({
      visitorName: visitorName.trim(),
      entryType,
      targetHouseId,
      vehicleNumber: vehicleNumber.trim() || 'NO-PLATE',
      purpose: purpose.trim() || `${entryType} visit to ${targetHouseId}`,
    });
    setVisitorName('');
    setVehicleNumber('');
    setPurpose('');
  };

  return (
    <section
      id="security-control"
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header + Global Alarm & Demo Simulation Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#d4a853] tracking-[0.2em] uppercase mb-2">
              <Shield className="w-4 h-4" />
              <span>SHANTI VIHAR RESIDENCY · H-01 TO H-30 · HYBRID AI SECURITY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight">
              Smart Security Control Room
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-3xl mt-2">
              Software-simulated residential security command center. Monitors 30 Indian homes with local-first sensor continuity, Home Away Mode, object presence checks, and human-verified guard response.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {alarmActive ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-950/70 border border-rose-500 text-rose-200 text-xs font-mono">
                <Siren className="w-4 h-4 text-rose-400" />
                <span className="font-bold whitespace-nowrap">ALARM ACTIVE</span>
                <button
                  onClick={onToggleAlarmMute}
                  className="px-2 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-white cursor-pointer"
                  title={alarmMuted ? 'Unmute Audible Alarm' : 'Mute Audible Alarm'}
                >
                  {alarmMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onStopAlarm}
                  className="px-2 py-1 rounded bg-[#09090d] hover:bg-zinc-800 text-zinc-200 cursor-pointer"
                >
                  Silence
                </button>
              </div>
            ) : (
              <button
                onClick={onToggleAlarmMute}
                className="px-3 py-2 rounded-lg bg-[#111116] border border-white/[0.08] hover:border-[#d4a853]/40 text-zinc-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title="Toggle simulated audible alert audio"
              >
                {alarmMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-[#d4a853]" />}
                <span>{alarmMuted ? 'Audio Muted' : 'Audio Armed'}</span>
              </button>
            )}

            {isDemoAutoPlaying ? (
              <button
                onClick={onStopDemoAutoPlay}
                className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#09090d] font-heading font-bold text-xs tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>STOP DEMO SIMULATION</span>
              </button>
            ) : (
              <button
                id="demo-simulation-btn"
                onClick={onStartDemoAutoPlay}
                className="px-5 py-2.5 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>DEMO SIMULATION</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="px-3 py-2.5 rounded-lg bg-[#111116] hover:bg-[#17171f] border border-white/[0.1] text-zinc-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              title="Reset colony security simulation to baseline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Interactive 10-Step Demo Simulation Scenario Strip */}
        <div className="mb-8 p-4 rounded-2xl bg-[#111116] border border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-xs font-mono text-[#e8c678] font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#d4a853]" />
              <span>INTERACTIVE SIMULATION SCENARIOS (H-08 8-DAY AWAY MODE SHOWCASE)</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {activeDemoStep
                ? `Active Step ${activeDemoStep}/10: ${DEMO_SIMULATION_STEPS[activeDemoStep - 1]?.title}`
                : 'Click DEMO SIMULATION for guided playback or trigger any event below'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {DEMO_SIMULATION_STEPS.map((s) => {
              const isActive = activeDemoStep === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => onRunDemoStep(s.step)}
                  title={s.description}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#d4a853]/15 border-[#d4a853] text-[#f4f1ea]'
                      : 'bg-[#0d0d12] border-white/[0.06] hover:border-[#d4a853]/35 text-zinc-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#d4a853] font-bold tabular-nums">
                    {s.step < 10 ? `0${s.step}` : '10'}
                  </div>
                  <div className="text-[11px] font-medium leading-tight mt-0.5 line-clamp-2">{s.actionLabel}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Control Room Workspace Tabs (A - E) */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-xl bg-[#111116] border border-white/[0.08] w-fit">
          {(
            [
              { id: 'overview', label: 'A. Overview', icon: Activity },
              { id: 'houses', label: 'B. House Monitoring', icon: Home },
              { id: 'alerts', label: `C. Security Alerts (${metrics.activeAlertsCount})`, icon: Bell },
              { id: 'guards', label: 'D. Guard Management', icon: Users },
              { id: 'gate', label: 'E. Colony Gate Management', icon: Lock },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#d4a853] text-[#09090d] font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-[#17171f]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB A: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl bg-[#111116] border border-white/[0.08]">
                <div className="text-[11px] font-mono text-zinc-400 mb-1">TOTAL HOUSES</div>
                <div className="text-3xl font-mono font-bold tabular-nums text-[#f4f1ea]">{metrics.totalHouses}</div>
                <div className="text-xs text-[#d4a853] mt-1">H-01 to H-30</div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-white/[0.08]">
                <div className="text-[11px] font-mono text-zinc-400 mb-1">OCCUPIED HOUSES</div>
                <div className="text-3xl font-mono font-bold tabular-nums text-emerald-400">{metrics.occupiedCount}</div>
                <div className="text-xs text-zinc-400 mt-1">Residents present</div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-[#d4a853]/30">
                <div className="text-[11px] font-mono text-zinc-400 mb-1">AWAY MODE HOUSES</div>
                <div className="text-3xl font-mono font-bold tabular-nums text-[#e8c678]">{metrics.awayCount}</div>
                <div className="text-xs text-[#d4a853] mt-1">Perimeter armed</div>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  metrics.activeAlertsCount > 0
                    ? 'bg-rose-950/35 border-rose-500/50'
                    : 'bg-[#111116] border-white/[0.08]'
                }`}
              >
                <div className="text-[11px] font-mono text-zinc-400 mb-1">ACTIVE EVENTS</div>
                <div
                  className={`text-3xl font-mono font-bold tabular-nums ${
                    metrics.activeAlertsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {metrics.activeAlertsCount}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {metrics.activeAlertsCount > 0 ? 'Requires guard action' : 'All clear'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-white/[0.08]">
                <div className="text-[11px] font-mono text-zinc-400 mb-1">ONLINE SENSORS</div>
                <div className="text-3xl font-mono font-bold tabular-nums text-emerald-400">{metrics.onlineSensors}</div>
                <div className="text-xs text-zinc-400 mt-1">Door, PIR, Object, Mesh</div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-white/[0.08]">
                <div className="text-[11px] font-mono text-zinc-400 mb-1">OFFLINE / BACKUP</div>
                <div
                  className={`text-3xl font-mono font-bold tabular-nums ${
                    metrics.offlineDevices > 0 ? 'text-amber-400' : 'text-zinc-200'
                  }`}
                >
                  {metrics.offlineDevices}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Cam / Net / AC fault</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111116] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading font-bold text-[#f4f1ea]">
                    Colony Live House Grid (H-01 – H-30)
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">Click any home to inspect</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {houses.map((h) => {
                    const isSel = h.id === selectedHouse.id;
                    const statusStyle =
                      h.status === 'ALERT_ACTIVE'
                        ? 'bg-rose-950/55 border-rose-500 text-rose-200'
                        : h.devices.cameraTamper || h.devices.powerSource === 'BATTERY_BACKUP' || h.devices.internetStatus === 'OFFLINE_LOCAL_MODE'
                          ? 'bg-amber-950/35 border-amber-500/50 text-amber-200'
                          : h.status === 'AWAY_MODE'
                            ? 'bg-[#d4a853]/12 border-[#d4a853]/45 text-[#e8c678]'
                            : 'bg-[#0d0d12] border-white/[0.08] text-zinc-200 hover:border-emerald-500/45';
                    return (
                      <button
                        key={h.id}
                        onClick={() => {
                          onSelectHouseId(h.id);
                          setActiveTab('houses');
                        }}
                        className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${statusStyle} ${
                          isSel ? 'ring-2 ring-[#d4a853]' : ''
                        }`}
                      >
                        <div className="text-xs font-mono font-bold tabular-nums">{h.id}</div>
                        <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {h.status === 'ALERT_ACTIVE'
                            ? 'ALERT'
                            : h.awayMode.enabled
                              ? `${h.awayMode.durationDays}d Away`
                              : 'Occupied'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111116] border border-white/[0.08] flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#f4f1ea] mb-2">
                    Hybrid Local-First Security Architecture
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Cameras are never treated as single points of failure. Every house runs independent Sub-GHz wireless sensors, local edge storage, and LiFePO4 battery backup. Event detection avoids facial recognition entirely and routes incidents for human guard verification.
                  </p>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                      <span className="text-zinc-300">Camera Offline Fallback</span>
                      <span className="text-emerald-400 font-bold">PIR + Door + Radar Active</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                      <span className="text-zinc-300">Internet Outage Resilience</span>
                      <span className="text-[#e8c678] font-bold">128 GB Local Buffer + Sync</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                      <span className="text-zinc-300">Emergency Exit Policy</span>
                      <span className="text-emerald-400 font-bold">Fail-Safe Unlocked Always</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onSelectHouseId('H-08');
                      setActiveTab('houses');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold cursor-pointer"
                  >
                    Inspect H-08 (8-Day Away)
                  </button>
                  <button
                    onClick={() => setActiveTab('gate')}
                    className="py-2.5 px-3 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-zinc-200 text-xs font-mono font-bold cursor-pointer"
                  >
                    Gate Controls
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: HOUSE MONITORING */}
        {activeTab === 'houses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#111116] border border-white/[0.08] flex flex-col max-h-[760px]">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(['ALL', 'OCCUPIED', 'AWAY_MODE', 'ALERT_ACTIVE'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setHouseFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer ${
                      houseFilter === f
                        ? 'bg-[#d4a853] text-[#09090d] font-bold'
                        : 'bg-[#0d0d12] text-zinc-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {f === 'ALL' ? 'All (30)' : f === 'AWAY_MODE' ? 'Away' : f === 'ALERT_ACTIVE' ? 'Alerts' : 'Occupied'}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredHouses.map((h) => {
                  const active = h.id === selectedHouse.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => onSelectHouseId(h.id)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#d4a853]/12 border-[#d4a853] text-[#f4f1ea]'
                          : 'bg-[#0d0d12] border-white/[0.06] hover:border-white/[0.15] text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-mono font-bold">
                          {h.id} <span className="text-zinc-400 font-normal">· {h.ownerName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {h.securityId} · {h.floors}-Storey {h.designType}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          h.status === 'ALERT_ACTIVE'
                            ? 'bg-rose-500/20 text-rose-300'
                            : h.awayMode.enabled
                              ? 'bg-[#d4a853]/20 text-[#e8c678]'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {h.status === 'ALERT_ACTIVE' ? 'ALERT' : h.awayMode.enabled ? `AWAY ${h.awayMode.durationDays}D` : 'OCCUPIED'}
                      </span>
                    </button>
                  );
                })}
                {filteredHouses.length === 0 && (
                  <div className="p-6 text-center text-xs font-mono text-zinc-400">
                    No houses match the selected status filter.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div className="p-5 rounded-2xl bg-[#111116] border border-[#d4a853]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="text-xs font-mono text-[#d4a853]">
                      SECURITY ID: {selectedHouse.securityId} · {selectedHouse.streetName}
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-[#f4f1ea] mt-0.5">
                      {selectedHouse.id} — {selectedHouse.ownerName}
                    </h3>
                    <div className="text-xs text-zinc-400 mt-1">
                      {selectedHouse.floors}-Storey {selectedHouse.designType} · {selectedHouse.plotAreaSqFt} sq.ft · Last Activity: {selectedHouse.awayMode.lastActivity}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onFocusHouseIn3D(selectedHouse.id)}
                      className="px-3 py-2 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-[#d4a853]/40 text-[#e8c678] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Locate in 3D</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    {selectedHouse.awayMode.enabled ? (
                      <button
                        onClick={() => onToggleAwayMode(selectedHouse.id, false)}
                        className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/45 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
                      >
                        Disable Away Mode (Owner Returned)
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={awayDaysInput}
                          onChange={(e) => setAwayDaysInput(Math.max(1, Number(e.target.value) || 1))}
                          className="w-14 px-2 py-1.5 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-xs font-mono text-white tabular-nums"
                          aria-label="Away duration in days"
                        />
                        <button
                          onClick={() => onToggleAwayMode(selectedHouse.id, true, awayDaysInput)}
                          className="px-3 py-2 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold cursor-pointer"
                        >
                          Enable Away Mode ({awayDaysInput}d)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono tabular-nums">
                  <div className="p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                    <div className="text-zinc-400 text-[10px]">OWNER STATUS</div>
                    <div className="font-bold text-[#f4f1ea] mt-0.5">
                      {selectedHouse.awayMode.enabled ? 'Out of Station' : 'At Residence'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                    <div className="text-zinc-400 text-[10px]">AWAY DURATION</div>
                    <div className="font-bold text-[#e8c678] mt-0.5">
                      {selectedHouse.awayMode.enabled ? `${selectedHouse.awayMode.durationDays} Days (Return ${selectedHouse.awayMode.returnDate})` : 'Not Active'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                    <div className="text-zinc-400 text-[10px]">SECURITY STATUS</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        selectedHouse.status === 'ALERT_ACTIVE'
                          ? 'text-rose-400'
                          : selectedHouse.awayMode.enabled
                            ? 'text-[#e8c678]'
                            : 'text-emerald-400'
                      }`}
                    >
                      {selectedHouse.status}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
                    <div className="text-zinc-400 text-[10px]">CONNECTIVITY & POWER</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {selectedHouse.devices.internetStatus === 'OFFLINE_LOCAL_MODE' ? 'LOCAL BUFFER' : 'CLOUD SYNC'} · {selectedHouse.devices.powerSource === 'BATTERY_BACKUP' ? `BATT ${selectedHouse.devices.batteryPct}%` : 'GRID AC'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 12 Smart Security Devices Grid + Simulated Live Camera Feed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-2xl bg-[#111116] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-[#f4f1ea] flex items-center gap-2">
                      {selectedHouse.devices.cameraStatus === 'ONLINE' ? (
                        <Camera className="w-4 h-4 text-[#d4a853]" />
                      ) : (
                        <CameraOff className="w-4 h-4 text-rose-400" />
                      )}
                      <span>Simulated Edge Visualization (No Facial ID)</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">DEMO FEED</span>
                  </div>

                  <SimulatedFeedCanvas house={selectedHouse} mode="live-feed" height={195} />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onTriggerHouseEvent(selectedHouse.id, 'unknown-motion')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/45 hover:bg-rose-900/55 border border-rose-500/40 text-rose-200 text-[11px] font-mono cursor-pointer"
                    >
                      Trigger Unknown Motion
                    </button>
                    <button
                      onClick={() => onTriggerHouseEvent(selectedHouse.id, 'door-open')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/45 hover:bg-rose-900/55 border border-rose-500/40 text-rose-200 text-[11px] font-mono cursor-pointer"
                    >
                      Trigger Door Opening
                    </button>
                    <button
                      onClick={() => onTriggerHouseEvent(selectedHouse.id, 'object-moved')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-950/45 hover:bg-amber-900/55 border border-amber-500/40 text-amber-200 text-[11px] font-mono cursor-pointer"
                    >
                      Simulate Object Moved
                    </button>
                    <button
                      onClick={() => onTriggerHouseEvent(selectedHouse.id, 'camera-tamper')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-950/45 hover:bg-amber-900/55 border border-amber-500/40 text-amber-200 text-[11px] font-mono cursor-pointer"
                    >
                      Disconnect Camera
                    </button>
                    <button
                      onClick={() =>
                        onTriggerHouseEvent(
                          selectedHouse.id,
                          selectedHouse.devices.internetStatus === 'CONNECTED' ? 'internet-fail' : 'internet-restore'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-[#e8c678] text-[11px] font-mono cursor-pointer"
                    >
                      {selectedHouse.devices.internetStatus === 'CONNECTED' ? 'Cut Internet Link' : 'Restore Internet & Sync'}
                    </button>
                    <button
                      onClick={() =>
                        onTriggerHouseEvent(
                          selectedHouse.id,
                          selectedHouse.devices.powerSource === 'GRID_AC' ? 'power-fail' : 'power-restore'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-amber-300 text-[11px] font-mono cursor-pointer"
                    >
                      {selectedHouse.devices.powerSource === 'GRID_AC' ? 'Cut Grid Power' : 'Restore Grid Power'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111116] border border-white/[0.08]">
                  <div className="text-xs font-mono font-bold text-[#f4f1ea] mb-3 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>12 Smart Security Devices & Local Backup</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
                    {[
                      { label: '1. Door Sensor', val: selectedHouse.sensors.doorSensor, ok: selectedHouse.sensors.doorSensor === 'CLOSED' },
                      { label: '2. Window Sensor', val: selectedHouse.sensors.windowSensor, ok: selectedHouse.sensors.windowSensor === 'CLOSED' },
                      { label: '3. PIR Motion', val: selectedHouse.sensors.motionSensor, ok: selectedHouse.sensors.motionSensor === 'IDLE' },
                      { label: '4. Object Monitor', val: selectedHouse.sensors.objectPresence, ok: selectedHouse.sensors.objectPresence === 'VERIFIED' },
                      { label: '5. Occupancy AI', val: selectedHouse.sensors.occupancyDetection, ok: selectedHouse.sensors.occupancyDetection !== 'UNKNOWN_PRESENCE' },
                      { label: '6. Wireless Mesh', val: selectedHouse.sensors.wirelessMesh, ok: selectedHouse.sensors.wirelessMesh === 'ONLINE' },
                      { label: '7. Camera Feed', val: selectedHouse.devices.cameraStatus === 'ONLINE' ? 'ONLINE' : 'CAMERA OFFLINE', ok: selectedHouse.devices.cameraStatus === 'ONLINE' },
                      { label: '8. Cam Tamper', val: selectedHouse.devices.cameraTamper ? 'TAMPER ALERT' : 'SEALED', ok: !selectedHouse.devices.cameraTamper },
                      { label: '9. Grid Power', val: selectedHouse.devices.powerSource === 'GRID_AC' ? 'AC NOMINAL' : 'GRID FAILED', ok: selectedHouse.devices.powerSource === 'GRID_AC' },
                      { label: '10. Internet Link', val: selectedHouse.devices.internetStatus === 'CONNECTED' ? 'ONLINE' : 'OFFLINE (LOCAL)', ok: selectedHouse.devices.internetStatus === 'CONNECTED' },
                      {
                        label: '11. Local Storage',
                        val:
                          selectedHouse.devices.localQueuedEvents > 0
                            ? `BUFFERED (${selectedHouse.devices.localQueuedEvents})`
                            : `${selectedHouse.devices.localUsedGb}/${selectedHouse.devices.localCapacityGb} GB`,
                        ok: true,
                      },
                      { label: '12. Battery Backup', val: `${selectedHouse.devices.batteryPct}% LiFePO4`, ok: selectedHouse.devices.batteryPct > 25 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-2 rounded-lg border ${
                          item.ok
                            ? 'bg-[#0d0d12] border-white/[0.06] text-zinc-200'
                            : 'bg-rose-950/35 border-rose-500/45 text-rose-200'
                        }`}
                      >
                        <div className="text-[10px] text-zinc-400">{item.label}</div>
                        <div className={`font-bold truncate ${item.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Object Monitoring */}
              <div className="p-5 rounded-2xl bg-[#111116] border border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-base font-heading font-bold text-[#f4f1ea] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#d4a853]" />
                      <span>Registered Object Monitoring & Before / After Comparison</span>
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Distinguishes between automated simulated AI object displacement and guard human-verified theft.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#e8c678]">
                    {selectedHouse.sensors.objectPresence !== 'VERIFIED'
                      ? 'SIMULATED OBJECT MOVEMENT DETECTED (UNVERIFIED)'
                      : 'ALL REGISTERED OBJECTS STATIONARY'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-[11px] font-mono text-emerald-400 mb-1.5">BEFORE (ARMED BASELINE)</div>
                    <SimulatedFeedCanvas
                      house={selectedHouse}
                      mode="object-before"
                      objectName={selectedHouse.registeredObjects[0]?.name || 'Safe Locker'}
                      height={165}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-amber-300 mb-1.5">
                      AFTER ({selectedHouse.sensors.objectPresence !== 'VERIFIED' ? 'DISPLACEMENT DETECTED' : 'CURRENT CHECK'})
                    </div>
                    <SimulatedFeedCanvas
                      house={selectedHouse}
                      mode={selectedHouse.sensors.objectPresence !== 'VERIFIED' ? 'object-after' : 'object-before'}
                      objectName={selectedHouse.registeredObjects[0]?.name || 'Safe Locker'}
                      height={165}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {selectedHouse.registeredObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className={`p-3 rounded-xl border text-xs ${
                        obj.status === 'MOVED_DETECTED'
                          ? 'bg-rose-950/35 border-rose-500/45'
                          : 'bg-[#0d0d12] border-white/[0.06]'
                      }`}
                    >
                      <div className="font-bold text-[#f4f1ea] truncate">{obj.name}</div>
                      <div className="text-[11px] text-zinc-400">{obj.room} · {obj.category}</div>
                      <div
                        className={`text-[11px] font-mono font-bold mt-1.5 ${
                          obj.status === 'MOVED_DETECTED' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {obj.status === 'MOVED_DETECTED' ? 'MOVED (SIMULATED DETECTION)' : 'STATIONARY'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Event History */}
              <div className="p-5 rounded-2xl bg-[#111116] border border-white/[0.08]">
                <h4 className="text-sm font-heading font-bold uppercase text-[#f4f1ea] mb-3">
                  House Security Event History ({selectedHouse.id})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedHouse.eventHistory.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-lg bg-[#0d0d12] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              evt.severity === 'CRITICAL'
                                ? 'text-rose-400'
                                : evt.severity === 'WARNING'
                                  ? 'text-amber-300'
                                  : 'text-[#e8c678]'
                            }`}
                          >
                            {evt.title}
                          </span>
                          {!evt.synced && (
                            <span className="text-[10px] font-mono text-amber-400">[LOCAL QUEUE]</span>
                          )}
                        </div>
                        <div className="text-zinc-400 mt-0.5">{evt.detail}</div>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 tabular-nums shrink-0">{evt.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: SECURITY ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  'ALL',
                  'Suspicious Movement',
                  'Door/Window Activity',
                  'Object Movement',
                  'Camera Tampering',
                  'Device Offline',
                  'Power Failure',
                  'Unauthorized Gate Entry',
                ] as const
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAlertCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${
                    alertCategoryFilter === cat
                      ? 'bg-[#d4a853] text-[#09090d] font-bold'
                      : 'bg-[#111116] border border-white/[0.08] text-zinc-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-xl border transition-colors ${
                    alert.resolved
                      ? 'bg-[#111116]/70 border-white/[0.06] opacity-75'
                      : alert.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-500/50'
                        : 'bg-amber-950/20 border-amber-500/45'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1">
                        <span
                          className={`font-bold ${
                            alert.resolved
                              ? 'text-emerald-400'
                              : alert.severity === 'CRITICAL'
                                ? 'text-rose-400'
                                : 'text-amber-300'
                          }`}
                        >
                          {alert.category}
                        </span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-[#e8c678] font-bold">
                          {alert.houseId} ({alert.securityId})
                        </span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-400 tabular-nums">{alert.timestamp}</span>
                        {alert.localBuffered && (
                          <span className="text-amber-400 font-bold">· LOCAL BUFFERED</span>
                        )}
                      </div>

                      <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">{alert.title}</h4>
                      <p className="text-xs text-zinc-300 mt-1 max-w-3xl">{alert.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono">
                        <span className="text-zinc-400">
                          Classification:{' '}
                          <strong
                            className={
                              alert.verificationState === 'HUMAN_VERIFIED_INCIDENT'
                                ? 'text-rose-400'
                                : alert.verificationState === 'FALSE_ALARM_CLEARED'
                                  ? 'text-emerald-400'
                                  : 'text-amber-300'
                            }
                          >
                            {alert.verificationState.replace(/_/g, ' ')}
                          </strong>
                        </span>
                        <span className="text-zinc-400">
                          Guard Ack:{' '}
                          <strong className={alert.acknowledgedByGuard ? 'text-emerald-400' : 'text-rose-400'}>
                            {alert.acknowledgedByGuard ? 'ACKNOWLEDGED' : 'PENDING'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {alert.houseId !== 'COLONY-GATE' && (
                        <button
                          onClick={() => {
                            onSelectHouseId(alert.houseId);
                            setActiveTab('houses');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-[#d4a853]/35 text-[#e8c678] text-xs font-mono cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Home</span>
                        </button>
                      )}
                      {!alert.acknowledgedByGuard && (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id, 'guard-1')}
                          className="px-3 py-1.5 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold cursor-pointer"
                        >
                          Guard Acknowledge
                        </button>
                      )}
                      {!alert.resolved && alert.verificationState === 'SIMULATED_DETECTION' && (
                        <>
                          <button
                            onClick={() => onVerifyAlert(alert.id, 'HUMAN_VERIFIED_INCIDENT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer"
                          >
                            Verify Theft / Intrusion
                          </button>
                          <button
                            onClick={() => onVerifyAlert(alert.id, 'FALSE_ALARM_CLEARED')}
                            className="px-3 py-1.5 rounded-lg bg-[#17171f] hover:bg-zinc-800 border border-white/[0.08] text-zinc-200 text-xs font-mono cursor-pointer"
                          >
                            Mark False Alarm
                          </button>
                        </>
                      )}
                      {!alert.resolved && (
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold cursor-pointer"
                        >
                          Resolve Incident
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredAlerts.length === 0 && (
                <div className="p-8 rounded-2xl bg-[#111116] border border-white/[0.08] text-center text-sm font-mono text-zinc-400">
                  No alerts in this category. Use the Simulation buttons above to test security events.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB D: GUARD MANAGEMENT */}
        {activeTab === 'guards' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guards.map((g) => (
                <div key={g.id} className="p-5 rounded-xl bg-[#111116] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-[#d4a853] font-bold">{g.badge}</span>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          g.status === 'RESPONDING'
                            ? 'text-rose-400'
                            : g.status === 'PATROLLING'
                              ? 'text-[#e8c678]'
                              : 'text-emerald-400'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">{g.name}</h4>
                    <div className="text-xs text-zinc-400">{g.role}</div>
                    <div className="text-xs font-mono text-zinc-300 mt-3">Station: {g.station}</div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-1 tabular-nums">
                      Last Check-In: {g.lastCheckIn}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap gap-2">
                    {alerts.some((a) => !a.resolved) ? (
                      <button
                        onClick={() => {
                          const openAlert = alerts.find((a) => !a.resolved);
                          if (openAlert) {
                            onAssignGuard(g.id, openAlert.id);
                            onAcknowledgeAlert(openAlert.id, g.id);
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold cursor-pointer"
                      >
                        Assign & Acknowledge Active Alert
                      </button>
                    ) : (
                      <button
                        onClick={() => onAssignGuard(g.id, null)}
                        className="w-full py-2 px-3 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-zinc-300 text-xs font-mono cursor-pointer"
                      >
                        Set Patrol Nominal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 p-5 rounded-xl bg-[#111116] border border-white/[0.08]">
              <h4 className="text-base font-heading font-bold uppercase text-[#f4f1ea] mb-3">
                Emergency Guard Dispatch Queue
              </h4>
              <div className="space-y-2.5">
                {alerts.slice(0, 6).map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-[#0d0d12] border border-white/[0.06] text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className={a.resolved ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {a.houseId} · {a.category}
                      </span>
                      <span className="text-zinc-500 tabular-nums">{a.timestamp}</span>
                    </div>
                    <div className="text-zinc-300 mt-1">{a.title}</div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-1">
                      Assigned: {guards.find((g) => g.id === a.assignedGuardId)?.name || 'Unassigned'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB E: COLONY GATE MANAGEMENT */}
        {activeTab === 'gate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-5">
              <div
                className={`p-5 rounded-2xl border ${
                  gateWarning
                    ? 'bg-rose-950/35 border-rose-500/60'
                    : 'bg-[#111116] border-[#d4a853]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-heading font-bold text-[#f4f1ea]">
                    Main Boom Barrier Gate
                  </h4>
                  <span
                    className={`text-xs font-mono font-bold ${
                      gateWarning ? 'text-rose-400' : gateOpen ? 'text-[#e8c678]' : 'text-emerald-400'
                    }`}
                  >
                    {gateWarning ? 'ACCESS DENIED WARNING' : gateOpen ? 'BOOM OPEN' : 'BOOM CLOSED'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mb-4">
                  Controls the 3D automated boom barrier at the Shanti Vihar Residency entrance.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onToggleGate(true)}
                    className="py-2.5 px-3 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Open Boom Gate</span>
                  </button>
                  <button
                    onClick={() => onToggleGate(false)}
                    className="py-2.5 px-3 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-zinc-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Close Boom Gate</span>
                  </button>
                </div>

                <button
                  onClick={onSimulateUnauthorizedGate}
                  className="w-full mt-2.5 py-2.5 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-200 text-xs font-mono font-bold cursor-pointer"
                >
                  Simulate Unauthorized Entry Attempt
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e1b16] border border-emerald-500/35">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-heading font-bold">
                    <DoorOpen className="w-5 h-5" />
                    <span>Independent Emergency Exit Gate</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">ALWAYS ACCESSIBLE</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Hardware-isolated fail-safe egress at East Perimeter. Main gate lockdowns and boom barrier denials never restrict emergency evacuation routes.
                </p>
              </div>

              <form
                onSubmit={handleGateFormSubmit}
                className="p-5 rounded-2xl bg-[#111116] border border-white/[0.08] space-y-3"
              >
                <h4 className="text-base font-heading font-bold text-[#f4f1ea]">
                  Visitor & Delivery Registration
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Visitor / Courier Name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                    className="col-span-2 px-3 py-2 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-xs text-white focus:border-[#d4a853] focus:outline-none"
                  />
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as GateEntryRecord['entryType'])}
                    className="px-3 py-2 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-xs text-white font-mono"
                  >
                    <option value="Visitor">Visitor</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Resident">Resident</option>
                    <option value="Unauthorized">Unapproved Test</option>
                  </select>
                  <select
                    value={targetHouseId}
                    onChange={(e) => setTargetHouseId(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-xs text-white font-mono"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} ({h.ownerName.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Vehicle Plate (e.g. DL-01-AB-1234)"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#0d0d12] border border-white/[0.1] text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Verify & Log Gate Entry
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111116] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-heading font-bold text-[#f4f1ea] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#d4a853]" />
                  <span>Colony Gate Access & Vehicle Log</span>
                </h4>
                <span className="text-xs font-mono text-zinc-400 tabular-nums">{gateEntries.length} records</span>
              </div>

              <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                {gateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      entry.authorized
                        ? 'bg-[#0d0d12] border-white/[0.06]'
                        : 'bg-rose-950/35 border-rose-500/45'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 font-mono">
                        <span className="font-bold text-[#f4f1ea]">{entry.visitorName}</span>
                        <span className="text-[#d4a853]">· {entry.entryType}</span>
                        <span className="text-zinc-400">· Target {entry.targetHouseId}</span>
                        <span className="text-zinc-400">· {entry.vehicleNumber}</span>
                      </div>
                      <div className="text-zinc-400 mt-1">{entry.purpose}</div>
                    </div>

                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <div className={`font-bold ${entry.authorized ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.gateAction.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-zinc-500">{entry.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
