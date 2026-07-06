'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../actions';

// Simple Windows Hello Style AI Eye
function AiEye({ 
  state, 
  pupilTarget 
}: { 
  state: 'idle' | 'focus_id' | 'focus_password' | 'cynical' | 'angry' | 'blinking' | 'happy';
  pupilTarget: { x: number; y: number };
}) {
  const [pupil, setPupil] = useState({ x: 50, y: 25 });
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Smoothly lerp pupil position
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      setPupil(prev => {
        const dx = pupilTarget.x - prev.x;
        const dy = pupilTarget.y - prev.y;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          return pupilTarget;
        }
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        };
      });
      animId = requestAnimationFrame(lerp);
    };
    lerp();
    return () => cancelAnimationFrame(animId);
  }, [pupilTarget]);

  // Periodic random blinking
  useEffect(() => {
    if (state === 'angry' || state === 'cynical') {
      setIsBlinking(false);
      return;
    }

    const triggerBlink = () => {
      setIsBlinking(true);
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(false);
      }, 150);
      
      const nextBlinkTime = 3000 + Math.random() * 5000;
      blinkTimerRef.current = setTimeout(triggerBlink, nextBlinkTime);
    };

    const initialBlink = setTimeout(triggerBlink, 3000);
    return () => {
      clearTimeout(initialBlink);
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [state]);

  // Eyebrow path configurations - Minimal line-art style (Only Eyebrow + Pupil)
  let topEyelidPath = "M 30,14 Q 50,10 70,14";     // Normal eyebrow curve
  let eyeColor = "#0070FF";                        // Neon blue
  let isShaking = false;

  if (isBlinking) {
    topEyelidPath = "M 30,17 Q 50,16 70,17";       // Slightly lowered eyebrow on blink
  } else if (state === 'cynical') {
    topEyelidPath = "M 30,20 Q 50,22 70,20";       // Squinted/lowered eyebrow
    eyeColor = "#FF9500";                          // Orange warning
  } else if (state === 'angry') {
    topEyelidPath = "M 30,22 L 50,18 L 70,12";     // Sharp diagonal angry brow line
    eyeColor = "#FF3B30";                          // Red alert
    isShaking = true;
  } else if (state === 'happy') {
    topEyelidPath = "M 32,18 Q 50,6 68,18";       // Highly curved happy eyebrow
    eyeColor = "#10B981";                          // Success emerald green
  }

  return (
    <div className={`w-20 h-10 mx-auto relative ${isShaking ? 'animate-pulse' : ''}`}>
      <svg 
        viewBox="0 0 100 40" 
        className="w-full h-full"
        style={{
          filter: `drop-shadow(0 0 4px ${eyeColor}80)`,
          transform: isShaking ? `translate(${(Math.random() - 0.5) * 2}px, ${(Math.random() - 0.5) * 2}px)` : 'none'
        }}
      >
        {/* Simple floating Pupil (No outer clipping or sclera socket) */}
        {/* Glowing outer iris circle */}
        <circle 
          cx={pupil.x} 
          cy={pupil.y} 
          r="9" 
          fill={eyeColor} 
          opacity={isBlinking ? "0.05" : "0.22"} 
          className="transition-all duration-150"
        />
        {/* Simple clean center pupil */}
        <circle 
          cx={pupil.x} 
          cy={pupil.y} 
          r={isBlinking ? "0" : (state === 'angry' ? "3" : "4.5")} 
          fill={eyeColor} 
          className="transition-all duration-150"
        />

        {/* Minimal thin single eyebrow line */}
        <path 
          d={topEyelidPath} 
          fill="none" 
          stroke={eyeColor} 
          strokeWidth="2.2" 
          strokeLinecap="round"
          className="transition-all duration-150 ease-out"
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Eye States
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [eyeState, setEyeState] = useState<'idle' | 'focus_id' | 'focus_password' | 'cynical' | 'angry' | 'happy'>('idle');
  const [pupilTarget, setPupilTarget] = useState({ x: 50, y: 25 });
  const [isMouseClose, setIsMouseClose] = useState(false);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eyeContainerRef = useRef<HTMLDivElement>(null);

  // Lockout Countdown
  useEffect(() => {
    if (lockoutTime <= 0) return;

    const timer = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAttempts(0);
          setEyeState('idle');
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  // Track Mouse Cursor and look directly at it if it's too close (under 180px)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (eyeState === 'angry') return; // lockout overrides mouse tracking

      const container = eyeContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const threshold = 180; // distance in pixels to trigger look-at-cursor

      if (distance < threshold) {
        setIsMouseClose(true);
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Pupil X ranges from 40 to 60, Pupil Y ranges from 18 to 32
        const targetX = 50 + nx * 10;
        const targetY = 25 + ny * 7;
        
        setPupilTarget({ x: targetX, y: targetY });
      } else {
        setIsMouseClose(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [eyeState]);

  // Idle look around (only active when mouse is NOT close and not focused)
  useEffect(() => {
    if (eyeState !== 'idle' || isMouseClose) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    const lookAround = () => {
      const rx = 46 + Math.random() * 8; // 46 to 54
      const ry = 22 + Math.random() * 6; // 22 to 28
      setPupilTarget({ x: rx, y: ry });

      const delay = 1800 + Math.random() * 2000;
      idleTimerRef.current = setTimeout(lookAround, delay);
    };

    lookAround();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [eyeState, isMouseClose]);

  const [focusedField, setFocusedField] = useState<'id' | 'password' | 'none'>('none');

  // Dynamically shift pupil target horizontally to read the text character-by-character as user types
  useEffect(() => {
    if (eyeState === 'angry' || eyeState === 'cynical' || isMouseClose) return;

    if (focusedField === 'id') {
      const length = adminId.length;
      // Interpolates target X coordinate from 40 (start of field) to 58 (end of field)
      const targetX = 40 + Math.min(length, 15) * 1.2;
      setPupilTarget({ x: targetX, y: 31 }); // Look down-left
    } else if (focusedField === 'password') {
      const length = password.length;
      // Interpolates target X coordinate from 44 (start of field) to 62 (end of field)
      const targetX = 44 + Math.min(length, 15) * 1.2;
      setPupilTarget({ x: targetX, y: 31 }); // Look down-right
    }
  }, [adminId, password, focusedField, eyeState, isMouseClose]);

  const handleFocus = (field: 'id' | 'password') => {
    if (eyeState === 'angry') return;
    setFocusedField(field);
    setEyeState(field === 'id' ? 'focus_id' : 'focus_password');
  };

  const handleBlur = () => {
    setFocusedField('none');
    if (eyeState === 'angry' || eyeState === 'cynical') return;
    setEyeState('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (lockoutTime > 0) {
      setError(`ACCESS DENIED: LOCKED OUT FOR ${lockoutTime}s`);
      return;
    }

    if (!adminId) {
      setError('Administrator Email Required');
      setEyeState('cynical');
      setPupilTarget({ x: 50, y: 28 });
      return;
    }

    if (!password) {
      setError('Clearance Code Required');
      setEyeState('cynical');
      setPupilTarget({ x: 50, y: 28 });
      return;
    }

    setLoading(true);
    try {
      const res = await login(adminId, password);
      if (res.success) {
        setEyeState('happy');
        setPupilTarget({ x: 50, y: 20 }); // pupil looks up-center happily
        setTimeout(() => {
          setAttempts(0);
          router.push('/admin');
          router.refresh();
        }, 1000);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        if (nextAttempts >= 3) {
          setLockoutTime(15);
          setEyeState('angry');
          setPupilTarget({ x: 50, y: 25 });
          setError('SECURITY PROTOCOL ENABLED: 15S LOCKOUT ACTIVE');
        } else {
          setError(res.error || 'Access Denied');
          setEyeState('cynical');
          setPupilTarget({ x: 50, y: 28 });
          
          setTimeout(() => {
            setEyeState(prev => prev === 'cynical' ? 'idle' : prev);
          }, 3500);
        }
      }
    } catch (err) {
      setError('System Error during handshaking');
      setEyeState('cynical');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutTime > 0;

  return (
    <div className="flex-grow flex items-center justify-center pt-2 pb-6 px-margin-mobile relative overflow-hidden min-h-[calc(100vh-180px)]">
      {/* Decorative Dimension Lines */}
      <div className="absolute left-1/4 top-1/4 w-32 h-[1px] bg-secondary/30 before:content-[''] before:absolute before:-top-[3px] before:-left-[1px] before:w-[1px] before:h-[7px] before:bg-secondary/50 after:content-[''] after:absolute after:-top-[3px] after:-right-[1px] after:w-[1px] after:h-[7px] after:bg-secondary/50 pointer-events-none"></div>
      <div className="absolute right-1/4 bottom-1/4 w-[1px] h-32 bg-secondary/30 before:content-[''] before:absolute before:-left-[3px] before:-top-[1px] before:w-[7px] before:h-[1px] before:bg-secondary/50 after:content-[''] after:absolute after:-left-[3px] after:-bottom-[1px] after:w-[7px] after:h-[1px] after:bg-secondary/50 pointer-events-none"></div>

      {/* Login Card Container */}
      <div className="w-full max-w-md z-10 my-2">
        <div className="glass-panel rounded-none py-5 px-6 shadow-2xl relative">
          
          {/* Minimal Windows Hello Style Eye Widget */}
          <div ref={eyeContainerRef} className="mb-1">
            <AiEye state={eyeState} pupilTarget={pupilTarget} />
          </div>
          
          <div className="mb-4 text-center">
            <h1 className="font-headline-md text-headline-md text-primary mb-1 tracking-tight">System Access</h1>
            <p className="font-technical-sm text-technical-sm text-on-surface-variant uppercase tracking-widest">
              Authentication Protocol // V.04
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className={`border p-2.5 rounded-none text-technical-sm font-technical-sm tracking-wider uppercase text-center transition-all ${
                isLocked 
                  ? 'border-error bg-error/15 text-error animate-pulse font-bold' 
                  : 'border-error/50 bg-error/10 text-error'
              }`}>
                {isLocked ? `LOCKED OUT: ${lockoutTime}S` : `ERROR: ${error}`}
              </div>
            )}

            {/* Input Group */}
            <div className="space-y-1 relative group">
              <label className="block font-technical-sm text-technical-sm text-primary uppercase tracking-widest" htmlFor="admin-id">
                Administrator Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 text-[18px]">
                  mail
                </span>
                <input 
                  type="email" 
                  id="admin-id" 
                  name="admin-id" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  onFocus={() => handleFocus('id')}
                  onBlur={handleBlur}
                  disabled={isLocked}
                  placeholder="admin@grd.port" 
                  className="w-full bg-surface-container-low/50 border border-outline-variant/50 text-primary font-technical-sm text-technical-sm py-2.5 pl-10 pr-4 rounded-none focus:ring-0 focus:border-secondary transition-all duration-300 glow-focus placeholder-on-surface-variant/30 disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Input Group */}
            <div className="space-y-1 relative group">
              <label className="block font-technical-sm text-technical-sm text-primary uppercase tracking-widest" htmlFor="admin-pass">
                Security Clearance
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 text-[18px]">
                  key
                </span>
                <input 
                  type="password" 
                  id="admin-pass" 
                  name="admin-pass" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  disabled={isLocked}
                  placeholder="••••••••" 
                  className="w-full bg-surface-container-low/50 border border-outline-variant/50 text-primary font-technical-sm text-technical-sm py-2.5 pl-10 pr-4 rounded-none focus:ring-0 focus:border-secondary transition-all duration-300 glow-focus placeholder-on-surface-variant/30 disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-1 flex flex-col space-y-3">
              <button 
                type="submit" 
                disabled={loading || isLocked}
                className="w-full bg-[#0070FF] text-white font-label-caps text-label-caps py-2.5 rounded-none tracking-widest hover:bg-[#005bb5] transition-all duration-300 glow-hover relative overflow-hidden group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 uppercase">
                  {loading ? 'INITIALIZING HANDSHAKE...' : isLocked ? 'HANDSHAKE SUSPENDED' : 'INITIALIZE LOGIN'}
                </span>
                <div className="absolute inset-0 h-full w-0 bg-white/10 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
              </button>
              
              <div className="flex justify-center mt-3">
                <Link 
                  href="/" 
                  className="font-technical-sm text-technical-sm text-on-surface-variant hover:text-secondary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-1 transition-transform">
                    arrow_left_alt
                  </span>
                  Return to Main Interface
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
