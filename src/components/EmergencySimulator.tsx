import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  Flame,
  Droplets,
  Zap,
  Car,
  Wind,
  Radio,
  Check,
} from 'lucide-react';
import { EMERGENCY_SCENARIOS } from '../data/emergencyData';
import { EmergencyScenario } from '../types';

interface EmergencySimulatorProps {
  onScenarioChange: (scenario: EmergencyScenario) => void;
  currentScenarioId: string;
}

export const EmergencySimulator: React.FC<EmergencySimulatorProps> = ({
  onScenarioChange,
  currentScenarioId
}) => {
  const currentScenario = EMERGENCY_SCENARIOS.find(s => s.id === currentScenarioId) || EMERGENCY_SCENARIOS[0];

  const getScenarioIcon = (id: string, className = 'w-4 h-4') => {
    switch (id) {
      case 'flood': return <Droplets className={className} />;
      case 'fire': return <Flame className={className} />;
      case 'power-failure': return <Zap className={className} />;
      case 'traffic-accident': return <Car className={className} />;
      case 'water-leak': return <Droplets className={className} />;
      case 'air-pollution': return <Wind className={className} />;
      default: return <CheckCircle2 className={className} />;
    }
  };

  return (
    <section
      id="simulator"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b10] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>INCIDENT COMMAND MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight mb-4">
            City Response Simulator
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Trigger simulated crisis scenarios to observe automated telemetry deviations, cross-disciplinary mobilization, and the 4-stage disaster mitigation protocol.
          </p>
        </div>

        {/* 7 Scenario Trigger Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {EMERGENCY_SCENARIOS.map((scen) => {
            const isActive = scen.id === currentScenarioId;
            const isNormal = scen.id === 'normal';
            return (
              <button
                key={scen.id}
                onClick={() => onScenarioChange(scen)}
                className={`px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? isNormal
                      ? 'bg-emerald-500 text-[#09090d]'
                      : 'bg-rose-600 text-white'
                    : 'bg-[#111116] text-zinc-300 hover:text-[#e8c678] border border-white/[0.08] hover:border-[#d4a853]/40'
                }`}
              >
                {getScenarioIcon(scen.id)}
                <span>{scen.name.replace(/ \(.*\)/, '')}</span>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Detailed Dashboard Box */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border transition-colors bg-[#111116] ${
            currentScenario.id === 'normal'
              ? 'border-[#d4a853]/30'
              : 'border-rose-500/50'
          }`}
        >
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                    currentScenario.level === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/35'
                      : currentScenario.level === 'HIGH'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                      : currentScenario.level === 'ELEVATED'
                      ? 'bg-[#d4a853]/15 text-[#e8c678] border border-[#d4a853]/35'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35'
                  }`}
                >
                  DEFCON: {currentScenario.level}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  SECTOR AFFECTED: {currentScenario.affectedZones[0]}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#f4f1ea]">
                {currentScenario.name}
              </h3>
            </div>

            {/* Quick Live Impact Telemetry */}
            <div className="flex items-center gap-3 tabular-nums">
              <div className="px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.08] text-center">
                <div className="text-[10px] font-mono text-zinc-400">AQI</div>
                <div
                  className={`text-sm font-mono font-bold ${
                    currentScenario.telemetryImpact.aqi > 120 ? 'text-rose-400' : 'text-[#e8c678]'
                  }`}
                >
                  {currentScenario.telemetryImpact.aqi}
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.08] text-center">
                <div className="text-[10px] font-mono text-zinc-400">TRAFFIC</div>
                <div
                  className={`text-sm font-mono font-bold ${
                    currentScenario.telemetryImpact.trafficCongestion > 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {currentScenario.telemetryImpact.trafficCongestion}% CONG.
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.08] text-center">
                <div className="text-[10px] font-mono text-zinc-400">WATER</div>
                <div className="text-sm font-mono font-bold text-zinc-200">
                  {currentScenario.telemetryImpact.waterPressure}% RES.
                </div>
              </div>
            </div>
          </div>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8 bg-[#17171f] p-4 rounded-xl border border-white/[0.06]">
            {currentScenario.description}
          </p>

          {/* Responding Engineering Teams */}
          <div className="mb-10">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d4a853] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>MOBILIZED ENGINEERING DIVISIONS</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentScenario.respondingTeams.map((team, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-[#d4a853]/25 text-[#e8c678] text-xs font-mono font-medium flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#d4a853]" />
                  <span>{team}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Stage Response Workflow */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
              THE 4-STAGE INCIDENT LIFECYCLE
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Detection */}
              <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#e8c678]">01. DETECTION</span>
                    <Radio className="w-4 h-4 text-[#d4a853]" />
                  </div>
                  <div className="text-sm font-heading font-bold text-[#f4f1ea] mb-1.5">
                    {currentScenario.stages.detection.title}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {currentScenario.stages.detection.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#d4a853]">
                  {currentScenario.stages.detection.disciplines.join(' · ')}
                </div>
              </div>

              {/* 2. Analysis */}
              <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-zinc-200">02. ANALYSIS</span>
                    <Activity className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="text-sm font-heading font-bold text-[#f4f1ea] mb-1.5">
                    {currentScenario.stages.analysis.title}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {currentScenario.stages.analysis.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-zinc-300">
                  {currentScenario.stages.analysis.disciplines.join(' · ')}
                </div>
              </div>

              {/* 3. Response */}
              <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400">03. RESPONSE</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-heading font-bold text-[#f4f1ea] mb-1.5">
                    {currentScenario.stages.response.title}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {currentScenario.stages.response.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-amber-300">
                  {currentScenario.stages.response.disciplines.join(' · ')}
                </div>
              </div>

              {/* 4. Recovery */}
              <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">04. RECOVERY</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-heading font-bold text-[#f4f1ea] mb-1.5">
                    {currentScenario.stages.recovery.title}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {currentScenario.stages.recovery.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-300">
                  {currentScenario.stages.recovery.disciplines.join(' · ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
