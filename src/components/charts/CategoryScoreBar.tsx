"use client";

import React from "react";
import { cn, getScoreColor } from "@/lib/utils";

export interface CategoryScoreItem {
  name: string;
  score: number;
  weight: number;
  notes?: string;
}

export function CategoryScoreBar({ categories }: { categories: CategoryScoreItem[] }) {
  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const style = getScoreColor(cat.score);

        return (
          <div key={cat.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {cat.name}
                <span className="text-[10px] text-muted-foreground font-mono">({cat.weight}% weight)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className={cn("font-bold font-mono", style.text)}>
                  {cat.score}/100
                </span>
              </div>
            </div>

            <div className="h-2.5 w-full bg-secondary/80 rounded-full overflow-hidden relative">
              <div
                className={cn("h-full rounded-full transition-all duration-500", style.bg, "bg-current")}
                style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
              />
            </div>

            {cat.notes && (
              <p className="text-[11px] text-muted-foreground leading-snug">{cat.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function EvidenceCoverageGauge({ coverage }: { coverage: number }) {
  const style = getScoreColor(coverage);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
      <div className={cn("w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm", style.border, style.text, style.bg)}>
        {coverage}%
      </div>
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-foreground">Evidence Coverage</div>
        <div className="text-[11px] text-muted-foreground">
          {coverage >= 80
            ? "High confidence: verified across repos & documents"
            : coverage >= 50
            ? "Moderate confidence: partial self-reported claims"
            : "Preliminary coverage: additional sources recommended"}
        </div>
      </div>
    </div>
  );
}
