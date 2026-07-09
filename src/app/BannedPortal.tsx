'use client';

import { useState, useEffect, useRef } from 'react';
import { playElectricSparkSound, playNavClickSound } from '@/lib/sfx';

// Larger angry AI Eye for Banned screen
function BigAngryEye() {
  const [pupil, setPupil] = useState({ x: 50, y: 25 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Angry twitching look around
      const rx = 47 + Math.random() * 6;
      const ry = 23 + Math.random() * 4;
      setPupil({ x: rx, y: ry });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-48 h-24 mx-auto relative animate-pulse">
      <svg 
        viewBox="0 0 100 40" 
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.7))',
        }}
      >
        <circle cx={pupil.x} cy={pupil.y} r="10" fill="#FF3B30" opacity="0.25" />
        <circle cx={pupil.x} cy={pupil.y} r="4" fill="#FF3B30" />
        {/* Sharp angry diagonal brow line */}
        <path d="M 25,24 L 50,19 L 75,12" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function BannedPortal({ children }: { children: React.ReactNode }) {
  const [isBanned, setIsBanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [banExpires, setBanExpires] = useState<number | null>(null);
  const [todayAlarms, setTodayAlarms] = useState<number[]>([]);
  
  // Game states
  const [gameLevel, setGameLevel] = useState<1 | 2>(1);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  
  const [passwordInput, setPasswordInput] = useState('');
  const [passRules, setPassRules] = useState({
    number: false,
    capital: false,
    special: false,
    sum10: false
  });

  // Check ban state on mount & periodic countdown updates
  useEffect(() => {
    const checkBan = () => {
      const expires = localStorage.getItem('ban-expires');
      if (expires) {
        const expiresTime = parseInt(expires, 10);
        if (Date.now() < expiresTime) {
          setIsBanned(true);
          setBanExpires(expiresTime);
          
          // Retrieve and filter today's alarms
          const historyRaw = localStorage.getItem('siaga-merah-history') || '[]';
          let history: number[] = [];
          try {
            history = JSON.parse(historyRaw);
          } catch (e) {}
          const todayStr = new Date().toDateString();
          const filtered = history.filter((t: number) => new Date(t).toDateString() === todayStr);
          setTodayAlarms(filtered);
          
          // Calculate remaining time
          const diff = expiresTime - Date.now();
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
          
          // Trigger alarm beep if not already playing
          if (document.body && !document.body.classList.contains('alarm-mode')) {
            document.body.classList.add('alarm-mode');
            window.dispatchEvent(new CustomEvent('trigger-alarm'));
          }
        } else {
          // Ban expired
          localStorage.removeItem('ban-expires');
          setIsBanned(false);
          document.body.classList.remove('alarm-mode');
          window.dispatchEvent(new CustomEvent('stop-alarm'));
        }
      } else {
        setIsBanned(false);
      }
    };

    checkBan();
    const interval = setInterval(checkBan, 1000);

    // Generate Level 1 Captcha Text
    generateNewCaptcha();

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Update password game validation rules
  useEffect(() => {
    const hasNumber = /\d/.test(passwordInput);
    const hasCapital = /[A-Z]/.test(passwordInput);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordInput);
    
    // Sum of numbers must equal 10
    const numbers = passwordInput.match(/\d/g);
    const sum = numbers ? numbers.reduce((acc, curr) => acc + parseInt(curr, 10), 0) : 0;
    const isSum10 = sum === 10;

    setPassRules({
      number: hasNumber,
      capital: hasCapital,
      special: hasSpecial,
      sum10: isSum10
    });
  }, [passwordInput]);

  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like O, I, 0, 1
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const handleCaptchaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() === captchaText) {
      playNavClickSound();
      setGameLevel(2);
    } else {
      playElectricSparkSound();
      setCaptchaError(true);
      generateNewCaptcha();
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allPassed = Object.values(passRules).every(v => v === true);
    if (allPassed) {
      playNavClickSound();
      localStorage.removeItem('ban-expires');
      localStorage.removeItem('alarm-active');
      sessionStorage.removeItem('alarm-active');
      document.body.classList.remove('alarm-mode');
      window.dispatchEvent(new CustomEvent('stop-alarm'));
      window.location.href = '/';
    } else {
      playElectricSparkSound();
    }
  };

  // If not banned, render normal website layout
  if (!isBanned) {
    return <>{children}</>;
  }

  // Render Full Screen Banned Interface
  return (
    <div className="fixed inset-0 z-[99999] bg-[#0c0c0c] text-error flex flex-col items-center justify-center p-6 select-none font-body-base">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/80 border border-red-500/30 p-8 shadow-[0_0_50px_rgba(235,59,48,0.15)] relative">
        
        {/* Left Side: Large AI Eye */}
        <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-red-500/20 pb-6 md:pb-0 md:pr-8">
          <BigAngryEye />
          <div className="mt-4 text-center">
            <h2 className="font-headline-md text-red-500 text-lg uppercase tracking-widest font-bold">NODE COGNITIVE BANNED</h2>
            <p className="font-technical-sm text-[10px] text-outline uppercase tracking-wider mt-1">ACCESS RIGHTS REVOKED BY SYSTEM CORE</p>
          </div>
        </div>

        {/* Right Side: Security Terminal Portal */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="space-y-2 border-b border-red-500/20 pb-4">
            <div className="flex justify-between text-xs font-technical-sm">
              <span className="text-outline">CLIENT INTERFACES ADDRESS</span>
              <span className="text-red-500 font-bold">192.168.1.105 (BLOCKED)</span>
            </div>
            <div className="flex justify-between text-xs font-technical-sm">
              <span className="text-outline">ACCESS COGNITIVE DEVIATIONS</span>
              <span className="text-red-500 font-bold">{todayAlarms.length * 6} WRONG ATTEMPTS</span>
            </div>
            <div className="flex justify-between text-xs font-technical-sm">
              <span className="text-outline">TEMPORAL LOCKOUT REMAINING</span>
              <span className="text-red-500 font-bold animate-pulse">{timeLeft}</span>
            </div>
            {todayAlarms.length > 0 && (
              <div className="border-t border-red-500/10 pt-2.5 mt-2.5 space-y-1">
                <div className="text-[10px] text-outline font-technical-sm tracking-wider uppercase">ALARM SECURITY EVENTS (TODAY):</div>
                {todayAlarms.map((timestamp, idx) => {
                  const dateObj = new Date(timestamp);
                  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                  return (
                    <div key={timestamp} className="flex justify-between text-[11px] font-technical-sm text-red-500/80">
                      <span>ALARM TRIGGER EVENT #{idx + 1}</span>
                      <span>TIME // {timeStr}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level 1: Captcha Challenge */}
          {gameLevel === 1 && (
            <form onSubmit={handleCaptchaSubmit} className="space-y-4">
              <div>
                <h3 className="font-label-caps text-xs text-red-400 tracking-wider mb-2">[ PHASE 01 // VISUAL CONFIRMATION ]</h3>
                <p className="font-body-base text-xs text-on-surface-variant leading-relaxed">
                  Analyze the blurred structural token key. Type the characters exactly to initialize recovery decodes.
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Blurred Captcha Display */}
                <div 
                  className="bg-black/50 border border-red-500/30 px-6 py-2.5 font-technical-sm text-lg tracking-[0.4em] font-bold select-none text-red-500 select-none text-center rounded-none relative overflow-hidden flex items-center justify-center w-36 h-12"
                  style={{
                    filter: 'blur(1.6px) contrast(1.8)',
                    background: 'radial-gradient(circle, #240505 0%, #000000 100%)',
                    textShadow: '0 0 4px #ff3b30'
                  }}
                >
                  {captchaText}
                </div>

                <button 
                  type="button" 
                  onClick={generateNewCaptcha}
                  className="material-symbols-outlined text-outline hover:text-red-500 cursor-pointer p-2 border border-outline-variant/30 text-base"
                  title="Generate New Code"
                >
                  refresh
                </button>
              </div>

              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="ENTER CAPTCHA CODE..."
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full bg-[#161616] border border-red-500/40 text-red-500 font-technical-sm text-sm p-2.5 rounded-none focus:ring-0 focus:border-red-500 placeholder-red-900/40 uppercase"
                  required
                />
                {captchaError && (
                  <p className="font-technical-sm text-[10px] text-red-500 uppercase animate-pulse">DECRYPTION FAILED.结构 ERROR. TRY AGAIN.</p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-red-950/40 border border-red-500/50 hover:bg-red-900 hover:text-white text-red-500 py-2.5 font-label-caps text-xs tracking-widest transition-all cursor-pointer rounded-none"
              >
                SUBMIT DECRYPTION KEY
              </button>
            </form>
          )}

          {/* Level 2: Password Game Challenge */}
          {gameLevel === 2 && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <h3 className="font-label-caps text-xs text-red-400 tracking-wider mb-2">[ PHASE 02 // ACCESS KEY ALIGNMENT ]</h3>
                <p className="font-body-base text-xs text-on-surface-variant leading-relaxed">
                  Formulate a hard reset override code satisfying the security logic protocols below:
                </p>
              </div>

              {/* Rules Checklist */}
              <div className="bg-[#161616] p-3 border border-red-500/20 space-y-2 font-technical-sm text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${passRules.number ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                    {passRules.number ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={passRules.number ? 'text-emerald-500/80 line-through' : 'text-red-400'}>RULE 1: MUST CONTAIN AT LEAST ONE DIGIT [0-9]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${passRules.capital ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                    {passRules.capital ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={passRules.capital ? 'text-emerald-500/80 line-through' : 'text-red-400'}>RULE 2: MUST CONTAIN AT LEAST ONE CAPITAL LETTER [A-Z]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${passRules.special ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                    {passRules.special ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={passRules.special ? 'text-emerald-500/80 line-through' : 'text-red-400'}>RULE 3: MUST CONTAIN AT LEAST ONE SPECIAL SYMBOL [!,@,#,$,etc]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${passRules.sum10 ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                    {passRules.sum10 ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={passRules.sum10 ? 'text-emerald-500/80 line-through' : 'text-red-400'}>RULE 4: ALL DIGITS IN THE KEY MUST ADD UP TO EXACTLY 10</span>
                </div>
              </div>

              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="ENTER OVERRIDE PASSCODE KEY..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#161616] border border-red-500/40 text-red-500 font-technical-sm text-sm p-2.5 rounded-none focus:ring-0 focus:border-red-500 placeholder-red-900/40"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={!Object.values(passRules).every(v => v === true)}
                className="w-full bg-red-950/40 border border-red-500/50 hover:bg-red-900 hover:text-white text-red-500 py-2.5 font-label-caps text-xs tracking-widest transition-all cursor-pointer rounded-none disabled:opacity-30 disabled:cursor-not-allowed"
              >
                INITIATE HARD OVERRIDE
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
