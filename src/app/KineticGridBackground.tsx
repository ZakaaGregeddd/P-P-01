"use client";

import React, { useEffect, useRef } from "react";

interface GridNode {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Pulse {
  type: "v" | "h";
  pos: number;
  start: number;
  end: number;
  progress: number;
  speed: number;
  color: string;
  glowColor: string;
  width: number;
}

export default function KineticGridBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const trailRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const scrollRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Component configurations matching blueprint aesthetic
    const GAP = 48; // Spacing in px
    const R = 220; // Attraction radius in px
    const PULL = 1.6; // Attraction strength parameter
    const lineColor = "rgba(0, 112, 255, 0.16)";
    const dotColor = "rgba(229, 226, 225, 0.3)";
    const trailColor = "rgba(0, 112, 255, 0.65)";

    let W = 1;
    let H = 1;
    let viewW = 1;
    let viewH = 1;
    let cols: GridNode[][] = [];
    let dots: GridNode[] = [];
    let pulses: Pulse[] = [];
    const maxPulses = 6;

    const build = () => {
      // Get full scrollable page document boundaries
      const docW = Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
        window.innerWidth
      );
      const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );

      W = docW;
      H = docH;
      viewW = window.innerWidth;
      viewH = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      // The canvas stays sized to the viewport, fixed in place
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      canvas.style.width = viewW + "px";
      canvas.style.height = viewH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = [];
      dots = [];
      const nCols = Math.floor(W / GAP) + 2;
      const nRows = Math.floor(H / GAP) + 2;
      for (let c = 0; c < nCols; c++) {
        const col: GridNode[] = [];
        for (let rIdx = 0; rIdx < nRows; rIdx++) {
          const hx = c * GAP;
          const hy = rIdx * GAP;
          const d = { hx, hy, x: hx, y: hy, vx: 0, vy: 0 };
          col.push(d);
          dots.push(d);
        }
        cols.push(col);
      }
    };

    build();

    // Dynamically update grid dimensions when content height changes (ResizeObserver)
    const ro =
      typeof ResizeObserver !== "undefined" && document.body
        ? new ResizeObserver(() => {
            build();
          })
        : null;
    if (ro && document.body) {
      ro.observe(document.body);
    }

    const handleWindowResize = () => {
      build();
    };
    window.addEventListener("resize", handleWindowResize);

    // Track scroll offsets
    const handleScroll = () => {
      scrollRef.current.x = window.scrollX || window.pageXOffset;
      scrollRef.current.y = window.scrollY || window.pageYOffset;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial fetch

    // Track cursor movements globally and offset to page coordinates
    const setMouse = (clientX: number, clientY: number) => {
      const mx = clientX + scrollRef.current.x;
      const my = clientY + scrollRef.current.y;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;
      mouseRef.current.active = true;

      const now = performance.now();
      const trail = trailRef.current;
      trail.push({ x: mx, y: my, t: now });
      if (trail.length > 50) trail.shift();
    };

    const onMove = (e: MouseEvent) => setMouse(e.clientX, e.clientY);
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setMouse(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);

    // Create ambient energy pulses in page space
    const createPulse = (): Pulse => {
      const type = Math.random() > 0.5 ? "v" : "h";
      const isVertical = type === "v";
      const maxGridLines = Math.floor((isVertical ? W : H) / GAP);
      const gridIndex = Math.floor(Math.random() * maxGridLines);
      const pos = gridIndex * GAP;
      const length = Math.random() * 200 + 150;
      const speed = Math.random() * 0.007 + 0.003;

      return {
        type,
        pos,
        start: -length,
        end: (isVertical ? H : W) + length,
        progress: 0,
        speed,
        color: Math.random() > 0.5 ? "rgba(0, 112, 255, 0.35)" : "rgba(86, 141, 255, 0.5)",
        glowColor: "rgba(0, 112, 255, 0.7)",
        width: Math.random() > 0.5 ? 1 : 1.5,
      };
    };

    let raf = 0;
    const frame = () => {
      const m = mouseRef.current;
      const sx = scrollRef.current.x;
      const sy = scrollRef.current.y;

      ctx.clearRect(0, 0, viewW, viewH);

      // 1. Update dot physics using absolute page space positions
      for (const d of dots) {
        let ax = (d.hx - d.x) * 0.07;
        let ay = (d.hy - d.y) * 0.07;

        if (m.active) {
          const dx = m.x - d.x;
          const dy = m.y - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < R && dist > 0.001) {
            const f = (1 - dist / R) * PULL;
            ax += (dx / dist) * f;
            ay += (dy / dist) * f;
          }
        }
        d.vx = (d.vx + ax) * 0.8;
        d.vy = (d.vy + ay) * 0.8;
        d.x += d.vx;
        d.y += d.vy;
      }

      // 2. Draw blueprint grid mesh lines (with scroll offsets and frustum culling)
      for (let c = 0; c < cols.length; c++) {
        for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
          const d = cols[c][rIdx];
          const right = cols[c + 1]?.[rIdx];
          const down = cols[c]?.[rIdx + 1];

          // Compute viewport rendering coordinates
          const vx1 = d.x - sx;
          const vy1 = d.y - sy;

          // Frustum check: skip if node is way off screen
          if (vx1 < -GAP * 2 || vx1 > viewW + GAP * 2 || vy1 < -GAP * 2 || vy1 > viewH + GAP * 2) {
            continue;
          }

          const prox = m.active
            ? Math.max(0, 1 - Math.sqrt((m.x - d.x) ** 2 + (m.y - d.y) ** 2) / R)
            : 0;

          if (right) {
            const vx2 = right.x - sx;
            const vy2 = right.y - sy;
            ctx.globalAlpha = 0.06 + prox * 0.74;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5 + prox * 1.3;
            ctx.beginPath();
            ctx.moveTo(vx1, vy1);
            ctx.lineTo(vx2, vy2);
            ctx.stroke();
          }

          if (down) {
            const vx2 = down.x - sx;
            const vy2 = down.y - sy;
            ctx.globalAlpha = 0.06 + prox * 0.74;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5 + prox * 1.3;
            ctx.beginPath();
            ctx.moveTo(vx1, vy1);
            ctx.lineTo(vx2, vy2);
            ctx.stroke();
          }
        }
      }

      // 3. Draw grid dots (with scroll offsets and frustum culling)
      for (const d of dots) {
        const vx = d.x - sx;
        const vy = d.y - sy;

        if (vx < -GAP || vx > viewW + GAP || vy < -GAP || vy > viewH + GAP) {
          continue;
        }

        const prox = m.active
          ? Math.max(0, 1 - Math.sqrt((m.x - d.x) ** 2 + (m.y - d.y) ** 2) / R)
          : 0;

        ctx.globalAlpha = 0.18 + prox * 0.82;
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(vx, vy, 0.8 + prox * 2.0, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 4. Draw cursor trail lines (with scroll offset)
      const now = performance.now();
      const tr = trailRef.current;
      if (tr.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < tr.length; i++) {
          const a = tr[i - 1];
          const b = tr[i];
          const age = now - b.t;
          if (age > 240) continue;

          ctx.globalAlpha = Math.max(0, 1 - age / 240) * 0.75;
          ctx.strokeStyle = trailColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(a.x - sx, a.y - sy);
          ctx.lineTo(b.x - sx, b.y - sy);
          ctx.stroke();
        }
      }

      // 5. Draw and update ambient energy pulses (with scroll offset)
      if (pulses.length < maxPulses && Math.random() < 0.012) {
        pulses.push(createPulse());
      }

      pulses.forEach((p) => {
        p.progress += p.speed;
        const currentPos = p.start + (p.end - p.start) * p.progress;

        // Render positions adjusted for scroll
        const rPos = p.type === "v" ? p.pos - sx : p.pos - sy;
        const rStart = currentPos - 100 - (p.type === "v" ? sy : sx);
        const rEnd = currentPos + 100 - (p.type === "v" ? sy : sx);

        ctx.beginPath();
        const grad = ctx.createLinearGradient(
          p.type === "v" ? rPos : rStart,
          p.type === "v" ? rStart : rPos,
          p.type === "v" ? rPos : rEnd,
          p.type === "v" ? rEnd : rPos
        );
        grad.addColorStop(0, "rgba(0, 112, 255, 0)");
        grad.addColorStop(0.5, p.color);
        grad.addColorStop(1, "rgba(0, 112, 255, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = p.width;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.glowColor;

        if (p.type === "v") {
          ctx.moveTo(rPos, rStart);
          ctx.lineTo(rPos, rEnd);
        } else {
          ctx.moveTo(rStart, rPos);
          ctx.lineTo(rEnd, rPos);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      pulses = pulses.filter((p) => p.progress < 1);
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40 mix-blend-screen"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
