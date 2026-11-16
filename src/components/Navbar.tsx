import React, { useState, useEffect } from 'react';
import { Menu, X, Tv, Cpu, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenPresentation: () => void;
  activeSection?: string;
  emergencyActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPresentation,
  activeSection = 'digital-twin',
  emergencyActive = false,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '3D Twin', href: '#digital-twin', id: 'digital-twin' },
    { label: 'Systems', href: '#systems', id: 'systems' },
    { label: 'Operations', href: '#dashboard', id: 'dashboard' },
    { label: 'About', href: '#about', id: 'about' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#09090d]/96 border-b border-white/[0.08] py-3 shadow-[0_8px_28px_rgba(0,0,0,0.45)]'
          : 'bg-gradient-to-b from-[#09090d]/95 via-[#09090d]/70 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Zone 1: Clean Single-Line Wordmark */}
        <a
          href="#digital-twin"
          onClick={(e) => handleNavClick(e, '#digital-twin')}
          className="flex items-center gap-2.5 group focus:outline-none whitespace-nowrap shrink-0"
          id="nav-logo"
        >
          <div className="w-9 h-9 rounded-lg bg-[#14141b] border border-[#d4a853]/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Cpu className="w-4 h-4 text-[#e2b866]" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-[#f8f6f0]">
            NEXUS <span className="text-[#d4a853]">SMART CITY</span>
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#e8c678] font-semibold'
                    : 'text-zinc-400 hover:text-[#f8f6f0]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-[#d4a853]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Incident Indicator when active */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {emergencyActive && (
            <a
              href="#dashboard"
              onClick={(e) => handleNavClick(e, '#dashboard')}
              id="nav-status-badge"
              className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono font-medium whitespace-nowrap shrink-0"
            >
              Incident Active
            </a>
          )}

          <button
            id="nav-presentation-btn"
            onClick={onOpenPresentation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-xs font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            title="Launch Engineering Day Presentation"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Presentation Mode</span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenPresentation}
            className="p-2 rounded-lg bg-[#14141b] border border-[#d4a853]/35 text-[#e2b866]"
            title="Presentation"
          >
            <Tv className="w-4 h-4" />
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#14141b] border border-white/10 text-zinc-200 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-[#0e0e14] border-b border-white/10 px-6 py-5 shadow-2xl"
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-zinc-200 hover:bg-white/[0.05] hover:text-[#e8c678] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
