'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function MusicPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.15);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load preferences from localStorage on mount (client-side only)
    const savedVolStr = localStorage.getItem('music-volume');
    const savedPlayStr = localStorage.getItem('music-playing');
    
    let initialVolume = 0.15;
    if (savedVolStr !== null) {
      initialVolume = parseFloat(savedVolStr);
      setVolume(initialVolume);
    }
    
    let initialPlaying = true;
    if (savedPlayStr !== null) {
      initialPlaying = savedPlayStr === 'true';
      setIsPlaying(initialPlaying);
    }

    // Use the custom local Cyberpunk OST file
    const audio = new Audio('/music/Hyper - Spoiler Cyberpunk 2077 OST.mp3');
    audio.loop = true;
    audio.volume = initialVolume;
    audioRef.current = audio;

    // Handle initial play if enabled by preference
    const playAttempt = () => {
      if (initialPlaying) {
        audio.play().catch(() => {
          console.debug('Autoplay blocked. Waiting for user interaction to resume.');
        });
      }
    };

    playAttempt();

    // Add interactive listener to unlock audio playback once user clicks anywhere
    const unlockAudio = () => {
      const shouldPlay = localStorage.getItem('music-playing') !== 'false';
      if (shouldPlay && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    // Redirect back to login if alarm is active and user tries to navigate elsewhere
    if (typeof window === 'undefined') return;
    const isAlarmActive = sessionStorage.getItem('alarm-active') === 'true';
    if (isAlarmActive && pathname !== '/login') {
      window.location.href = '/login';
    }
  }, [pathname]);

  useEffect(() => {
    let alarmOsc: OscillatorNode | null = null;
    let alarmGain: GainNode | null = null;
    let alarmInterval: any = null;
    let alarmCtx: AudioContext | null = null;

    const startAlarm = () => {
      // Persist active alarm state across page refreshes / navigations
      sessionStorage.setItem('alarm-active', 'true');
      
      // Pause normal music
      if (audioRef.current) {
        audioRef.current.pause();
      }

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        alarmCtx = new AudioContextClass();
        
        const osc = alarmCtx.createOscillator();
        const gain = alarmCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, alarmCtx.currentTime);
        gain.gain.setValueAtTime(0, alarmCtx.currentTime);
        
        osc.connect(gain);
        gain.connect(alarmCtx.destination);
        osc.start();
        
        alarmOsc = osc;
        alarmGain = gain;
        
        let isBeeping = false;
        alarmInterval = setInterval(() => {
          if (alarmCtx && gain) {
            const now = alarmCtx.currentTime;
            gain.gain.cancelScheduledValues(now);
            if (isBeeping) {
              gain.gain.setValueAtTime(0.025, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            } else {
              gain.gain.setValueAtTime(0, now);
            }
            isBeeping = !isBeeping;
          }
        }, 150);
      } catch (e) {
        console.debug('Failed to start synth alarm:', e);
      }
    };

    const stopAlarm = () => {
      sessionStorage.removeItem('alarm-active');
      if (alarmInterval) clearInterval(alarmInterval);
      if (alarmOsc) {
        try {
          alarmOsc.stop();
          alarmOsc.disconnect();
        } catch(e){}
        alarmOsc = null;
      }
      if (alarmCtx) {
        try {
          alarmCtx.close();
        } catch(e){}
        alarmCtx = null;
      }
      // Resume Cyberpunk music if it was playing
      const shouldPlay = localStorage.getItem('music-playing') !== 'false';
      if (shouldPlay && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('trigger-alarm', startAlarm);
    window.addEventListener('stop-alarm', stopAlarm);

    return () => {
      if (alarmInterval) clearInterval(alarmInterval);
      window.removeEventListener('trigger-alarm', startAlarm);
      window.removeEventListener('stop-alarm', stopAlarm);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('music-volume', volume.toString());
    }
  }, [volume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('music-playing', 'false');
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      localStorage.setItem('music-playing', 'true');
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center justify-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`glass-panel flex flex-row-reverse items-center p-1.5 overflow-hidden backdrop-blur-md transition-all duration-500 ease-in-out bg-background/60 border border-outline-variant/30 ${
          isHovered ? 'w-80 h-12 rounded-full' : 'w-12 h-12 rounded-full'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
            isPlaying 
              ? 'border border-secondary text-secondary bg-secondary/10 shadow-[0_0_15px_rgba(0,112,255,0.4)] animate-pulse' 
              : 'border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50'
          }`}
          title={isPlaying ? 'Mute Music' : 'Play Music'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPlaying ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Dynamic Panel Content (Only visible on hover) */}
        <div 
          className={`flex-1 flex items-center justify-between gap-4 px-4 transition-all duration-500 min-w-0 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
        >
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[8px] text-secondary tracking-widest leading-none">AUDIO_NODE</span>
            <span className="font-technical-sm text-[10px] text-primary truncate tracking-wider uppercase mt-1">
              Hyper - Spoiler
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">volume_down</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isPlaying ? volume : 0}
              disabled={!isPlaying}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
