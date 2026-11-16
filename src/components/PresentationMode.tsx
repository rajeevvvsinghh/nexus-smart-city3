import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { PRESENTATION_SLIDES } from '../data/presentationData';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ isOpen, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(PRESENTATION_SLIDES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex];
  const totalSlides = PRESENTATION_SLIDES.length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090d] text-[#f4f1ea] flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Top Presentation Bar */}
      <div className="relative z-10 px-6 py-4 border-b border-white/[0.08] bg-[#111116] flex items-center justify-between">
        <span className="text-xs font-mono tracking-widest text-[#d4a853] font-semibold uppercase">
          Engineering Day Presentation
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#1a1a22] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 text-xs font-mono border border-rose-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col justify-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#d4a853] mb-3">
          {currentSlide.subtitle}
        </p>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#f8f6f0] tracking-tight leading-tight mb-8 [text-wrap:balance]">
          {currentSlide.title}
        </h2>

        <div className="space-y-3.5 mb-8">
          {currentSlide.bulletPoints.map((point, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-[#111116] border border-white/[0.08] flex items-start gap-4"
            >
              <div className="w-7 h-7 rounded-lg bg-[#d4a853]/15 text-[#e8c678] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-zinc-200 text-sm sm:text-lg leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        {currentSlide.highlight && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#17171f] border border-[#d4a853]/30">
            <span className="text-xs font-mono text-[#d4a853] uppercase tracking-widest block mb-1">
              Key Takeaway
            </span>
            <div className="text-[#f8f6f0] font-heading font-semibold text-base sm:text-xl">
              {currentSlide.highlight}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 px-6 py-4 border-t border-white/[0.08] bg-[#111116] flex items-center justify-between">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-xl bg-[#1a1a22] disabled:opacity-35 hover:bg-[#23232e] text-zinc-200 text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            {PRESENTATION_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlideIndex ? 'w-6 bg-[#d4a853]' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <span className="text-xs font-mono text-[#e8c678] font-semibold">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
          disabled={currentSlideIndex === totalSlides - 1}
          className="px-4 py-2 rounded-xl bg-[#d4a853] disabled:opacity-35 hover:bg-[#e8c678] text-[#09090d] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
