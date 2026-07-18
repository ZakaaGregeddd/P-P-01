'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const BOOT_LOGS = [
  'INITIALIZING GRD PORT ENGINE...',
  'RUNNING HARDWARE DIAGNOSTICS...',
  'DECRYPTING ENCRYPTION DECODES...',
  'ESTABLISHING DATABASE HANDSHAKE...',
  'RETRIEVING SPECIFICATIONS INDEX...',
  'COMPILING VECTOR SHADER PIPELINES...',
  'MOUNTING BLUEPRINT SCHEMATICS...',
  'SYSTEM ONLINE. WELCOME.'
];

interface DiagResults {
  webAudio: boolean;
  webgl: boolean;
  cores: number;
  fpsScore: number; // calculated FPS
  isCompatible: boolean;
}

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

  // Diagnostics state
  const [diagResults, setDiagResults] = useState<DiagResults | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ecoModeActive, setEcoModeActive] = useState(false);

  // Monitor frame times to detect device lag / throttling
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    lastFrameTimeRef.current = performance.now();
    const checkFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 100) {
        frameTimesRef.current.shift();
      }
      animationFrameRef.current = requestAnimationFrame(checkFps);
    };
    animationFrameRef.current = requestAnimationFrame(checkFps);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading]);

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
        
        // Calculate Diagnostics
        setTimeout(() => {
          const hasAudio = typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext);
          
          let hasWebGL = false;
          try {
            const canvas = document.createElement('canvas');
            hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch (e) {}

          const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 2) : 2;

          const deltas = frameTimesRef.current;
          let avgDelta = 16.6;
          if (deltas.length > 0) {
            const sum = deltas.reduce((acc, val) => acc + val, 0);
            avgDelta = sum / deltas.length;
          }
          const calculatedFps = Math.round(1000 / avgDelta);

          const isCompatible = cores >= 4 && hasWebGL && calculatedFps >= 48;

          setDiagResults({
            webAudio: hasAudio,
            webgl: hasWebGL,
            cores,
            fpsScore: calculatedFps,
            isCompatible
          });

          if (!isCompatible) {
            localStorage.setItem('eco_mode', 'true');
            setEcoModeActive(true);
            window.dispatchEvent(new Event('ecoModeChanged'));
          } else {
            const savedEco = localStorage.getItem('eco_mode') === 'true';
            setEcoModeActive(savedEco);
          }

          setLoading(false);
          setIsInitialLoad(false);
          
          const initiallyShown = localStorage.getItem('diag_initial_shown') === 'true';
          setShowPopup(true);

          if (!initiallyShown) {
            setIsMinimized(false);
            localStorage.setItem('diag_initial_shown', 'true');
            // Auto-minimize after 5 seconds
            setTimeout(() => {
              setIsMinimized(true);
            }, 5000);
          } else {
            setIsMinimized(true);
          }
        }, 500);
      } else {
        setProgress(currentProgress);
        const nextLogIndex = Math.min(
          Math.floor((currentProgress / 100) * BOOT_LOGS.length),
          BOOT_LOGS.length - 1
        );
        setLogIndex(nextLogIndex);
      }
    }, 120);

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

  const toggleEcoMode = () => {
    const nextState = !ecoModeActive;
    setEcoModeActive(nextState);
    localStorage.setItem('eco_mode', String(nextState));
    // Trigger custom event so LavaBackground updates immediately
    window.dispatchEvent(new Event('ecoModeChanged'));
  };

  return (
    <>
      {loading && (
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
      )}

      {/* Diagnostics Report Popup */}
      {showPopup && diagResults && (
        <div 
          className={`fixed bottom-6 left-6 z-[9990] glass-panel rounded shadow-2xl border border-primary/20 bg-background/95 backdrop-blur-md font-technical-sm text-xs transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
            isMinimized 
              ? "w-[210px] h-[34px] px-3 py-2 cursor-pointer hover:bg-secondary/10 hover:border-secondary/40" 
              : "w-80 h-[260px] p-4"
          }`}
          onClick={isMinimized ? () => setIsMinimized(false) : undefined}
          title={isMinimized ? "Expand System Diagnostics" : undefined}
        >
          {/* Minimized Content */}
          <div className={`flex items-center gap-2 w-full h-full transition-opacity duration-200 ${
            isMinimized ? "opacity-100" : "opacity-0 pointer-events-none absolute"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ecoModeActive ? "bg-error animate-pulse" : "bg-secondary animate-pulse"}`} />
            <span className="tracking-wider text-[9px] text-primary uppercase select-none">SYS STATUS // {ecoModeActive ? "ECO (OPTIMIZED)" : "HIGH FIDELITY"}</span>
          </div>

          {/* Full Expanded Content */}
          <div className={`flex flex-col gap-3 w-full h-full transition-opacity duration-300 ${
            !isMinimized ? "opacity-100" : "opacity-0 pointer-events-none absolute"
          }`}>
            <div className="flex justify-between items-center border-b border-primary/20 pb-2">
              <span className="font-semibold text-primary uppercase tracking-wider text-[10px]">System Diagnostics v1.0</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold w-5 h-5 flex items-center justify-center hover:bg-white/5 rounded cursor-pointer"
                title="Minimize"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-1 text-[10px] text-on-surface-variant uppercase">
              <div className="flex justify-between">
                <span>WebAudio Synth:</span>
                <span className={diagResults.webAudio ? "text-secondary font-bold" : "text-error font-bold"}>
                  {diagResults.webAudio ? "Detected" : "Unsupported"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>WebGL Accelerator:</span>
                <span className={diagResults.webgl ? "text-secondary font-bold" : "text-error font-bold"}>
                  {diagResults.webgl ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CPU Core Count:</span>
                <span className="text-primary font-bold">{diagResults.cores} Logical Cores</span>
              </div>
              <div className="flex justify-between">
                <span>Frame Latency:</span>
                <span className={diagResults.fpsScore >= 45 ? "text-secondary font-bold" : "text-error font-bold"}>
                  {diagResults.fpsScore} FPS Avg
                </span>
              </div>
            </div>

            <div className="border-t border-primary/10 pt-2 flex flex-col gap-2">
              {diagResults.isCompatible ? (
                <div className="text-[10px] text-secondary font-semibold border border-secondary/20 bg-secondary/5 p-2 rounded">
                  ✓ Hardware fully compatible. Premium shaders, fluid simulations, and synthesizer sounds unlocked.
                </div>
              ) : (
                <div className="text-[10px] text-error font-semibold border border-error/20 bg-error/5 p-2 rounded">
                  ⚠ Low-spec hardware or thermal throttling detected. Dynamic Eco-Mode has been automatically active to preserve battery and Performance.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEcoMode();
                }}
                className={`flex-grow py-1 px-2 text-[10px] border transition-all text-center rounded font-semibold cursor-pointer ${
                  ecoModeActive
                    ? "bg-error/20 border-error text-error"
                    : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {ecoModeActive ? "Eco-Mode: Enabled (Optimized)" : "Eco-Mode: Disabled"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
