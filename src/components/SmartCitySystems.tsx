import React, { useState } from 'react';
import {
  Building,
  TrafficCone,
  Zap,
  Droplets,
  Trash2,
  HeartPulse,
  Sprout,
  ShieldAlert,
  Sun,
  Train,
  Cpu,
  Server,
  ArrowRight,
  Sparkles,
  X,
  Layers,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { SMART_CITY_SYSTEMS } from '../data/systemsData';
import { SmartSystem } from '../types';

interface SmartCitySystemsProps {
  onOpenExplainThis: (title: string, details: string) => void;
}

export const SmartCitySystems: React.FC<SmartCitySystemsProps> = () => {
  const [selectedSystem, setSelectedSystem] = useState<SmartSystem | null>(null);
  const [explainSystem, setExplainSystem] = useState<SmartSystem | null>(null);

  const getSystemIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Building': return <Building className={className} />;
      case 'TrafficCone': return <TrafficCone className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Droplets': return <Droplets className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Train': return <Train className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Server': return <Server className={className} />;
      default: return <Layers className={className} />;
    }
  };

  return (
    <section
      id="systems"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            Municipal Infrastructure
          </p>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-4 [text-wrap:balance]">
            12 Smart City Systems
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Select any municipal subsystem to inspect its cross-disciplinary engineering stack, hardware standards, and measurable urban impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SMART_CITY_SYSTEMS.map((system) => (
            <div
              key={system.id}
              className="group p-6 rounded-2xl bg-[#111116] hover:bg-[#16161d] border border-white/[0.08] hover:border-[#d4a853]/40 transition-colors duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#181820] border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] transition-transform duration-150 group-hover:scale-105">
                    {getSystemIcon(system.iconName, 'w-5 h-5')}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {system.category}
                  </span>
                </div>

                <h3 className="text-xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-2 group-hover:text-[#e8c678] transition-colors">
                  {system.title}
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                  {system.description}
                </p>

                <div className="mb-4 text-xs text-zinc-400">
                  <span className="font-mono text-[11px] text-zinc-500 block mb-1">Engineers Involved</span>
                  <span className="text-zinc-300">
                    {system.engineersInvolved.slice(0, 3).join(' · ')}
                    {system.engineersInvolved.length > 3 ? ` · +${system.engineersInvolved.length - 3}` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2">
                <button
                  onClick={() => setSelectedSystem(system)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#17171f] hover:bg-[#d4a853] border border-white/[0.08] hover:border-[#d4a853] text-zinc-200 hover:text-[#09090d] font-heading font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View System</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setExplainSystem(system)}
                  className="py-2.5 px-3 rounded-xl bg-[#17171f] hover:bg-[#22222c] border border-[#d4a853]/25 text-[#e8c678] font-heading font-semibold text-xs tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Show Presentation Flow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Brief</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed System Modal */}
        {selectedSystem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedSystem(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-[#111116] border border-[#d4a853]/35 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSystem(null)}
                className="absolute top-5 right-5 p-2 rounded-lg bg-[#1a1a22] text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#181820] border border-[#d4a853]/35 flex items-center justify-center text-[#d4a853]">
                  {getSystemIcon(selectedSystem.iconName, 'w-7 h-7')}
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#d4a853]">
                    {selectedSystem.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#f8f6f0]">
                    {selectedSystem.title}
                  </h3>
                </div>
              </div>

              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed bg-[#17171e] p-4 rounded-xl border border-white/[0.06] mb-6">
                {selectedSystem.description}
              </p>

              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Collaborating Disciplines
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSystem.engineersInvolved.map((eng, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#17171f] border border-white/[0.08] text-[#e8c678] text-xs font-mono flex items-center gap-1.5"
                    >
                      <Users className="w-3 h-3 text-[#d4a853]" />
                      {eng}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Core Technologies & Standards
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSystem.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#17171f] border border-white/[0.08] text-zinc-200 text-xs font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
                  Citizen & Sustainability Benefits
                </h4>
                <div className="space-y-2">
                  {selectedSystem.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    const sys = selectedSystem;
                    setSelectedSystem(null);
                    setExplainSystem(sys);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Presentation Flow</span>
                </button>
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="py-3 px-6 rounded-xl bg-[#1a1a22] hover:bg-[#24242f] text-zinc-200 text-xs font-heading cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Presentation Brief Modal */}
        {explainSystem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
            onClick={() => setExplainSystem(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-[#111116] border border-[#d4a853]/40 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExplainSystem(null)}
                className="absolute top-5 right-5 p-2 rounded-lg bg-[#1a1a22] text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-xs font-mono text-[#d4a853] uppercase tracking-widest mb-2">
                System Architecture Brief
              </p>

              <h3 className="text-3xl font-heading font-bold text-[#f8f6f0] mb-2">
                How {explainSystem.title} Works
              </h3>

              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                {explainSystem.explanation.overview}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                  Discipline-by-Discipline Execution Flow
                </h4>
                <div className="space-y-3">
                  {explainSystem.explanation.flow.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#17171e] border border-white/[0.06] flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#d4a853]/15 text-[#e8c678] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#e8c678] mb-0.5">
                          {step.discipline}
                        </div>
                        <div className="text-zinc-200 text-xs sm:text-sm">{step.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#17171e] border border-[#d4a853]/25 mb-6">
                <div className="text-xs font-mono uppercase text-[#d4a853] font-semibold mb-1">
                  Key Outcome
                </div>
                <div className="text-sm sm:text-base text-[#f8f6f0] font-medium">
                  {explainSystem.explanation.realImpact}
                </div>
              </div>

              <button
                onClick={() => setExplainSystem(null)}
                className="w-full py-3 rounded-xl bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wide transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
