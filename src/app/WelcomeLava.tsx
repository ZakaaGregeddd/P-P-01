'use client';

import { useEffect, useState } from 'react';

export default function WelcomeLava() {
  const [isClient, setIsClient] = useState(false);
  const [glitchStyle, setGlitchStyle] = useState<React.CSSProperties>({});
  const [displayedText, setDisplayedText] = useState('WELCOME');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Typing & Decryption scramble transition (WELCOME <-> SCROLL?)
  useEffect(() => {
    if (!isClient) return;

    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const randomChars = '$#@%&?*X9850+=/[]{}|?<>~';
    const getRandomChar = () => randomChars[Math.floor(Math.random() * randomChars.length)];

    const startTypingSequence = async () => {
      // 1. Show WELCOME and wait 30 seconds
      setDisplayedText('WELCOME');
      await new Promise(resolve => { timeoutId = setTimeout(resolve, 30000); });
      if (!isActive) return;

      // 2. Erase WELCOME (untyping: 50ms per char)
      const welcomeStr = 'WELCOME';
      for (let i = welcomeStr.length; i >= 0; i--) {
        setDisplayedText(welcomeStr.slice(0, i));
        await new Promise(resolve => { timeoutId = setTimeout(resolve, 50); });
        if (!isActive) return;
      }

      // Pause before typing next word
      await new Promise(resolve => { timeoutId = setTimeout(resolve, 400); });
      if (!isActive) return;

      // 3. Type SCROLL? with Decryption Scramble (searching for letters)
      const scrollStr = 'SCROLL?';
      let currentText = '';
      for (let i = 0; i < scrollStr.length; i++) {
        const correctChar = scrollStr[i];

        // Flicker a few random characters at the current typing position first
        const scrambleSteps = 3 + Math.floor(Math.random() * 3); // 3 to 5 steps
        for (let j = 0; j < scrambleSteps; j++) {
          setDisplayedText(currentText + getRandomChar());
          await new Promise(resolve => { timeoutId = setTimeout(resolve, 35); });
          if (!isActive) return;
        }

        // Lock in the correct character
        currentText += correctChar;
        setDisplayedText(currentText);
        await new Promise(resolve => { timeoutId = setTimeout(resolve, 70); });
        if (!isActive) return;
      }

      // 4. Hold SCROLL? for 3 seconds
      await new Promise(resolve => { timeoutId = setTimeout(resolve, 3000); });
      if (!isActive) return;

      // 5. Erase SCROLL? (untyping: 50ms per char)
      for (let i = scrollStr.length; i >= 0; i--) {
        setDisplayedText(scrollStr.slice(0, i));
        await new Promise(resolve => { timeoutId = setTimeout(resolve, 50); });
        if (!isActive) return;
      }

      // Pause before typing welcome again
      await new Promise(resolve => { timeoutId = setTimeout(resolve, 400); });
      if (!isActive) return;

      // 6. Type WELCOME with Decryption Scramble (searching for letters)
      currentText = '';
      for (let i = 0; i < welcomeStr.length; i++) {
        const correctChar = welcomeStr[i];

        // Flicker random characters
        const scrambleSteps = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < scrambleSteps; j++) {
          setDisplayedText(currentText + getRandomChar());
          await new Promise(resolve => { timeoutId = setTimeout(resolve, 35); });
          if (!isActive) return;
        }

        // Lock in correct character
        currentText += correctChar;
        setDisplayedText(currentText);
        await new Promise(resolve => { timeoutId = setTimeout(resolve, 70); });
        if (!isActive) return;
      }

      // Loop back
      startTypingSequence();
    };

    startTypingSequence();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isClient]);

  // Procedural Electrical Glitch Loop (Totally random timing, counts, skewing, and speed)
  useEffect(() => {
    if (!isClient) return;

    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const runGlitchSequence = async () => {
      if (!isActive) return;

      // 1. Stable State (Fully illuminated neon text)
      setGlitchStyle({
        opacity: 1,
        transform: 'skewX(0deg)',
        filter: 'brightness(1) contrast(1)',
        textShadow: '0 0 10px rgba(0, 112, 255, 0.4), 0 0 20px rgba(0, 112, 255, 0.2)',
      });

      // Stable duration is completely randomized between 1.5s and 6s
      const stableDuration = 1500 + Math.random() * 4500;
      await new Promise(resolve => { timeoutId = setTimeout(resolve, stableDuration); });
      if (!isActive) return;

      // 2. Glitch Outburst (Rapid unpredictable flickers)
      // Pick random number of flicker steps (between 3 and 9 steps)
      const numFlickers = 3 + Math.floor(Math.random() * 7);

      for (let i = 0; i < numFlickers; i++) {
        const rand = Math.random();
        let opacity = 1;
        let skew = 0;
        let brightness = 1;
        let shadow = '0 0 10px rgba(0, 112, 255, 0.4)';

        if (rand < 0.25) { // Dark out
          opacity = 0;
          brightness = 0;
          shadow = 'none';
        } else if (rand < 0.5) { // Dim and skew distorted
          opacity = 0.15 + Math.random() * 0.35;
          brightness = 0.35;
          skew = (Math.random() - 0.5) * 16;
          shadow = 'none';
        } else if (rand < 0.75) { // Power spike (high brightness glow)
          opacity = 0.85;
          brightness = 1.7;
          skew = (Math.random() - 0.5) * 10;
        }

        setGlitchStyle({
          opacity,
          transform: `skewX(${skew}deg)`,
          filter: `brightness(${brightness})`,
          textShadow: shadow,
          transition: 'none', // instant response for crisp flickers
        });

        // Stutter speed is completely randomized between 15ms and 85ms per step
        const stepDuration = 15 + Math.random() * 70;
        await new Promise(resolve => { timeoutId = setTimeout(resolve, stepDuration); });
        if (!isActive) return;
      }

      // Loop sequence
      runGlitchSequence();
    };

    runGlitchSequence();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isClient]);

  const scrollToHero = () => {
    const nextSection = document.getElementById('hero-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Grid Overlay for Welcome Section */}
      <div className="absolute inset-0 blueprint-grid-fine opacity-20 pointer-events-none z-10"></div>

      {/* Centered Welcome text container */}
      <div className="relative w-full h-[calc(100vh-80px)] min-h-[500px] flex flex-col items-center justify-center select-none z-20">
        {/* Transparent glass backdrop for readability, but allows liquid to overlay */}
        <div className="bg-background/10 backdrop-blur-[2px] p-8 border border-white/5 shadow-2xl relative group min-w-[280px] sm:min-w-[320px] md:min-w-[600px] text-center flex items-center justify-center h-48">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/40"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/40"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40"></div>

          <h1
            style={glitchStyle}
            className="font-display-lg text-primary text-4xl sm:text-5xl md:text-[80px] lg:text-[100px] font-bold uppercase tracking-widest leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] min-h-[1em]"
          >
            {displayedText}
          </h1>
        </div>

        {/* Scroll Chevron */}
        <button
          onClick={scrollToHero}
          className="mt-6 flex flex-col items-center justify-center text-secondary/60 hover:text-secondary transition-colors cursor-pointer group focus:outline-none"
          aria-label="Scroll to main content"
        >
          <span className="font-technical-sm text-[10px] tracking-[0.2em] mb-1 group-hover:translate-y-0.5 transition-transform duration-300">
            ENTER INTERFACE
          </span>
          <span className="material-symbols-outlined text-[24px] animate-bounce">
            expand_more
          </span>
        </button>
      </div>
    </>
  );
}
