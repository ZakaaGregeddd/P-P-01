/**
 * Synthesizes a clean, futuristic UI hover sound using Web Audio API.
 * This runs entirely client-side with zero dependencies and no file loading delay.
 */
export function playHoverSound() {
  if (typeof window === 'undefined') return;
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Quick sine wave pitch glide for a futuristic, modern tech click/blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.06);
    
    // Smooth volume decay to prevent audio pops
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (err) {
    // Fail silently to avoid breaking UI on unsupported environments
    console.debug('AudioContext not allowed or supported:', err);
  }
}
