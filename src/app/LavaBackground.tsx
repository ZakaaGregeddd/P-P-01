'use client';

import { useEffect, useRef, useState } from 'react';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  age: number;
  lifespan: number;
  state: 'spawning' | 'active' | 'dying';
}

export default function LavaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0, active: false });
  const [isClient, setIsClient] = useState(false);
  const [ecoMode, setEcoMode] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initial fetch of eco mode
    const isEco = localStorage.getItem('eco_mode') === 'true';
    setEcoMode(isEco);

    // Listen for global performance updates from GlobalLoader
    const handleEcoChange = () => {
      setEcoMode(localStorage.getItem('eco_mode') === 'true');
    };
    window.addEventListener('ecoModeChanged', handleEcoChange);
    return () => window.removeEventListener('ecoModeChanged', handleEcoChange);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const parent = canvas.parentElement;

    // Eco Mode resolution scaling factors
    const SCALE = ecoMode ? 0.25 : 0.5;

    let width = document.body.clientWidth || window.innerWidth;
    let height = document.body.clientHeight || window.innerHeight;

    const setupCanvas = () => {
      canvas.width = Math.floor(width * SCALE);
      canvas.height = Math.floor(height * SCALE);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    };

    setupCanvas();

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = document.body.clientWidth;
      height = document.body.clientHeight;
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Watch for dynamic DOM changes (e.g. page transitions or content updates that change height)
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    const colors = [
      'rgba(0, 112, 255, 0.65)',  // Primary electric blue
      'rgba(0, 80, 220, 0.6)',     // Deeper blue
      'rgba(86, 141, 255, 0.65)',  // Bright sky blue
      'rgba(0, 112, 255, 0.5)',
    ];

    // Helper to spawn a new random blob at a random position (initially) or entering from any of the 4 borders
    const createRandomBlob = (isInitial = false): Blob => {
      const radius = 70 + Math.random() * 80;
      
      let x = Math.random() * width;
      let y = Math.random() * height;
      let vx = (Math.random() - 0.5) * 0.8;
      let vy = (Math.random() - 0.5) * 0.8;
      
      if (!isInitial) {
        // Choose one of the 4 borders randomly: 0 = top, 1 = bottom, 2 = left, 3 = right
        const border = Math.floor(Math.random() * 4);
        if (border === 0) { // Top border (enters moving down)
          x = Math.random() * width;
          y = -radius - 20;
          vx = (Math.random() - 0.5) * 0.5;
          vy = 0.2 + Math.random() * 0.4;
        } else if (border === 1) { // Bottom border (enters moving up)
          x = Math.random() * width;
          y = height + radius + 20;
          vx = (Math.random() - 0.5) * 0.5;
          vy = -0.2 - Math.random() * 0.4;
        } else if (border === 2) { // Left border (enters moving right)
          x = -radius - 20;
          y = Math.random() * height;
          vx = 0.2 + Math.random() * 0.4;
          vy = (Math.random() - 0.5) * 0.5;
        } else { // Right border (enters moving left)
          x = width + radius + 20;
          y = Math.random() * height;
          vx = -0.2 - Math.random() * 0.4;
          vy = (Math.random() - 0.5) * 0.5;
        }
      }
      
      return {
        x,
        y,
        vx,
        vy,
        radius: isInitial ? radius : 0, // start at size 0 if spawning in later
        baseRadius: radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        age: 0,
        lifespan: 6000 + Math.random() * 10000, // extremely long lifespan: ~1.6 to 4.4 minutes
        state: isInitial ? 'active' : 'spawning',
      };
    };

    // Initialize blobs
    const blobs: Blob[] = [];
    const numBlobs = ecoMode ? 10 : 22; // dense background population

    for (let i = 0; i < numBlobs; i++) {
      blobs.push(createRandomBlob(true));
    }

    // Additional interactive trail particles
    let trails: Array<{ x: number; y: number; vx: number; vy: number; radius: number; life: number }> = [];

    // Global Mouse Listeners (tracks cursor anywhere on the window, factoring in scroll offsets)
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX + window.scrollX;
      mouse.y = e.clientY + window.scrollY;
      mouse.active = true;
    };

    const handleGlobalMouseLeave = () => {
      const mouse = mouseRef.current;
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseleave', handleGlobalMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Track mouse velocity
      const mouse = mouseRef.current;
      mouse.vx = mouse.x - mouse.lastX;
      mouse.vy = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      // Spawn interactive splash particles on mouse movement
      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      if (mouse.active && speed > 3 && Math.random() < 0.3) {
        trails.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 3 + mouse.vx * 0.1,
          vy: (Math.random() - 0.5) * 3 + mouse.vy * 0.1,
          radius: 12 + Math.random() * 18,
          life: 0.85,
        });
      }

      // Update and draw blobs
      blobs.forEach((blob) => {
        blob.age++;

        // Add organic random walk (random drift forces)
        blob.vx += (Math.random() - 0.5) * 0.025;
        blob.vy += (Math.random() - 0.5) * 0.025;

        // Slow constant upward movement (buoyancy)
        blob.vy -= 0.002;

        // State Machine for organic spawning, active life, and dying/fading out
        if (blob.state === 'spawning') {
          blob.radius += (blob.baseRadius - blob.radius) * 0.02;
          if (blob.radius >= blob.baseRadius - 1) {
            blob.state = 'active';
          }
        } else if (blob.state === 'active') {
          if (blob.age > blob.lifespan) {
            blob.state = 'dying';
          }
        } else if (blob.state === 'dying') {
          blob.radius += (0 - blob.radius) * 0.025;
          if (blob.radius < 1) {
            const newBlob = createRandomBlob(false);
            Object.assign(blob, newBlob);
          }
        }

        // Screen wrapping (allows blobs to walk around infinitely and cross borders)
        if (blob.state === 'active') {
          const limit = blob.radius * 1.5;
          if (blob.x < -limit) {
            blob.x = width + limit;
          } else if (blob.x > width + limit) {
            blob.x = -limit;
          }
          if (blob.y < -limit) {
            blob.y = height + limit;
          } else if (blob.y > height + limit) {
            blob.y = -limit;
          }
        }

        // Mouse interaction (repel blobs, NO cursor sticking)
        if (mouse.active) {
          const dx = blob.x - mouse.x;
          const dy = blob.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = 140;

          if (dist < activeRadius) {
            const force = (activeRadius - dist) / activeRadius;
            const angle = Math.atan2(dy, dx);
            
            blob.vx += Math.cos(angle) * force * 0.06;
            blob.vy += Math.sin(angle) * force * 0.06;

            if (blob.state === 'active') {
              blob.radius = blob.baseRadius + force * 15;
              blob.age = 0; // Freeze / reset age while interacting
            }
          }
        }

        // Apply friction/drag
        blob.vx *= 0.985;
        blob.vy *= 0.985;

        // Move blob
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Draw blob with a radial gradient
        const grad = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, 'rgba(0, 112, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw trails
      trails = trails.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.012;

        if (p.life <= 0) return false;

        const grad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius
        );
        grad.addColorStop(0, `rgba(0, 112, 255, ${p.life * 0.7})`);
        grad.addColorStop(1, 'rgba(0, 112, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseleave', handleGlobalMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isClient, ecoMode]);

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        filter: 'blur(20px) contrast(24) brightness(1.15)',
        mixBlendMode: 'screen',
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block bg-black"
      />
    </div>
  );
}
