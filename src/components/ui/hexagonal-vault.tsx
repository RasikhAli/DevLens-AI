"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface HexagonalVaultProps {
  colors?: [string, string] | string[];
  cellSize?: number;
  lineWidth?: number;
  litWidth?: number;
  lattice?: number;
  glow?: number;
  glowRadius?: number;
  core?: number;
  vignette?: number;
  grain?: number;
  trailLength?: number;
  trailWidth?: number;
  follow?: number;
  flow?: number;
  shimmer?: number;
  speed?: number;
  pulseSpeed?: number;
  seed?: number;
  autoplay?: boolean;
  interactive?: boolean;
  clickPulses?: boolean;
  paused?: boolean;
  className?: string;
  themeMode?: "auto" | "light" | "dark";
  children?: React.ReactNode;
}

// Color presets tailored for website theme:
// Lightmode: graphite & deep slate (#64748B, #0F172A)
// Darkmode: mono luminous silver & obsidian white (#8A8A99, #FFFFFF)
const PRESET_GRAPHITE: [string, string] = ["#64748B", "#0F172A"];
const PRESET_MONO: [string, string] = ["#8A8A99", "#FFFFFF"];

export function HexagonalVault({
  colors,
  cellSize = 0.75,
  lineWidth = 0.3,
  litWidth = 2.4,
  lattice = 0.1,
  glow = 2.85,
  glowRadius = 0.5,
  core = 0.03,
  vignette = 0,
  grain = 0,
  trailLength = 1.7,
  trailWidth = 0.8,
  follow = 0.9,
  flow = 0.98,
  shimmer = 1.2,
  speed = 1.45,
  pulseSpeed = 0.55,
  seed = 0,
  autoplay = true,
  interactive = true,
  clickPulses = true,
  paused = false,
  className,
  themeMode = "auto",
  children,
}: HexagonalVaultProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(true);

  // Detect theme from DOM (graphite for light, mono for dark)
  useEffect(() => {
    if (themeMode === "dark") {
      setIsDark(true);
      return;
    }
    if (themeMode === "light") {
      setIsDark(false);
      return;
    }

    const checkTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [themeMode]);

  // Determine active colors: graphite for lightmode, mono for darkmode
  const activeColors: [string, string] = isDark
    ? (colors && colors.length >= 2 ? [colors[0], colors[1]] : PRESET_MONO)
    : (colors && colors.length >= 2 && colors !== PRESET_MONO ? [colors[0], colors[1]] : PRESET_GRAPHITE);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Offscreen canvas for pre-rendered static lattice (blazing fast 1-draw-call blit)
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");

    // Geometric constants
    const baseR = 24 * cellSize;
    const hexWidth = Math.sqrt(3) * baseR;
    const vertSpacing = 1.5 * baseR;
    const horizSpacing = hexWidth;

    // In ReactBits Hexagonal Vault, lattice controls the wall gap margin
    // lattice=0.10 means 10% wall margin (0.90x cell radius), creating crisp geometric borders
    const hexR = baseR * (lattice <= 0.5 ? Math.max(0.65, 1 - lattice * 0.4) : lattice);

    // Precalculate hexagon point offsets for fast drawing
    const hexOffsets: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      hexOffsets.push([hexR * Math.cos(angle), hexR * Math.sin(angle)]);
    }

    // Fast helper to trace hexagon
    const traceHex = (context: CanvasRenderingContext2D, cx: number, cy: number) => {
      context.moveTo(cx + hexOffsets[0][0], cy + hexOffsets[0][1]);
      for (let i = 1; i < 6; i++) {
        context.lineTo(cx + hexOffsets[i][0], cy + hexOffsets[i][1]);
      }
      context.closePath();
    };

    // Render static unlit lattice to offscreen canvas
    const renderStaticLattice = () => {
      if (!offscreenCtx || width === 0 || height === 0) return;

      offscreenCanvas.width = Math.floor(width * dpr);
      offscreenCanvas.height = Math.floor(height * dpr);
      offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
      offscreenCtx.scale(dpr, dpr);
      offscreenCtx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / horizSpacing) + 2;
      const rows = Math.ceil(height / vertSpacing) + 2;

      offscreenCtx.beginPath();
      for (let row = -1; row < rows; row++) {
        const cy = row * vertSpacing;
        const xOffset = (row % 2) * (horizSpacing / 2);
        for (let col = -1; col < cols; col++) {
          const cx = col * horizSpacing + xOffset;
          traceHex(offscreenCtx, cx, cy);
        }
      }

      offscreenCtx.lineWidth = Math.max(0.65, lineWidth);
      offscreenCtx.strokeStyle = isDark
        ? "rgba(138, 138, 153, 0.12)"
        : "rgba(100, 116, 139, 0.16)";
      offscreenCtx.stroke();
    };

    // Responsive pointer state
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false,
    };

    // Fast trail buffer
    interface TrailPoint {
      x: number;
      y: number;
      birth: number;
    }
    const trail: TrailPoint[] = [];
    const maxTrailDuration = Math.max(300, trailLength * 700);
    const maxTrailPoints = 16;

    // Click Pulses buffer (shockwave ripple on pointer click)
    interface ClickPulse {
      x: number;
      y: number;
      birth: number;
      maxRadius: number;
    }
    const pulseQueue: ClickPulse[] = [];

    // Resize handling
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      renderStaticLattice();
    };

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);
    updateDimensions();

    // IntersectionObserver to pause rendering when scrolled out of view
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Highly responsive pointer tracking
    const onPointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const inX = e.clientX >= rect.left && e.clientX <= rect.right;
      const inY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (inX && inY) {
        const tx = e.clientX - rect.left;
        const ty = e.clientY - rect.top;

        if (!mouse.isHovered || mouse.x < -500) {
          mouse.x = tx;
          mouse.y = ty;
        }

        mouse.targetX = tx;
        mouse.targetY = ty;
        mouse.isHovered = true;
      } else if (mouse.isHovered) {
        mouse.isHovered = false;
      }
    };

    // Click Pulses listener
    const onPointerDown = (e: MouseEvent) => {
      if (!interactive || !clickPulses) return;
      const rect = container.getBoundingClientRect();
      const inX = e.clientX >= rect.left && e.clientX <= rect.right;
      const inY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (inX && inY) {
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        pulseQueue.push({
          x: cx,
          y: cy,
          birth: performance.now(),
          maxRadius: Math.max(width, height) * 0.8,
        });
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    let startTime = performance.now();
    let lastTrailTime = 0;

    // Buttery-smooth 60 FPS Render Loop
    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || width === 0 || height === 0 || paused) return;

      const effectiveSpeed = autoplay ? speed : 0;
      const elapsed = (now - startTime) * 0.001 * effectiveSpeed;

      // Ultra-responsive mouse follow with tuned spring physics
      const followRate = Math.min(1, Math.max(0.18, 0.28 * follow));
      if (mouse.isHovered && interactive) {
        mouse.x += (mouse.targetX - mouse.x) * followRate;
        mouse.y += (mouse.targetY - mouse.y) * followRate;

        // Throttled trail recording
        if (now - lastTrailTime > 25) {
          const lastPoint = trail[trail.length - 1];
          const distFromLast = lastPoint
            ? Math.hypot(mouse.x - lastPoint.x, mouse.y - lastPoint.y)
            : 999;
          if (distFromLast > 5) {
            trail.push({ x: mouse.x, y: mouse.y, birth: now });
            if (trail.length > maxTrailPoints) {
              trail.shift();
            }
            lastTrailTime = now;
          }
        }
      } else if (autoplay) {
        // Idle ambient float around center when pointer is not over canvas
        const idleX = width / 2 + Math.cos(elapsed * 0.9 + seed) * (width * 0.22);
        const idleY = height / 2 + Math.sin(elapsed * 0.7 + seed) * (height * 0.18);
        mouse.x += (idleX - mouse.x) * (followRate * 0.45);
        mouse.y += (idleY - mouse.y) * (followRate * 0.45);
      }

      // Purge expired trail points
      while (trail.length > 0 && now - trail[0].birth > maxTrailDuration) {
        trail.shift();
      }

      // Update and purge click pulses
      const pulseSpeedMultiplier = 0.5 * speed;
      for (let pIdx = pulseQueue.length - 1; pIdx >= 0; pIdx--) {
        const p = pulseQueue[pIdx];
        const age = (now - p.birth) * 0.001;
        const currentR = age * 400 * pulseSpeedMultiplier;
        if (currentR > p.maxRadius) {
          pulseQueue.splice(pIdx, 1);
        }
      }

      // Clear main canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw pre-rendered static wireframe in a single instant GPU blit
      ctx.drawImage(offscreenCanvas, 0, 0, width, height);

      const [colorDim, colorBright] = activeColors;
      const litRadius = baseR * litWidth;
      const trailRadius = baseR * trailWidth * 2.4;
      const effectiveGlowRadius = litRadius * (glowRadius > 0 ? glowRadius * 2 : 1);

      // Pulse modulation (breathing rhythm from pulseSpeed)
      const pulseMod = 1 + Math.sin(elapsed * pulseSpeed * Math.PI * 2) * 0.14;

      // 2. High-performance radial glowing aura at cursor
      if (mouse.x > -100 && mouse.x < width + 100 && mouse.y > -100 && mouse.y < height + 100) {
        const auraGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          effectiveGlowRadius * pulseMod
        );
        const auraAlpha = (glow * 0.08) * pulseMod;
        if (isDark) {
          auraGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(0.42, auraAlpha * 1.6)})`);
          auraGrad.addColorStop(0.35, `rgba(138, 138, 153, ${Math.min(0.22, auraAlpha)})`);
          auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          auraGrad.addColorStop(0, `rgba(15, 23, 42, ${Math.min(0.24, auraAlpha * 1.3)})`);
          auraGrad.addColorStop(0.35, `rgba(100, 116, 139, ${Math.min(0.14, auraAlpha * 0.85)})`);
          auraGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        }
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, effectiveGlowRadius * pulseMod, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Spatially bounded highlight loop: check cells within cursor + trail + click pulses
      const minRow = Math.max(-1, Math.floor((mouse.y - effectiveGlowRadius * pulseMod) / vertSpacing));
      const maxRow = Math.min(Math.ceil(height / vertSpacing) + 1, Math.ceil((mouse.y + effectiveGlowRadius * pulseMod) / vertSpacing));

      const litRadiusSq = litRadius * litRadius * pulseMod * pulseMod;
      const trailRadiusSq = trailRadius * trailRadius;

      // Group highlights into passes for minimal stroke state switches
      const brightCells: [number, number, number][] = [];
      const dimCells: [number, number, number][] = [];
      const coreNodes: [number, number, number][] = [];

      for (let row = minRow; row <= maxRow; row++) {
        const cy = row * vertSpacing;
        const xOffset = (row % 2) * (horizSpacing / 2);

        const minCol = Math.max(-1, Math.floor((mouse.x - effectiveGlowRadius * pulseMod - xOffset) / horizSpacing));
        const maxCol = Math.min(Math.ceil(width / horizSpacing) + 1, Math.ceil((mouse.x + effectiveGlowRadius * pulseMod - xOffset) / horizSpacing));

        for (let col = minCol; col <= maxCol; col++) {
          const cx = col * horizSpacing + xOffset;

          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const distSq = dx * dx + dy * dy;

          let intensity = 0;
          if (distSq < litRadiusSq) {
            const norm = Math.sqrt(distSq) / (litRadius * pulseMod);
            intensity = Math.pow(Math.max(0, 1 - norm), 1.6);
          }

          // Trail influence (fast check)
          for (let i = trail.length - 1; i >= 0; i--) {
            const tp = trail[i];
            const tdx = cx - tp.x;
            const tdy = cy - tp.y;
            const tDistSq = tdx * tdx + tdy * tdy;
            if (tDistSq < trailRadiusSq) {
              const tAge = (now - tp.birth) / maxTrailDuration;
              const tWeight = Math.max(0, 1 - tAge);
              const tnorm = Math.sqrt(tDistSq) / trailRadius;
              const tIntensity = Math.pow(Math.max(0, 1 - tnorm), 1.8) * tWeight * 0.75;
              if (tIntensity > intensity) intensity = tIntensity;
            }
          }

          // Click Pulses shockwave ripple influence
          for (let pIdx = 0; pIdx < pulseQueue.length; pIdx++) {
            const p = pulseQueue[pIdx];
            const pAge = (now - p.birth) * 0.001;
            const currentR = pAge * 400 * pulseSpeedMultiplier;
            const pdx = cx - p.x;
            const pdy = cy - p.y;
            const pDist = Math.hypot(pdx, pdy);
            const distFromShockwave = Math.abs(pDist - currentR);
            if (distFromShockwave < 45) {
              const pulseIntensity = (1 - distFromShockwave / 45) * Math.max(0, 1 - currentR / p.maxRadius);
              if (pulseIntensity > intensity) {
                intensity = Math.max(intensity, pulseIntensity * 1.2);
              }
            }
          }

          // Ambient flow wave + shimmer modulation
          if (flow > 0 || shimmer > 0) {
            const wavePhase = (cx * 0.008 + cy * 0.006 - elapsed * 1.8 + seed) * flow;
            const shimmerMod = Math.sin(cx * 0.04 - cy * 0.03 + elapsed * 3.0 + seed * 2) * (shimmer * 0.12);
            const ambientWave = (Math.sin(wavePhase) * (flow * 0.08)) + shimmerMod;
            intensity = Math.min(1, Math.max(0, intensity + ambientWave));
          }

          if (intensity > 0.15) {
            if (intensity > 0.52) {
              brightCells.push([cx, cy, intensity]);
              if (core > 0) {
                coreNodes.push([cx, cy, intensity]);
              }
            } else {
              dimCells.push([cx, cy, intensity]);
            }
          }
        }
      }

      // Render dim highlight cells
      if (dimCells.length > 0) {
        ctx.beginPath();
        for (let i = 0; i < dimCells.length; i++) {
          traceHex(ctx, dimCells[i][0], dimCells[i][1]);
        }
        ctx.lineWidth = Math.max(1, lineWidth * 1.4);
        ctx.strokeStyle = colorDim;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
      }

      // Render bright highlight cells (closest to cursor)
      if (brightCells.length > 0) {
        ctx.beginPath();
        for (let i = 0; i < brightCells.length; i++) {
          traceHex(ctx, brightCells[i][0], brightCells[i][1]);
        }
        ctx.lineWidth = Math.max(1.2, lineWidth * 2.2);
        ctx.strokeStyle = colorBright;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      }

      // Render glowing central cores when core > 0
      if (coreNodes.length > 0 && core > 0) {
        const coreNodeRadius = Math.max(1.2, baseR * core * 3.5);
        ctx.beginPath();
        for (let i = 0; i < coreNodes.length; i++) {
          const [cx, cy, intensity] = coreNodes[i];
          const nodeR = coreNodeRadius * (0.7 + intensity * 0.5);
          ctx.moveTo(cx + nodeR, cy);
          ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        }
        ctx.fillStyle = colorBright;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }

      // 4. Vignette overlay if vignette > 0
      if (vignette > 0) {
        const vGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.3,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.7
        );
        vGrad.addColorStop(0, "rgba(0,0,0,0)");
        vGrad.addColorStop(1, `rgba(0,0,0,${Math.min(0.8, vignette)})`);
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = 1.0;
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [
    activeColors,
    cellSize,
    lineWidth,
    litWidth,
    lattice,
    glow,
    glowRadius,
    core,
    vignette,
    grain,
    trailLength,
    trailWidth,
    follow,
    flow,
    shimmer,
    speed,
    pulseSpeed,
    seed,
    autoplay,
    interactive,
    clickPulses,
    paused,
    isDark,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden w-full h-full", className)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block w-full h-full will-change-transform"
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

// Direct alias for `<M ... />` support
export const M = HexagonalVault;
