"use client";

import React from "react";
import { FileText, Github, Globe, Linkedin, Edit3, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { StoredProfileSource } from "@/lib/data/store";

export function ProfileSourceBadge({ source }: { source: StoredProfileSource }) {
  let icon = <FileText className="w-3 h-3" />;
  let label = "CV Document";

  if (source.sourceType === "GITHUB_PROFILE") {
    icon = <Github className="w-3 h-3" />;
    label = "GitHub";
  } else if (source.sourceType === "PORTFOLIO_WEBSITE") {
    icon = <Globe className="w-3 h-3" />;
    label = "Portfolio";
  } else if (source.sourceType === "LINKEDIN_PROFILE") {
    icon = <Linkedin className="w-3 h-3" />;
    label = "LinkedIn";
  } else if (source.sourceType === "MANUAL_ENTRY") {
    icon = <Edit3 className="w-3 h-3" />;
    label = "Manual";
  }

  const isCompleted = source.status === "COMPLETED";
  const isFailed = source.status === "FAILED";
  const isPending = source.status === "PENDING" || source.status === "PROCESSING";

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card/70 text-xs text-foreground shadow-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-medium">{label}</span>
      {isCompleted && (
        <span title="Completed & Verified">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" />
        </span>
      )}
      {isPending && (
        <span title="Processing...">
          <Clock className="w-3 h-3 text-amber-500 ml-1 animate-pulse" />
        </span>
      )}
      {isFailed && (
        <span title="Import failed">
          <AlertTriangle className="w-3 h-3 text-rose-500 ml-1" />
        </span>
      )}
    </div>
  );
}
