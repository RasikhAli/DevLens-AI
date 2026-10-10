"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  children,
  colSpan = 1,
  rowSpan = 1,
  gradient = false,
}: {
  className?: string;
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  gradient?: boolean;
}) {
  const colSpanClasses = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3",
    4: "col-span-1 md:col-span-2 lg:col-span-4",
  };

  const rowSpanClasses = {
    1: "row-span-1",
    2: "row-span-1 md:row-span-2",
  };

  return (
    <div
      className={cn(
        "bento-card group p-6 flex flex-col justify-between overflow-hidden relative",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        gradient && "bg-gradient-to-br from-violet-100/70 via-white to-zinc-50 dark:from-violet-950/20 dark:via-zinc-900/60 dark:to-zinc-950/90",
        className
      )}
    >
      {/* Ambient hover light (React Bits / Obsidian style) */}
      <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-primary/10 blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        {children}
      </div>
    </div>
  );
}

/**
 * Spotlight Card tracking cursor position (React Bits / 21st.dev inspired)
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || !spotlightRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 60%)`;
  };

  const handleMouseEnter = () => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = "1";
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card/85 dark:border-white/10 dark:bg-zinc-950/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10",
        className
      )}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Shimmer Pulse Badge (Dark Bento / 21st.dev style)
 */
export function ShimmerBadge({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "neutral";
}) {
  const styles = {
    primary: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-violet-500/10",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-amber-500/10",
    neutral: "border-border/80 bg-muted/60 text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 shadow-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm",
        styles[variant]
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      {children}
    </span>
  );
}
