import React, { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Users,
  ChevronDown,
  Wind,
  Zap,
  Car,
  Droplet,
  Tv,
} from 'lucide-react';

interface HeroProps {
  onExploreCity?: () => void;
  onMeetEngineers?: () => void;
  onOpenPresentation: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreCity = () => {
    document.getElementById('digital-twin')?.scrollIntoView({ behavior: 'smooth' });
  },
  onMeetEngineers = () => {
    document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' });
  },
  onOpenPresentation,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ultra-lightweight canvas particle simulation with IntersectionObserver auto-pause and zero shadowBlur
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    observer.observe(section);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#d4a853', '#e8c678', '#cbd5e1', '#10b981'];

    for (let i = 0; i < 42; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.12,
        size: Math.random() * 1.8 + 0.9,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.5 + 0.18,
      });
    }

    const render = () => {
      animationId = requestAnimationFrame(render);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -8) {
          p.y = height + 8;
          p.x = Math.random() * width;
        }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-hidden bg-[#09090d]"
    >
      {/* Subtle architectural CSS grid + lightweight radial ambient gradient (zero blur-[] DOM lag) */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-60" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 68% 48% at 50% 24%, rgba(212, 168, 83, 0.12) 0%, rgba(16, 185, 129, 0.04) 45%, transparent 75%)',
        }}
      />

      {/* Lightweight Canvas Ambient Dust */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-85"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-transparent to-[#09090d]/85 pointer-events-none z-10" />

      {/* Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        <p
          id="hero-badge"
          className="text-xs sm:text-sm font-mono uppercase tracking-[0.24em] text-[#d4a853] mb-6"
        >
          Engineering Day Initiative · Spatial Digital Twin & Smart Residency
        </p>

        <h1
          id="hero-heading"
          className="text-5xl sm:text-7xl lg:text-[5.25rem] font-heading font-extrabold tracking-tight text-[#f8f6f0] mb-5 leading-[1.03] [text-wrap:balance]"
        >
          NEXUS{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f6e3b4] via-[#d4a853] to-[#b58732]">
            SMART CITY
          </span>
        </h1>

        <h2
          id="hero-subheading"
          className="text-lg sm:text-2xl font-heading font-medium tracking-wide text-zinc-300 mb-5 max-w-3xl [text-wrap:balance]"
        >
          One City. Many Engineers.{' '}
          <span className="text-[#f8f6f0] border-b border-[#d4a853]/60 pb-0.5">
            One Intelligent Ecosystem.
          </span>
        </h2>

        <p
          id="hero-description"
          className="text-zinc-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed"
        >
          Fourteen engineering disciplines unified across an interactive 3D urban digital twin, Shanti Vihar smart residential colony, and autonomous telemetry architecture.
        </p>

        {/* Action Buttons */}
        <div
          id="hero-cta-group"
          className="flex flex-wrap items-center justify-center gap-3.5 mb-14"
        >
          <button
            id="hero-explore-btn"
            onClick={onExploreCity}
            className="group px-7 py-3.5 rounded-xl bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] font-heading font-bold text-sm tracking-wide transition-all duration-150 flex items-center gap-2.5 cursor-pointer shadow-[0_10px_30px_rgba(212,168,83,0.22)] whitespace-nowrap shrink-0"
          >
            <span>Explore 3D City Twin</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          <button
            id="hero-engineers-btn"
            onClick={onMeetEngineers}
            className="px-6 py-3.5 rounded-xl bg-[#13131a] hover:bg-[#1a1a24] border border-white/12 hover:border-[#d4a853]/50 text-zinc-100 font-heading font-semibold text-sm tracking-wide transition-colors duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Users className="w-4 h-4 text-[#d4a853]" />
            <span>14 Engineering Divisions</span>
          </button>

          <button
            id="hero-presentation-btn"
            onClick={onOpenPresentation}
            className="px-5 py-3.5 rounded-xl bg-[#13131a] hover:bg-[#1a1a24] border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white font-heading font-semibold text-sm tracking-wide transition-colors duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Tv className="w-4 h-4 text-[#d4a853]" />
            <span>Presentation Mode</span>
          </button>
        </div>

        {/* Live Telemetry Summary Row (Single-level elevation, hairline dividers, tabular-nums) */}
        <div
          id="hero-live-telemetry"
          className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] rounded-2xl bg-[#111116]/95 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col items-center p-5">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mb-1.5">
              <Wind className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Air Quality</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#f8f6f0] tabular-nums">94 AQI</div>
            <span className="text-[11px] text-emerald-400 font-medium mt-0.5">Optimal Index</span>
          </div>

          <div className="flex flex-col items-center p-5">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mb-1.5">
              <Zap className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Clean Grid</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#e8c678] tabular-nums">87%</div>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5">Solar & Wind Mix</span>
          </div>

          <div className="flex flex-col items-center p-5">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mb-1.5">
              <Car className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Corridor Flow</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#f8f6f0] tabular-nums">48 km/h</div>
            <span className="text-[11px] text-emerald-400 font-medium mt-0.5">Green Wave Active</span>
          </div>

          <div className="flex flex-col items-center p-5">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mb-1.5">
              <Droplet className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Water Reserve</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#f8f6f0] tabular-nums">92%</div>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5">72% Reclaimed</span>
          </div>
        </div>

        {/* Clean Attribution Line */}
        <div className="mt-8 text-xs text-zinc-400 font-mono flex flex-wrap items-center justify-center gap-2">
          <span>Architected by</span>
          <span className="text-[#e8c678] font-medium">Rajeev Singh Rajpoot</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#e8c678] font-medium">Rahul Ahirwar</span>
          <span aria-hidden="true">·</span>
          <span className="text-zinc-500">B.Tech CSE</span>
        </div>
      </div>

      {/* Scroll Link */}
      <a
        href="#engineering"
        className="relative z-20 mt-10 flex flex-col items-center gap-1 text-zinc-500 hover:text-[#e8c678] transition-colors cursor-pointer"
        aria-label="Scroll to Engineering Section"
      >
        <span className="text-[11px] font-mono tracking-widest uppercase">Discover Collaboration</span>
        <ChevronDown className="w-4 h-4 text-[#d4a853]" />
      </a>
    </section>
  );
};
