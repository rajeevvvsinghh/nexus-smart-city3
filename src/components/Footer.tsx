import React from 'react';
import { Building2, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenPresentation: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPresentation }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#07070a] text-[#f4f1ea] border-t border-white/[0.08] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 pb-12 border-b border-white/[0.08]">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#14141b] border border-[#d4a853]/35 flex items-center justify-center text-[#d4a853]">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-heading font-bold tracking-tight text-white">
                NEXUS <span className="text-[#d4a853]">SMART CITY</span>
              </span>
            </div>

            <p className="text-sm font-heading font-semibold text-[#e8c678] tracking-wide mb-3">
              "One City. Many Engineers. One Intelligent Future."
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Engineering Day initiative demonstrating how fourteen engineering disciplines converge inside a real-time 3D digital twin and smart residential security estate.
            </p>
          </div>

          {/* Platform Sections */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d4a853] mb-4">
              Platform Sections
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a href="#digital-twin" className="hover:text-[#e8c678] transition-colors">
                  3D Spatial Digital Twin
                </a>
              </li>
              <li>
                <a href="#systems" className="hover:text-[#e8c678] transition-colors">
                  12 Smart City Systems
                </a>
              </li>
              <li>
                <a href="#dashboard" className="hover:text-[#e8c678] transition-colors">
                  City Operations Dashboard
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#e8c678] transition-colors">
                  About Project & Team
                </a>
              </li>
            </ul>
          </div>

          {/* Showcase */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d4a853] mb-4">
              Showcase
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a href="#zone-telemetry-section" className="hover:text-[#e8c678] transition-colors">
                  Zone Telemetry Feed
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenPresentation}
                  className="text-left text-[#d4a853] hover:text-[#e8c678] transition-colors cursor-pointer"
                >
                  Launch Presentation Slides
                </button>
              </li>
            </ul>
          </div>

          {/* Project Team */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d4a853] mb-4">
              Project Team
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="font-semibold text-white">Rajeev Singh Rajpoot</div>
                <div className="text-[11px] font-mono text-[#d4a853]">Lead Developer · B.Tech CSE</div>
              </div>
              <div>
                <div className="font-semibold text-white">Rahul Ahirwar</div>
                <div className="text-[11px] font-mono text-zinc-400">Team Member · B.Tech CSE</div>
              </div>
              <div className="pt-1 text-[11px] text-zinc-500">
                Computer Science & Engineering
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 NEXUS SMART CITY · Engineering Day Showcase
          </div>

          <button
            onClick={scrollToTop}
            className="px-3 py-2 rounded-lg bg-[#14141b] border border-white/10 text-zinc-300 hover:text-[#e8c678] hover:border-[#d4a853]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Back to Top"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
