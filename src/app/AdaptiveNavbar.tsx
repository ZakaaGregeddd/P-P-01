'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { playNavClickSound } from '@/lib/sfx';

export default function AdaptiveNavbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isExtended, setIsExtended] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Handle manual transformation
  const toggleNav = () => {
    setIsExtended(!isExtended);
    if (isExtended) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleMinimize = () => {
    setIsExtended(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    // Minimize navbar by default on mobile screens for cleaner spatial layouts
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsExtended(false);
    }

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 100) {
        setIsExtended(false);
        setIsMobileMenuOpen(false);
      } else if (currentScroll < 50 && typeof window !== 'undefined' && window.innerWidth >= 768) {
        setIsExtended(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Extended State NavBar */}
      <header
        className={`fixed top-0 left-0 w-full bg-surface/80 backdrop-blur-xl border-b border-secondary/20 shadow-[0_0_20px_rgba(86,141,255,0.15)] z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 transition-all duration-500 transform ${
          isExtended ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            className="font-headline-md text-2xl text-primary tracking-tighter hover:opacity-85 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-none"
          >
            <span className="hidden sm:inline">GRD-Port v1.7</span>
            <span className="inline sm:hidden">GRD</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              onClick={() => playNavClickSound()}
              className={`font-label-caps text-label-caps tracking-[0.15em] cursor-pointer hover:text-secondary transition-all duration-300 px-3 py-1.5 ${
                pathname === '/'
                  ? 'text-primary border-b border-secondary shadow-[0_4px_12px_-2px_rgba(86,141,255,0.5)]'
                  : 'text-on-surface-variant'
              }`}
            >
              Home
            </Link>
            <Link
              href="/certificates"
              onClick={() => playNavClickSound()}
              className={`font-label-caps text-label-caps tracking-[0.15em] cursor-pointer hover:text-secondary transition-all duration-300 px-3 py-1.5 ${
                pathname === '/certificates'
                  ? 'text-primary border-b border-secondary shadow-[0_4px_12px_-2px_rgba(86,141,255,0.5)]'
                  : 'text-on-surface-variant'
              }`}
            >
              Certificates
            </Link>
            <Link
              href={isLoggedIn ? '/admin' : '/login'}
              onClick={() => playNavClickSound()}
              className={`font-label-caps text-label-caps tracking-[0.15em] cursor-pointer hover:text-secondary transition-all duration-300 px-3 py-1.5 ${
                pathname === '/login' || pathname === '/admin'
                  ? 'text-primary border-b border-secondary shadow-[0_4px_12px_-2px_rgba(86,141,255,0.5)]'
                  : 'text-on-surface-variant'
              }`}
            >
              {isLoggedIn ? 'Admin' : 'Login'}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="font-technical-sm text-[11px] text-secondary tracking-widest opacity-80 hidden lg:inline">
            SYS.STATUS // ACTIVE
          </span>
          <a
            href="https://wa.me/6282289664966"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playNavClickSound()}
            className="bg-secondary text-primary font-label-caps text-label-caps px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm hover:shadow-[0_0_20px_rgba(0,112,255,0.6)] transition-all duration-300"
          >
            Contact
          </a>

          {/* Hamburger Menu Button for Mobile Dropdown */}
          <button
            className="p-2 text-primary hover:text-secondary transition-colors cursor-pointer flex items-center md:hidden border border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <button
            className="p-2 text-primary hover:text-secondary transition-colors cursor-pointer flex items-center"
            onClick={handleMinimize}
            aria-label="Minimize navigation"
          >
            <span className="material-symbols-outlined text-[20px]">expand_less</span>
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed left-0 w-full bg-surface/95 backdrop-blur-2xl border-b border-secondary/20 shadow-[0_15px_30px_rgba(0,112,255,0.15)] z-40 transition-all duration-300 transform md:hidden ${
          isExtended && isMobileMenuOpen 
            ? 'top-16 opacity-100 translate-y-0' 
            : 'top-16 -translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col py-2">
          <Link
            href="/"
            onClick={() => {
              playNavClickSound();
              setIsMobileMenuOpen(false);
            }}
            className={`font-label-caps text-label-caps tracking-[0.15em] py-3.5 px-margin-mobile border-b border-white/5 transition-colors ${
              pathname === '/' ? 'text-secondary bg-white/5' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Home
          </Link>
          <Link
            href="/certificates"
            onClick={() => {
              playNavClickSound();
              setIsMobileMenuOpen(false);
            }}
            className={`font-label-caps text-label-caps tracking-[0.15em] py-3.5 px-margin-mobile border-b border-white/5 transition-colors ${
              pathname === '/certificates' ? 'text-secondary bg-white/5' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Certificates
          </Link>
          <Link
            href={isLoggedIn ? '/admin' : '/login'}
            onClick={() => {
              playNavClickSound();
              setIsMobileMenuOpen(false);
            }}
            className={`font-label-caps text-label-caps tracking-[0.15em] py-3.5 px-margin-mobile transition-colors ${
              pathname === '/login' || pathname === '/admin' ? 'text-secondary bg-white/5' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            {isLoggedIn ? 'Admin' : 'Login'}
          </Link>
        </nav>
      </div>

      {/* Minimized State (Floating Pill) */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 glass-panel bg-surface/65 backdrop-blur-xl px-5 py-2.5 shadow-[0_0_30px_rgba(86,141,255,0.25)] transition-all duration-500 transform ${
          !isExtended ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <button
            onClick={() => {
              playNavClickSound();
              router.push('/');
            }}
            className={`material-symbols-outlined text-[20px] transition-colors hover:text-secondary border-none outline-none focus:outline-none bg-transparent cursor-pointer ${
              pathname === '/' ? 'text-secondary drop-shadow-[0_0_5px_rgba(176,198,255,0.8)]' : 'text-on-surface-variant'
            }`}
            title="Home"
          >
            architecture
          </button>
          <button
            onClick={() => {
              playNavClickSound();
              router.push('/certificates');
            }}
            className={`material-symbols-outlined text-[20px] transition-colors hover:text-secondary border-none outline-none focus:outline-none bg-transparent cursor-pointer ${
              pathname === '/certificates' ? 'text-secondary drop-shadow-[0_0_5px_rgba(176,198,255,0.8)]' : 'text-on-surface-variant'
            }`}
            title="Certificates"
          >
            verified
          </button>
          <button
            onClick={() => {
              playNavClickSound();
              router.push(isLoggedIn ? '/admin' : '/login');
            }}
            className={`material-symbols-outlined text-[20px] transition-colors hover:text-secondary border-none outline-none focus:outline-none bg-transparent cursor-pointer ${
              pathname === '/login' || pathname === '/admin' ? 'text-secondary drop-shadow-[0_0_5px_rgba(176,198,255,0.8)]' : 'text-on-surface-variant'
            }`}
            title={isLoggedIn ? 'Admin Panel' : 'Login'}
          >
            login
          </button>
        </div>
        <button 
          className="flex items-center gap-2 group cursor-pointer border-none outline-none focus:outline-none focus:ring-0 bg-transparent p-0" 
          onClick={() => {
            playNavClickSound();
            toggleNav();
          }}
        >
          <span className="font-technical-sm text-technical-sm text-primary group-hover:text-secondary transition-colors">
            NAV.TRIGGER
          </span>
          <span className="material-symbols-outlined text-primary text-[18px] group-hover:rotate-180 transition-transform duration-500">
            expand_more
          </span>
        </button>
      </div>
    </>
  );
}
