'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdaptiveNavbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isExtended, setIsExtended] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Handle manual transformation
  const toggleNav = () => {
    setIsExtended(!isExtended);
  };

  // Optional: Auto-toggle on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 100) {
        setIsExtended(false);
      } else if (currentScroll < 50) {
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
        className={`fixed top-0 left-0 w-full bg-surface/80 backdrop-blur-xl border-b border-secondary/20 shadow-[0_0_20px_rgba(86,141,255,0.15)] z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 transition-all duration-500 transform ${
          isExtended ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="font-headline-md text-2xl text-primary tracking-tighter hover:opacity-85 transition-opacity">
            ARCH-OS v1.0
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
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
        
        <div className="flex items-center gap-6">
          <span className="font-technical-sm text-[11px] text-secondary tracking-widest opacity-80 hidden lg:inline">
            SYS.STATUS // ACTIVE
          </span>
          <a
            href="mailto:admin@architex.v1"
            className="bg-secondary text-primary font-label-caps text-label-caps px-5 py-2.5 hover:shadow-[0_0_20px_rgba(0,112,255,0.6)] transition-all duration-300"
          >
            Contact
          </a>
          <button
            className="p-2 text-primary hover:text-secondary transition-colors cursor-pointer flex items-center"
            onClick={toggleNav}
            aria-label="Minimize navigation"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </header>

      {/* Minimized State (Floating Pill) */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 glass-panel bg-surface/65 backdrop-blur-xl px-5 py-2.5 shadow-[0_0_30px_rgba(86,141,255,0.25)] transition-all duration-500 transform ${
          !isExtended ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <button
            onClick={() => router.push('/')}
            className={`material-symbols-outlined text-[20px] transition-colors hover:text-secondary border-none outline-none focus:outline-none bg-transparent cursor-pointer ${
              pathname === '/' ? 'text-secondary drop-shadow-[0_0_5px_rgba(176,198,255,0.8)]' : 'text-on-surface-variant'
            }`}
            title="Home"
          >
            architecture
          </button>
          <button
            onClick={() => router.push('/certificates')}
            className={`material-symbols-outlined text-[20px] transition-colors hover:text-secondary border-none outline-none focus:outline-none bg-transparent cursor-pointer ${
              pathname === '/certificates' ? 'text-secondary drop-shadow-[0_0_5px_rgba(176,198,255,0.8)]' : 'text-on-surface-variant'
            }`}
            title="Certificates"
          >
            verified
          </button>
          <button
            onClick={() => router.push(isLoggedIn ? '/admin' : '/login')}
            className={`material-symbols-outlined text-[20px] transition-colors hover:text-secondary border-none outline-none focus:outline-none bg-transparent cursor-pointer ${
              pathname === '/login' || pathname === '/admin' ? 'text-secondary drop-shadow-[0_0_5px_rgba(176,198,255,0.8)]' : 'text-on-surface-variant'
            }`}
            title={isLoggedIn ? 'Admin Panel' : 'Login'}
          >
            login
          </button>
        </div>
        <button className="flex items-center gap-2 group cursor-pointer border-none outline-none focus:outline-none focus:ring-0 bg-transparent p-0" onClick={toggleNav}>
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
