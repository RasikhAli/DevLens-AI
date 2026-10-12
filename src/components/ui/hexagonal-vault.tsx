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

// Tailored color presets:
// Lightmode: graphite (#64748B, #0F172A)
// Darkmode: mono (#8A8A99, #FFFFFF)
const PRESET_GRAPHITE: [string, string] = ["#64748B", "#0F172A"];
const PRESET_MONO: [string, string] = ["#8A8A99", "#FFFFFF"];

export function HexagonalVault({
  colors,
  cellSize = 0.75,
  lineWidth = 0.4,
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
  flow = 0,
  shimmer = 0,
  speed = 1.45,
  pulseSpeed = 0.55,
  seed = 0,
  autoplay = false,
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

  // Active colors: graphite for lightmode, mono for darkmode
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
    const hexR = baseR * (lattice <= 0.5 ? Math.max(0.65, 1 - lattice * 0.4) : lattice);

    // Precalculate hexagon point offsets for fast drawing
    const hexOffsets: [number, number][] = [];
    const hexAngles: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      hexAngles.push(angle);
      hexOffsets.push([hexR * Math.cos(angle), hexR * Math.sin(angle)]);
    }

    // Helper to trace a single hexagon
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

      offscreenCtx.lineWidth = Math.max(0.5, lineWidth);
      offscreenCtx.strokeStyle = isDark
        ? "rgba(138, 138, 153, 0.22)"
        : "rgba(100, 116, 139, 0.26)";
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

    // Trail buffer
    interface TrailPoint {
      x: number;
      y: number;
      birth: number;
    }
    const trail: TrailPoint[] = [];
    const maxTrailDuration = Math.max(300, trailLength * 700);
    const maxTrailPoints = 18;

    // Click Pulses buffer (shockwave ripples that spread outward across the entire screen)
    interface ClickPulse {
      x: number;
      y: number;
      birth: number;
      maxRadius: number;
      waveThickness: number;
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

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Responsive pointer tracking
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

    // Click Pulses trigger: fires on click and creates shockwave expanding across the full lattice
    let lastPulseTime = 0;
    const triggerPulseAt = (clientX: number, clientY: number) => {
      if (!interactive || !clickPulses) return;
      const rect = container.getBoundingClientRect();
      const inX = clientX >= rect.left && clientX <= rect.right;
      const inY = clientY >= rect.top && clientY <= rect.bottom;
      if (inX && inY) {
        const now = performance.now();
        // Prevent micro-duplicate events from bubbling
        if (now - lastPulseTime < 40) return;
        lastPulseTime = now;

        const cx = clientX - rect.left;
        const cy = clientY - rect.top;

        // Focus mouse coordinates immediately to ignite the clicked spot
        mouse.x = cx;
        mouse.y = cy;
        mouse.targetX = cx;
        mouse.targetY = cy;
        mouse.isHovered = true;

        const maxDist = Math.hypot(
          Math.max(cx, width - cx),
          Math.max(cy, height - cy)
        ) * 1.5;

        pulseQueue.push({
          x: cx,
          y: cy,
          birth: now,
          maxRadius: Math.max(650, maxDist),
          waveThickness: baseR * 3.2,
        });
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      triggerPulseAt(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    let startTime = performance.now();
    let lastTrailTime = 0;

    // 60+ FPS Cinematic Render Loop
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
        const idleX = width / 2 + Math.cos(elapsed * 0.9 + seed) * (width * 0.24);
        const idleY = height / 2 + Math.sin(elapsed * 0.7 + seed) * (height * 0.2);
        mouse.x += (idleX - mouse.x) * (followRate * 0.45);
        mouse.y += (idleY - mouse.y) * (followRate * 0.45);
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Purge expired trail points
      while (trail.length > 0 && now - trail[0].birth > maxTrailDuration) {
        trail.shift();
      }

      // Calculate pulse expansion velocity based on pulseSpeed and speed props
      const pulseVelocity = 640 * Math.max(0.6, pulseSpeed) * Math.max(0.8, speed * 0.75);

      // Update and purge completed click pulses
      for (let pIdx = pulseQueue.length - 1; pIdx >= 0; pIdx--) {
        const p = pulseQueue[pIdx];
        const age = (now - p.birth) * 0.001;
        const currentR = age * pulseVelocity;
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

      // 3. Render soft expanding wavefront glow rings and click origin halos for all active pulses
      for (let pIdx = 0; pIdx < pulseQueue.length; pIdx++) {
        const p = pulseQueue[pIdx];
        const age = (now - p.birth) * 0.001;
        const currentR = age * pulseVelocity;
        const waveProgress = currentR / p.maxRadius;
        const fadeOut = Math.max(0, 1 - Math.pow(waveProgress, 1.25));

        // Click origin flash/halo (fades out in 0.6s)
        const centerFade = Math.max(0, 1 - age * 1.6);
        if (centerFade > 0.01) {
          const originGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR * 3.2);
          originGrad.addColorStop(
            0,
            isDark ? `rgba(255, 255, 255, ${centerFade * 0.75})` : `rgba(124, 58, 237, ${centerFade * 0.6})`
          );
          originGrad.addColorStop(1, "transparent");
          ctx.fillStyle = originGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseR * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Circular expanding shockwave halo
        if (fadeOut > 0.01 && currentR > 5) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(2.5, baseR * 0.55);
          ctx.strokeStyle = isDark
            ? `rgba(167, 139, 250, ${fadeOut * 0.85})`
            : `rgba(124, 58, 237, ${fadeOut * 0.75})`;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. UNBOUNDED GRID ITERATION: Check all cells on the screen
      // This guarantees that expanding shockwaves spread seamlessly across the entire lattice without clipping!
      const cols = Math.ceil(width / horizSpacing) + 2;
      const rows = Math.ceil(height / vertSpacing) + 2;

      const litRadiusSq = litRadius * litRadius * pulseMod * pulseMod;
      const trailRadiusSq = trailRadius * trailRadius;

      // Group highlights into passes for minimal stroke state switches
      const brightCells: [number, number, number][] = [];
      const dimCells: [number, number, number][] = [];
      const coreNodes: [number, number, number][] = [];
      const sparkVertices: [number, number, number][] = []; // [vx, vy, alpha]

      for (let row = -1; row < rows; row++) {
        const cy = row * vertSpacing;
        const xOffset = (row % 2) * (horizSpacing / 2);

        for (let col = -1; col < cols; col++) {
          const cx = col * horizSpacing + xOffset;

          let intensity = 0;

          // A. Cursor light influence
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < litRadiusSq) {
            const norm = Math.sqrt(distSq) / (litRadius * pulseMod);
            intensity = Math.pow(Math.max(0, 1 - norm), 1.6);
          }

          // B. Trail points influence
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

          // C. Click Pulses shockwave ripple influence (sparks racing along edges and vertices)
          for (let pIdx = 0; pIdx < pulseQueue.length; pIdx++) {
            const p = pulseQueue[pIdx];
            const age = (now - p.birth) * 0.001;
            const currentR = age * pulseVelocity;
            const pdx = cx - p.x;
            const pdy = cy - p.y;
            const pDist = Math.hypot(pdx, pdy);
            const distFromWave = Math.abs(pDist - currentR);

            if (distFromWave < p.waveThickness) {
              const waveProgress = currentR / p.maxRadius;
              const fadeOut = Math.max(0, 1 - Math.pow(waveProgress, 1.25));
              const waveProfile = Math.cos((distFromWave / p.waveThickness) * (Math.PI / 2));
              const pulseIntensity = waveProfile * fadeOut * 3.8;

              if (pulseIntensity > intensity) {
                intensity = Math.min(1.0, Math.max(intensity, pulseIntensity));
              }

              // Collect vertex sparks along the expanding shockwave ring
              if (distFromWave < p.waveThickness * 0.65 && fadeOut > 0.05) {
                for (let k = 0; k < 6; k++) {
                  const vx = cx + hexOffsets[k][0];
                  const vy = cy + hexOffsets[k][1];
                  const vDist = Math.hypot(vx - p.x, vy - p.y);
                  const vDelta = Math.abs(vDist - currentR);
                  if (vDelta < p.waveThickness * 0.45) {
                    const sparkAlpha = (1 - vDelta / (p.waveThickness * 0.45)) * fadeOut;
                    sparkVertices.push([vx, vy, sparkAlpha]);
                  }
                }
              }
            }
          }

          // D. Ambient flow wave + shimmer modulation
          if (flow > 0 || shimmer > 0) {
            const wavePhase = (cx * 0.008 + cy * 0.006 - elapsed * 1.8 + seed) * flow;
            const shimmerMod = Math.sin(cx * 0.04 - cy * 0.03 + elapsed * 3.0 + seed * 2) * (shimmer * 0.12);
            const ambientWave = (Math.sin(wavePhase) * (flow * 0.08)) + shimmerMod;
            intensity = Math.min(1, Math.max(0, intensity + ambientWave));
          }

          // Filter into render groups
          if (intensity > 0.14) {
            if (intensity > 0.48) {
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

      // 5. Render dim highlight cells
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

      // 6. Render bright highlight cells (cursor focal point & shockwave ring perimeter)
      if (brightCells.length > 0) {
        ctx.beginPath();
        for (let i = 0; i < brightCells.length; i++) {
          traceHex(ctx, brightCells[i][0], brightCells[i][1]);
        }
        ctx.lineWidth = Math.max(1.5, litWidth);
        ctx.strokeStyle = colorBright;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      }

      // 7. Render sparks racing along the vertices & edges of the expanding shockwave
      if (sparkVertices.length > 0) {
        ctx.save();
        ctx.strokeStyle = colorBright;
        ctx.fillStyle = colorBright;

        // Draw small junction stars/sparks pointing along the 3 lattice angles
        ctx.beginPath();
        for (let i = 0; i < sparkVertices.length; i++) {
          const [vx, vy, alpha] = sparkVertices[i];
          if (alpha <= 0.05) continue;

          // Tiny center spark dot
          ctx.moveTo(vx + 1.6, vy);
          ctx.arc(vx, vy, 1.6, 0, Math.PI * 2);

          // 3-way radiating spark rays along honeycomb edges
          const rayLength = 3.6;
          for (let k = 0; k < 3; k++) {
            const angle = (Math.PI / 180) * (120 * k - 30);
            ctx.moveTo(vx, vy);
            ctx.lineTo(vx + Math.cos(angle) * rayLength, vy + Math.sin(angle) * rayLength);
          }
        }
        ctx.lineWidth = Math.max(1.2, lineWidth * 2);
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      // 8. Render glowing central cores when core > 0
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

      // 9. Vignette overlay if vignette > 0
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
