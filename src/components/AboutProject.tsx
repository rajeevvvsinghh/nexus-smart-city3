import React from 'react';
import {
  Code2,
  GraduationCap,
  Layers,
  Users,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <section
      id="about"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ENGINEERING DAY COMMEMORATION PROJECT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight mb-4">
            About the NEXUS Initiative
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Created to demonstrate the vital power of interdisciplinary engineering synergy in architecting 21st-century smart metropolitan infrastructure.
          </p>
        </div>

        {/* Central Motto Banner */}
        <div className="relative p-8 sm:p-12 rounded-2xl bg-[#111116] border border-[#d4a853]/30 text-center mb-14 overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] block mb-3">
              CENTRAL ENGINEERING MANIFESTO
            </span>
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight leading-tight mb-4">
              &ldquo;One City. Many Engineers. One Intelligent Future.&rdquo;
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              No single engineering branch can construct a smart metropolis in isolation. When Civil physical structures unite with CSE data intelligence, Electrical microgrids, ECE micro-sensors, Mechanical kinetics, and AI optimization, a city ascends from passive concrete into an adaptive, living organism.
            </p>
          </div>
        </div>

        {/* Team Members & Tech Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Team Cards (Left Column) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4a853] uppercase tracking-wider mb-4">
              <Users className="w-4 h-4" />
              <span>PROJECT LEADERSHIP & DEVELOPMENT TEAM</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Member 1: Rajeev Singh Rajpoot */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-white/[0.08] hover:border-[#d4a853]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#d4a853]/12 border border-[#d4a853]/35 flex items-center justify-center text-[#e8c678] font-mono text-lg font-bold mb-4">
                  RS
                </div>
                <h4 className="text-xl font-heading font-bold text-[#f4f1ea] mb-1">
                  Rajeev Singh Rajpoot
                </h4>
                <div className="text-xs font-mono text-[#d4a853] font-bold mb-1">
                  Lead Developer · B.Tech CSE
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mb-4">
                  Computer Science & Engineering
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed border-t border-white/[0.06] pt-3">
                  Architected the full-stack system architecture, Three.js 3D digital twin spatial scene, telemetry data structures, and interactive cross-department graph.
                </p>
              </div>

              {/* Member 2: Rahul Ahirwar */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-white/[0.08] hover:border-[#d4a853]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/[0.12] flex items-center justify-center text-zinc-200 font-mono text-lg font-bold mb-4">
                  RA
                </div>
                <h4 className="text-xl font-heading font-bold text-[#f4f1ea] mb-1">
                  Rahul Ahirwar
                </h4>
                <div className="text-xs font-mono text-zinc-300 font-bold mb-1">
                  Team Member · B.Tech CSE
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mb-4">
                  Computer Science & Engineering
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed border-t border-white/[0.06] pt-3">
                  Contributed to interdisciplinary engineering data mapping, municipal crisis simulation workflows, presentation slide decks, and UX validation.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications (Right Column) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4a853] uppercase tracking-wider mb-4">
              <Code2 className="w-4 h-4" />
              <span>PRODUCTION TECH STACK</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#111116] border border-white/[0.08] space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#d4a853]/12 text-[#d4a853] shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#f4f1ea]">Three.js & cannon-es Engine</div>
                  <div className="text-xs text-zinc-400">
                    High-performance 3D spatial rendering, collision physics, third-person navigation, and object raycasting.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200 shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#f4f1ea]">React 19 & TypeScript</div>
                  <div className="text-xs text-zinc-400">
                    Component-based reactive state flow with strict type safety across all 14 engineering disciplines.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#d4a853]/12 text-[#d4a853] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#f4f1ea]">Tailwind CSS Luxury Architecture</div>
                  <div className="text-xs text-zinc-400">
                    Hardware-friendly Sovereign Obsidian surfaces without expensive blur compositing overhead.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/12 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#f4f1ea]">Zero External AI Dependencies</div>
                  <div className="text-xs text-zinc-400">
                    Deterministic municipal & hybrid home-security engines run locally in browser without API keys or facial recognition.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple VS Code & Local Setup Instructions */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#111116] border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4a853] uppercase tracking-wider font-bold">
              <Terminal className="w-4 h-4" />
              <span>VS CODE LOCAL RUN GUIDE (NODE.JS 18+)</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Runs at http://localhost:3000</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
              <div className="text-zinc-400 mb-1.5">1. Install Dependencies</div>
              <code className="text-[#e8c678] block select-all">npm install</code>
            </div>
            <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
              <div className="text-zinc-400 mb-1.5">2. Start Development Server</div>
              <code className="text-emerald-300 block select-all">npm run dev</code>
            </div>
            <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
              <div className="text-zinc-400 mb-1.5">3. Production Build</div>
              <code className="text-zinc-200 block select-all">npm run build</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
