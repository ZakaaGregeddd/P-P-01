'use client';

import { useEffect, useRef } from 'react';

export default function EnergyGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Pulse {
      type: 'v' | 'h'; // vertical or horizontal
      pos: number;     // line coordinate
      start: number;   // starting boundary
      end: number;     // ending boundary
      progress: number; // progress (0 to 1)
      speed: number;
      color: string;
      glowColor: string;
      width: number;
    }

    let pulses: Pulse[] = [];
    const maxPulses = 8; // Kept low for sophisticated, non-cluttered aesthetics
    const gridSize = 64; // Aligns exactly with the blueprint-grid-lg in globals.css

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);

    const createPulse = (initialRandom = false): Pulse => {
      const type = Math.random() > 0.5 ? 'v' : 'h';
      const isVertical = type === 'v';
      
      // Calculate active grid coordinates
      const maxGridLines = Math.floor((isVertical ? width : height) / gridSize);
      const gridLineIndex = Math.floor(Math.random() * maxGridLines);
      const pos = gridLineIndex * gridSize;

      const length = Math.random() * 250 + 150; // length of energy trail
      const speed = Math.random() * 0.008 + 0.003; // smooth, steady travel speed
      
      return {
        type,
        pos,
        start: -length,
        end: (isVertical ? height : width) + length,
        progress: initialRandom ? Math.random() : 0,
        speed,
        color: Math.random() > 0.4 ? 'rgba(0, 112, 255, 0.4)' : 'rgba(86, 141, 255, 0.6)',
        glowColor: 'rgba(0, 112, 255, 0.8)',
        width: Math.random() > 0.5 ? 1 : 2
      };
    };

    // Initialize starting pulses
    for (let i = 0; i < 4; i++) {
      pulses.push(createPulse(true));
    }

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Randomly spawn pulses if limit not exceeded
      if (pulses.length < maxPulses && Math.random() < 0.015) {
        pulses.push(createPulse(false));
      }

      // Draw and update active energy lines
      pulses.forEach((p) => {
        p.progress += p.speed;

        const currentPos = p.start + (p.end - p.start) * p.progress;

        ctx.beginPath();
        
        // Define energy fade gradients
        const grad = ctx.createLinearGradient(
          p.type === 'v' ? p.pos : currentPos - 120,
          p.type === 'v' ? currentPos - 120 : p.pos,
          p.type === 'v' ? p.pos : currentPos + 120,
          p.type === 'v' ? currentPos + 120 : p.pos
        );
        grad.addColorStop(0, 'rgba(0, 112, 255, 0)');
        grad.addColorStop(0.5, p.color);
        grad.addColorStop(1, 'rgba(0, 112, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = p.width;

        // Apply a glowing neon backlight shadow
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.glowColor;

        if (p.type === 'v') {
          ctx.moveTo(p.pos, currentPos - 120);
          ctx.lineTo(p.pos, currentPos + 120);
        } else {
          ctx.moveTo(currentPos - 120, p.pos);
          ctx.lineTo(currentPos + 120, p.pos);
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow properties for general canvas loop hygiene
      });

      // Remove completed pulses
      pulses = pulses.filter(p => p.progress < 1);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-25 mix-blend-screen"
    />
  );
}
