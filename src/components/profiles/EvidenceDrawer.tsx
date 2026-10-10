"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, ExternalLink, FileSearch, CheckCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { StoredEvidence } from "@/lib/data/store";

export function EvidenceDrawer({ evidences }: { evidences: StoredEvidence[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = evidences.filter((e) => {
    if (filter === "ALL") return true;
    return e.verificationStatus === filter;
  });

  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <CardTitle className="text-base font-semibold">
              Traceable Evidence Trail ({evidences.length})
            </CardTitle>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {["ALL", "SOURCE_OBSERVED", "USER_PROVIDED", "INFERRED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
                  filter === st
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 divide-y divide-border/60">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No evidence records found for the selected filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isObserved = item.verificationStatus === "SOURCE_OBSERVED";

            return (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
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
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <FileSearch className="w-3 h-3 text-primary" />
                        <span>Reference: {item.repositoryRef}</span>
                      </div>
                    )}
                  </div>

                  <button className="text-muted-foreground group-hover:text-foreground p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Excerpt & Provenance details */}
                {isExpanded && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-2">
                    {item.sourceExcerpt && (
                      <div>
                        <span className="font-semibold text-foreground text-[11px] block mb-1">
                          Source Excerpt / Artifact:
                        </span>
                        <blockquote className="border-l-2 border-primary/50 pl-2 text-muted-foreground italic font-mono text-[11px]">
                          "{item.sourceExcerpt}"
                        </blockquote>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>Claim Type: {item.claimType}</span>
                      <span>Observed: {new Date(item.observedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
