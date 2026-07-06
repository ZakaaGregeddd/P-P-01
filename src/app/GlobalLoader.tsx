'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const BOOT_LOGS = [
  'INITIALIZING GRD PORT ENGINE...',
  'DECRYPTING ENCRYPTION DECODES...',
  'ESTABLISHING DATABASE HANDSHAKE...',
  'RETRIEVING SPECIFICATIONS INDEX...',
  'COMPILING VECTOR SHADER PIPELINES...',
  'MOUNTING BLUEPRINT SCHEMATICS...',
  'SYSTEM ONLINE. WELCOME.'
];

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [typedLog, setTypedLog] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if this is the initial load of the session
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Typewriter effect for current boot log
  useEffect(() => {
    if (!loading) return;
    
    let currentText = '';
    const fullText = BOOT_LOGS[logIndex] || 'RESOLVING MODULES...';
    let charIndex = 0;
    
    setTypedLog('');
    
    const typeChar = () => {
      if (charIndex < fullText.length) {
        currentText += fullText[charIndex];
        setTypedLog(currentText);
        charIndex++;
        typingTimerRef.current = setTimeout(typeChar, 15); // Snappy typing speed
      }
    };
    
    typeChar();
    
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [logIndex, loading]);

  // Initial Boot Sequence (Only on mount/refresh)
  useEffect(() => {
    setLoading(true);
    setProgress(0);
    setLogIndex(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 3; // Random increments
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          setIsInitialLoad(false);
        }, 500); // Hold briefly at 100%
      } else {
        setProgress(currentProgress);
        // Advance status log index based on progress
        const nextLogIndex = Math.min(
          Math.floor((currentProgress / 100) * BOOT_LOGS.length),
          BOOT_LOGS.length - 1
        );
        setLogIndex(nextLogIndex);
      }
    }, 120); // Speed of initial progress

    return () => clearInterval(interval);
  }, []);

  // Page Navigation Event Listeners
  useEffect(() => {
    // Hide loader immediately on pathname change (navigation complete)
    if (!isInitialLoad) {
      setLoading(false);
    }
    
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external, email, hashes, tel, target blank, and current path
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('#') ||
        href.startsWith('tel:') ||
        href === window.location.pathname ||
        target.getAttribute('target') === '_blank'
      ) {
        return;
      }

      // Show loader for navigation transitions (fast progress bar)
      setLoading(true);
      setProgress(0);
      setLogIndex(0);
      
      let navProgress = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        navProgress += Math.floor(Math.random() * 22) + 12;
        if (navProgress >= 90) {
          navProgress = 90; // Hold at 90% until page loads
          setProgress(90);
          clearInterval(timerRef.current!);
        } else {
          setProgress(navProgress);
          const nextLogIndex = Math.min(
            Math.floor((navProgress / 100) * BOOT_LOGS.length),
            BOOT_LOGS.length - 1
          );
          setLogIndex(nextLogIndex);
        }
      }, 70);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname, isInitialLoad]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-background/98 z-[9999] flex flex-col items-center justify-center backdrop-blur-md">
      {/* Blueprint Grid Guide decoration */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.05] pointer-events-none"></div>

      <div className="w-full max-w-sm px-6 flex flex-col items-center gap-8 relative z-10">
        
        {/* Loading Header */}
        <div className="text-center w-full">
          <div className="font-label-caps text-xs text-secondary tracking-[0.2em] mb-1">
            GRD PORTAL ACCESS // LOADING
          </div>
          <div className="font-technical-sm text-[9px] text-outline uppercase tracking-widest">
            COGNITIVE INTERFACE LOADED
          </div>
        </div>

        {/* Progress Circular Scan / Glow Bar */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-end font-technical-sm text-[10px]">
            <span className="text-primary tracking-wider truncate max-w-[70%] h-4 inline-block">
              {typedLog}
              <span className="animate-pulse">|</span>
            </span>
            <span className="text-secondary font-bold">
              LOAD.IDX // {String(progress).padStart(3, '0')}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-surface-container-highest border border-outline-variant/30 rounded-none overflow-hidden relative">
            <div 
              className="h-full bg-secondary shadow-[0_0_12px_rgba(86,141,255,0.8)] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Bottom Status Details */}
        <div className="flex justify-between w-full border-t border-outline-variant/20 pt-4 font-technical-sm text-[8px] text-outline uppercase tracking-widest">
          <span>PORT: 8080 // HTTP</span>
          <span>SYS.STABLE: 100%</span>
        </div>
      </div>
    </div>
  );
}
