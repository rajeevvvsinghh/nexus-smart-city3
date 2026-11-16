import React, { useState } from 'react';
import {
  Building2,
  Code,
  Zap,
  Radio,
  Cog,
  Brain,
  Leaf,
  FlaskConical,
  Car,
  Bot,
  HeartPulse,
  Plane,
  Sprout,
  Compass,
  ArrowRight,
  X,
  Sparkles,
  Layers,
  Share2,
} from 'lucide-react';
import { ENGINEERING_DISCIPLINES } from '../data/engineeringData';

interface EngineeringDepartmentsProps {
  selectedDeptId?: string | null;
  onCloseModal?: () => void;
  onSelectDept?: (deptId: string) => void;
  onOpenExplainThis?: (topic: string, details: string) => void;
  onClearSelectedDept?: () => void;
}

export const EngineeringDepartments: React.FC<EngineeringDepartmentsProps> = ({
  selectedDeptId: externalSelectedDeptId = null,
  onCloseModal: externalOnCloseModal,
  onSelectDept: externalOnSelectDept,
  onOpenExplainThis,
  onClearSelectedDept,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const currentSelectedId = externalSelectedDeptId !== null ? externalSelectedDeptId : internalSelectedId;
  const selectedDept = ENGINEERING_DISCIPLINES.find((d) => d.id === currentSelectedId);

  const handleSelect = (id: string) => {
    setInternalSelectedId(id);
    if (externalOnSelectDept) externalOnSelectDept(id);
  };

  const handleClose = () => {
    setInternalSelectedId(null);
    if (onClearSelectedDept) onClearSelectedDept();
    if (externalOnCloseModal) externalOnCloseModal();
  };

  const getIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Building2': return <Building2 className={className} />;
      case 'Code': return <Code className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Cog': return <Cog className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'FlaskConical': return <FlaskConical className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Bot': return <Bot className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'Plane': return <Plane className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'Compass': return <Compass className={className} />;
      default: return <Layers className={className} />;
    }
  };

  return (
    <section
      id="departments"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#09090d] text-[#f4f1ea]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            Engineering Divisions
          </p>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f8f6f0] tracking-tight mb-4 [text-wrap:balance]">
            The 14 Engineering Disciplines
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Inspect each division's domain responsibilities, architectural protocols, and collaborative dependencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {ENGINEERING_DISCIPLINES.map((dept, index) => (
            <div
              key={dept.id}
              className="group p-6 rounded-2xl bg-[#111116] hover:bg-[#16161d] border border-white/[0.08] hover:border-[#d4a853]/40 transition-colors duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-105"
                    style={{
                      backgroundColor: `${dept.color}14`,
                      border: `1px solid ${dept.color}38`,
                      color: dept.color,
                    }}
                  >
                    {getIcon(dept.iconName, 'w-5 h-5')}
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-bold text-[#f8f6f0] tracking-tight mb-2 group-hover:text-[#e8c678] transition-colors">
                  {dept.name}
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3">
                  {dept.role}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => handleSelect(dept.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#17171f] hover:bg-[#d4a853] border border-white/[0.08] hover:border-[#d4a853] text-zinc-200 hover:text-[#09090d] font-heading font-semibold text-xs tracking-wide transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Role</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Department Modal */}
        {selectedDept && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={handleClose}
          >
            <div
              className="relative w-full max-w-2xl bg-[#111116] border border-[#d4a853]/35 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-lg bg-[#1a1a22] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${selectedDept.color}1a`,
                    border: `1px solid ${selectedDept.color}55`,
                    color: selectedDept.color,
                  }}
                >
                  {getIcon(selectedDept.iconName, 'w-6 h-6')}
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#d4a853]">
                    Discipline Specification
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#f8f6f0]">
                    {selectedDept.name}
                  </h3>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Core Mandate
                </h4>
                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed bg-[#17171e] p-4 rounded-xl border border-white/[0.06]">
                  {selectedDept.description}
                </p>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#d4a853] mb-2">
                  Smart-City Integration
                </h4>
                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed bg-[#17171e] p-4 rounded-xl border border-[#d4a853]/20">
                  {selectedDept.smartCityContribution}
                </p>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Technologies & Protocols
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-300">
                  {selectedDept.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#17171f] border border-white/[0.08] text-[#e8c678]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Collaborative Partners
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDept.collaboratesWith.map((partner, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#17171f] border border-white/[0.08] text-zinc-200 text-xs flex items-center gap-1.5"
                    >
                      <Share2 className="w-3 h-3 text-[#d4a853]" />
                      {partner}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    if (onOpenExplainThis) {
                      onOpenExplainThis(selectedDept.name, selectedDept.smartCityContribution);
                    } else {
                      document.getElementById('systems')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Present Role Summary</span>
                </button>
                <button
                  onClick={handleClose}
                  className="py-3 px-6 rounded-xl bg-[#1a1a22] hover:bg-[#24242f] text-zinc-200 font-heading text-xs tracking-wide cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
