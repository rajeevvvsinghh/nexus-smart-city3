import React, { useState } from 'react';
import { ArrowRight, Radio, CheckCircle2 } from 'lucide-react';
import { COLLABORATION_LINKS, ENGINEERING_DISCIPLINES } from '../data/engineeringData';

interface EngineeringCollaborationProps {
  onSelectDepartment: (deptId: string) => void;
}

export const EngineeringCollaboration: React.FC<EngineeringCollaborationProps> = ({
  onSelectDepartment,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('cse');

  const activeDept = ENGINEERING_DISCIPLINES.find((d) => d.id === activeNodeId) || ENGINEERING_DISCIPLINES[1];
  const activeLink = COLLABORATION_LINKS.find((l) => l.source === activeNodeId) || COLLABORATION_LINKS[3];

  const total = ENGINEERING_DISCIPLINES.length;
  const radius = 180;
  const centerX = 250;
  const centerY = 250;

  const nodes = ENGINEERING_DISCIPLINES.map((dept, index) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return {
      ...dept,
      x,
      y,
      angle,
    };
  });

  return (
    <section
      id="collaboration"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0c0c11] border-t border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            Interconnectivity Graph
          </p>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-4 [text-wrap:balance]">
            Engineering Collaboration Network
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Select any engineering node around the ring to inspect its real-time data and infrastructure exchange with the central NEXUS hub.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Radial SVG Topology */}
          <div className="lg:col-span-7 flex justify-center items-center">
            <div className="relative w-full max-w-[540px] aspect-square p-2 bg-[#111116] rounded-3xl border border-white/[0.08] flex items-center justify-center">
              <div className="absolute inset-5 rounded-full border border-[#d4a853]/12 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-white/[0.05] pointer-events-none" />

              <svg viewBox="0 0 500 500" className="w-full h-full select-none">
                <defs>
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#d4a853" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#d4a853" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#09090d" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {nodes.map((node) => {
                  const isSelected = node.id === activeNodeId;
                  return (
                    <g key={node.id}>
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={node.x}
                        y2={node.y}
                        stroke={isSelected ? '#e8c678' : 'rgba(212, 168, 83, 0.16)'}
                        strokeWidth={isSelected ? 2.2 : 1}
                        strokeDasharray={isSelected ? 'none' : '4 4'}
                      />
                      {isSelected && (
                        <circle r="4" fill="#f6e3b4">
                          <animateMotion
                            path={`M ${centerX} ${centerY} L ${node.x} ${node.y}`}
                            dur="1.6s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {nodes.map((node, i) => {
                  const nextNode = nodes[(i + 1) % nodes.length];
                  return (
                    <line
                      key={`inter-${i}`}
                      x1={node.x}
                      y1={node.y}
                      x2={nextNode.x}
                      y2={nextNode.y}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Center Core */}
                <g className="cursor-pointer" onClick={() => onSelectDepartment('cse')}>
                  <circle cx={centerX} cy={centerY} r="56" fill="url(#centerGlow)" />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="44"
                    fill="#111116"
                    stroke="#d4a853"
                    strokeWidth="2"
                  />
                  <text
                    x={centerX}
                    y={centerY - 7}
                    textAnchor="middle"
                    fill="#f8f6f0"
                    fontSize="13"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="bold"
                    letterSpacing="1.5"
                  >
                    NEXUS
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 9}
                    textAnchor="middle"
                    fill="#d4a853"
                    fontSize="9"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="bold"
                    letterSpacing="1.8"
                  >
                    CORE HUB
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 21}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    UNIFIED CITY OS
                  </text>
                </g>

                {nodes.map((node) => {
                  const isSelected = node.id === activeNodeId;
                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer group"
                      onClick={() => setActiveNodeId(node.id)}
                    >
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill="none"
                          stroke="#d4a853"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill={isSelected ? '#231e14' : '#15151d'}
                        stroke={isSelected ? '#e8c678' : 'rgba(212, 168, 83, 0.35)'}
                        strokeWidth={isSelected ? 2 : 1}
                      />

                      <text
                        x={node.x}
                        y={node.y + 3.5}
                        textAnchor="middle"
                        fill={isSelected ? '#f8f6f0' : '#a1a1aa'}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {node.shortName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Active Channel Inspector */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111116] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#d4a853]">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Channel: {activeDept.shortName}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Live Pipeline</span>
              </div>

              <h3 className="text-2xl font-heading font-bold text-[#f8f6f0] mb-2">
                {activeDept.name}
              </h3>

              <div className="text-xs font-mono text-zinc-400 mb-5">
                Direct Flow ·{' '}
                <span className="text-[#e8c678] font-semibold">
                  {activeLink.source.toUpperCase()} → {activeLink.target}
                </span>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed mb-6 bg-[#17171e] p-4 rounded-xl border border-white/[0.06]">
                {activeLink.desc}. {activeDept.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                  Direct Collaborators
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeDept.collaboratesWith.map((partner, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#17171e] border border-white/[0.06] text-xs text-zinc-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a853] shrink-0" />
                      <span className="truncate">{partner}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectDepartment(activeDept.id)}
                className="w-full py-3 px-4 rounded-xl bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Open Full {activeDept.shortName} Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
