import React, { useState } from 'react';
import {
  Camera,
  X,
  ArrowRight
} from 'lucide-react';
import { GALLERY_ITEMS } from '../data/galleryData';
import { GalleryItem } from '../types';

export const CityGallery: React.FC = () => {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  return (
    <section
      id="gallery"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b10] text-[#f4f1ea] border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#d4a853] mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>METROPOLITAN VISUAL ARCHIVE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#f4f1ea] tracking-tight mb-4">
            City Architecture Gallery
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Architectural studies of key engineering infrastructures across the NEXUS metropolitan district.
          </p>
        </div>

        {/* 6 Gallery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-[#111116] border border-white/[0.08] hover:border-[#d4a853]/45 transition-colors cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with Gradient Overlay */}
              <div className="relative h-52 w-full overflow-hidden bg-[#17171f]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-[#111116]/30 to-transparent" />

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#09090d]/90 text-[#e8c678] text-[10px] font-mono border border-[#d4a853]/30 uppercase">
                  {item.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-heading font-bold text-[#f4f1ea] mb-2 group-hover:text-[#e8c678] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {item.engineers.slice(0, 2).map((eng, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#0d0d12] text-zinc-300 text-[10px] font-mono border border-white/[0.08]"
                      >
                        {eng}
                      </span>
                    ))}
                  </div>
                  <div className="text-[#d4a853] group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Expanded Image & Architecture Deep-Dive */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="relative w-full max-w-3xl bg-[#111116] border border-[#d4a853]/35 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[#09090d]/90 border border-white/10 text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-72 w-full">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent" />
              </div>

              <div className="p-6 sm:p-8">
                <div className="inline-block px-3 py-1 rounded bg-[#d4a853]/12 text-[#e8c678] text-xs font-mono mb-2 uppercase border border-[#d4a853]/30">
                  {activeItem.category}
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#f4f1ea] mb-3">
                  {activeItem.title}
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6 bg-[#0d0d12] p-4 rounded-xl border border-white/[0.08]">
                  {activeItem.description}
                </p>

                {/* Responsible Engineering Teams */}
                <div className="mb-6">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    CROSS-DISCIPLINARY TEAMS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeItem.engineers.map((eng: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-[#d4a853]/25 text-[#e8c678] text-xs font-mono"
                      >
                        {eng}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveItem(null)}
                  className="w-full py-3 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-xs tracking-wider cursor-pointer transition-colors"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
