import React from 'react';
import {
  Leaf,
  Sun,
  Droplet,
  Recycle,
  TrendingUp,
} from 'lucide-react';
import { SUSTAINABILITY_METRICS } from '../data/dashboardData';

export const SustainabilitySection: React.FC = () => {
  return (
    <section
      id="sustainability"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-emerald-400 mb-3">
            <Leaf className="w-3.5 h-3.5" />
            <span>CIRCULAR METABOLISM & REGENERATIVE SYSTEMS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight mb-4">
            Sustainability & Net-Zero 2035
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            A truly intelligent city generates zero irreversible waste. NEXUS models energy, water, and organic matter as continuous closed regenerative cycles.
          </p>
        </div>

        {/* 5 Primary Sustainability Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {SUSTAINABILITY_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#111116] hover:bg-[#17171f] border border-white/[0.08] hover:border-[#d4a853]/35 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                  {metric.title}
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-[#e8c678] tabular-nums mb-2">
                  {metric.value}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {metric.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Closed-Loop Circular Infrastructure Diagram */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111116] border border-white/[0.08]">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[#e8c678]">
              <Recycle className="w-4 h-4 text-emerald-400" />
              <span>CLOSED-LOOP URBAN ECOLOGY</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">NET-POSITIVE FOOTPRINT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Solar & Wind Generation */}
            <div className="p-5 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-[#d4a853]/12 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] mb-3">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="text-base font-heading font-bold text-[#f4f1ea] mb-1.5">
                Clean Generation & Hydrogen Buffer
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rooftop solar and offshore wind supply daytime baseline. Excess energy electrolyzes water into clean hydrogen fuel, stored in subterranean caverns for night dispatch.
              </p>
            </div>

            {/* Step 2: Greywater & Nanofiltration */}
            <div className="p-5 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/[0.1] flex items-center justify-center text-zinc-200 mb-3">
                <Droplet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-heading font-bold text-[#f4f1ea] mb-1.5">
                Nanofiltration Water Reclamation
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                92% of municipal wastewater is purified via multi-stage graphene membranes, feeding vertical aeroponic towers and returning drinking water directly into municipal aqueducts.
              </p>
            </div>

            {/* Step 3: Pneumatic Waste & Biomethane */}
            <div className="p-5 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <Recycle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-heading font-bold text-[#f4f1ea] mb-1.5">
                Subterranean Waste-to-Biogas
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pneumatic vacuum chutes ingest refuse at 70 km/h. Automated robotic arms sort metals and plastics, while organic matter bio-digests into 14 MW of clean grid electricity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
