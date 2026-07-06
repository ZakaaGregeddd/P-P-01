/**
 * High-tech synthesized SFX using browser Web Audio API.
 * Shares a single global AudioContext to optimize resource usage and bypass browser limits.
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!sharedCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedCtx = new AudioContextClass();
      }
    } catch (e) {
      console.debug('Web Audio API not supported:', e);
    }
  }
  return sharedCtx;
}

// Automatically resume/unlock AudioContext on user interaction to bypass autoplay restrictions
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume()
        .then(() => {
          // Remove event listeners once context is successfully unlocked/running
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('keydown', unlock);
        })
        .catch((e) => console.debug('AudioContext unlock failed:', e));
    }
  };
  window.addEventListener('click', unlock);
  window.addEventListener('touchstart', unlock);
  window.addEventListener('keydown', unlock);
}

/**
 * Synthesizes a clean, futuristic UI hover sound.
 */
export function playHoverSound() {
  const ctx = getAudioContext();
  // Only play if the audio context has been actively unlocked/resumed
  if (!ctx || ctx.state !== 'running') return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime); // Louder default volume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (err) {
    console.debug('Failed to play hover sound:', err);
  }
}

/**
 * Synthesizes a realistic electric spark/shock crackle (sentrum listrik)
 * using a combination of bandpass filtered sawtooth wave impulses.
 */
export function playElectricSparkSound() {
  const ctx = getAudioContext();
  // Only play if the audio context has been actively unlocked/resumed
  if (!ctx || ctx.state !== 'running') return;

  try {
    const now = ctx.currentTime;
    // Play 3 rapid crackles
    for (let i = 0; i < 3; i++) {
      const time = now + i * 0.04;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      // High pitch drop matching electrical static noise
      osc.frequency.setValueAtTime(1400 + Math.random() * 600, time);
      osc.frequency.exponentialRampToValueAtTime(150, time + 0.035);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, time);
      filter.Q.setValueAtTime(4, time);
      
      gain.gain.setValueAtTime(0.05, time); // Louder base volume
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.035);
    }
  } catch (err) {
    console.debug('Failed to play electric sound:', err);
  }
}

/**
 * Synthesizes a sharp, clicky cyberpunk tech-glitch interface sound.
 * Combines a stepped digital square wave blip with a highpassed metallic sawtooth click.
 */
export function playNavClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Nav click is triggered by a direct user gesture (click), so we force resume it
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    
    // Snappy cyberpunk digital envelope (0.09s duration)
    gain.gain.setValueAtTime(0.038, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    // Glitchy digital chirp (stepped Square wave)
    const osc1 = ctx.createOscillator();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1600, now);
    osc1.frequency.setValueAtTime(800, now + 0.015);
    osc1.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    // Metallic ring overlay (detuned Sawtooth through a highpass filter)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1000, now);
    osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.07);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1600, now);

    osc1.connect(gain);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.09);
    
    osc2.start(now);
    osc2.stop(now + 0.09);
  } catch (err) {
    console.debug('Failed to play nav click sound:', err);
  }
}





