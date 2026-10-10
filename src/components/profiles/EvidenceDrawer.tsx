"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, FileSearch, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StoredEvidence } from "@/lib/data/store";

export function EvidenceDrawer({
  evidences,
  className,
}: {
  evidences: StoredEvidence[];
  className?: string;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = evidences.filter((e) => {
    if (filter === "ALL") return true;
    return e.verificationStatus === filter;
  });

  const verifiedCount = evidences.filter((e) => e.verificationStatus === "SOURCE_OBSERVED").length;

  return (
    <div className={cn("bento-card p-6 md:p-8 space-y-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 dark:border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-foreground">
            Traceable Evidence Trail ({evidences.length})
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold hidden sm:inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {verifiedCount} Verified
          </span>
        </div>

        {/* Filter Pills with Count Indicators */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: "ALL", label: "All Evidence" },
            { id: "SOURCE_OBSERVED", label: "Source Observed" },
            { id: "USER_PROVIDED", label: "User Provided" },
            { id: "INFERRED", label: "Inferred" },
          ].map((item) => {
            const count =
              item.id === "ALL"
                ? evidences.length
                : evidences.filter((e) => e.verificationStatus === item.id).length;
            const isActive = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground dark:border-white/5 dark:bg-white/[0.02]"
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1 rounded",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-black/10 dark:bg-white/10 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-border/60 dark:divide-white/5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No evidence records found for the selected filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isObserved = item.verificationStatus === "SOURCE_OBSERVED";

            return (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.claimValue}
                      </span>
                      <Badge
                        variant={isObserved ? "success" : "secondary"}
                        className="text-[10px] uppercase font-mono tracking-wider"
                      >
                        {item.verificationStatus.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {Math.round(item.confidence * 100)}% Confidence
                      </span>
                    </div>

                    {item.repositoryRef && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <FileSearch className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">Reference: {item.repositoryRef}</span>
                      </div>
                    )}
                  </div>

                  <button className="text-muted-foreground group-hover:text-foreground p-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Excerpt & Provenance details */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-muted/40 border border-border/70 dark:border-white/5 dark:bg-white/[0.02] text-xs space-y-2.5">
                    {item.sourceExcerpt && (
                      <div>
                        <span className="font-semibold text-foreground text-[11px] block mb-1">
                          Source Excerpt / Artifact:
                        </span>
                        <blockquote className="border-l-2 border-primary/50 pl-2.5 text-muted-foreground italic font-mono text-[11px] leading-relaxed break-words">
                          "{item.sourceExcerpt}"
                        </blockquote>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40 dark:border-white/5 font-mono">
                      <span>Claim Type: {item.claimType}</span>
                      <span>Observed: {new Date(item.observedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
