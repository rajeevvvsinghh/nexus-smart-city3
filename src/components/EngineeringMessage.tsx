import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ENGINEERING_CORE_SUMMARY, ENGINEERING_DISCIPLINES } from '../data/engineeringData';

interface EngineeringMessageProps {
  onSelectDepartment?: (deptId: string) => void;
}

export const EngineeringMessage: React.FC<EngineeringMessageProps> = ({
  onSelectDepartment = () => {
    document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' });
  },
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section
      id="engineering"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0c0c11] border-t border-b border-white/[0.06] overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            Interdisciplinary Convergence
          </p>

          <h2
            id="engineering-message-title"
            className="text-3xl sm:text-5xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-5 [text-wrap:balance]"
          >
            A smart city is not built by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f6e3b4] via-[#d4a853] to-[#b58732]">
              one engineer.
            </span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            No single discipline holds the complete blueprint for an autonomous metropolis. Urban resilience emerges when civil structure, electrical grids, wireless telemetry, software intelligence, and environmental systems operate as one unified body.
          </p>
        </div>

        {/* 14 Disciplines Synthesis Panel */}
        <div
          id="disciplines-formula"
          className="mb-16 p-6 sm:p-8 rounded-2xl bg-[#111116] border border-white/[0.08]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08] mb-6">
            <span className="text-xs sm:text-sm font-mono text-[#e8c678] font-medium">
              The 14-Discipline Urban Equation
            </span>
            <span className="text-xs font-mono text-emerald-400">All Systems Synchronized</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-2">
            {ENGINEERING_DISCIPLINES.map((dept, index) => {
              const isLast = index === ENGINEERING_DISCIPLINES.length - 1;
              const isHovered = hoveredIdx === index;
              return (
                <React.Fragment key={dept.id}>
                  <button
                    onClick={() => onSelectDepartment(dept.id)}
                    onMouseEnter={() => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`group px-3.5 py-2 rounded-lg border transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isHovered
                        ? 'bg-[#d4a853]/18 border-[#d4a853] text-[#f8f6f0]'
                        : 'bg-[#17171e] border-white/[0.08] text-zinc-200 hover:border-[#d4a853]/50'
                    }`}
                    title={`Explore ${dept.name}`}
                  >
                    <span className="text-xs font-mono font-semibold">{dept.shortName}</span>
                    <ArrowRight className="w-3 h-3 text-[#d4a853] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  </button>
                  {!isLast && (
                    <span className="text-zinc-600 font-semibold text-base select-none px-0.5">+</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="text-center mt-6 pt-5 border-t border-white/[0.06]">
            <span className="text-xs sm:text-sm font-mono text-zinc-400 tracking-wider">
              = <span className="text-[#e8c678] font-semibold">NEXUS Smart City Platform</span>
            </span>
          </div>
        </div>

        {/* Inter-Dependency Thesis */}
        <div className="text-center mb-14">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-2">
            "Every system depends on another system."
          </h3>
          <div className="w-24 h-px bg-[#d4a853]/60 mx-auto my-3" />
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            When civil roadbeds settle, optical trunking breaks. When power grids falter, telemetry goes dark. When edge sensors fail, autonomous mobility loses awareness.
          </p>
        </div>

        {/* 14 Core Discipline Contributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ENGINEERING_CORE_SUMMARY.map((item, index) => {
            const matchedDept = ENGINEERING_DISCIPLINES.find(
              (d) =>
                d.shortName.toLowerCase() === item.discipline.toLowerCase() ||
                d.name.toLowerCase().includes(item.discipline.toLowerCase())
            );

            return (
              <div
                key={index}
                onClick={() => matchedDept && onSelectDepartment(matchedDept.id)}
                className="group p-5 rounded-xl bg-[#111116] hover:bg-[#16161d] border border-white/[0.08] hover:border-[#d4a853]/40 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5 text-xs font-mono">
                    <span className="font-semibold text-[#e8c678]">{item.discipline}</span>
                    <span className="text-zinc-500">0{index + 1}</span>
                  </div>
                  <div className="text-zinc-200 text-sm leading-relaxed">
                    <span className="text-[#f8f6f0] font-semibold">{item.verb}</span>{' '}
                    <span className="text-zinc-400">{item.target}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 group-hover:text-[#e8c678] transition-colors">
                  <span>View Specification</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthesis Footer Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#111116] border border-[#d4a853]/25 text-center">
          <p className="text-xl sm:text-2xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-1">
            One City. Many Engineers. One Intelligent Future.
          </p>
          <p className="text-xs font-mono text-[#d4a853]">
            Engineering Day 2026 · Cross-Disciplinary Showcase
          </p>
        </div>
      </div>
    </section>
  );
};
