"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { DeveloperComparisonMatrix } from "@/components/comparison/DeveloperComparisonMatrix";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GitCompare, RefreshCw, Users, ShieldCheck } from "lucide-react";
import type { StoredDeveloperProfile } from "@/lib/data/store";

function CompareContent() {
  const searchParams = useSearchParams();
  const urlIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const singleDev = searchParams.get("dev");

  const [allProfiles, setAllProfiles] = useState<StoredDeveloperProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    urlIds.length > 0 ? urlIds : singleDev ? [singleDev] : []
  );
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load available profiles
  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => {
        const profs = data.profiles || [];
        setAllProfiles(profs);

        // Pre-select first 2 if none selected
        if (selectedIds.length === 0 && profs.length >= 2) {
          setSelectedIds([profs[0].id, profs[1].id]);
        } else if (singleDev && profs.length >= 2 && selectedIds.length === 1) {
          const second = profs.find((p: any) => p.id !== singleDev);
          if (second) setSelectedIds([singleDev, second.id]);
        }
      });
  }, []);

  const runComparison = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);

    try {
      const res = await fetch("/api/compare/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerIds: selectedIds }),
      });

      if (res.ok) {
        const data = await res.json();
        setComparisonData(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length >= 2) {
      runComparison();
    }
  }, [selectedIds]);

  const toggleDeveloper = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Side-by-Side Evidence Comparison
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select 2 or more developers to compare technical skills, repo complexity, testing discipline, and engineering practices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={runComparison}
            disabled={selectedIds.length < 2 || loading}
            className="text-xs gap-1.5 shadow-sm"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
            Recalculate Diff
          </Button>
        </div>
      </div>

      {/* Candidate Selector Bar */}
      <Card className="border-border bg-card/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select Candidates to Compare ({selectedIds.length} chosen)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {allProfiles.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleDeveloper(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({p.skills.length} skills)
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Result Matrix */}
      {loading ? (
        <div className="py-24 text-center text-xs text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Analyzing developer skills, repos, and engineering practices...
        </div>
      ) : selectedIds.length < 2 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-2">
          <GitCompare className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Select at least 2 developers</p>
          <p className="text-xs text-muted-foreground">
            Choose two or more developers from the list above to generate a comprehensive comparison matrix.
          </p>
        </div>
      ) : comparisonData ? (
        <DeveloperComparisonMatrix
          profiles={comparisonData.profiles}
          skillMatrix={comparisonData.skillMatrix}
          engineeringMatrix={comparisonData.engineeringMatrix}
        />
      ) : null}
    </div>
  );
}

export default function DeveloperComparePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Compare Developers" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <Suspense fallback={<div className="py-12 text-center text-xs text-muted-foreground">Loading comparison view...</div>}>
          <CompareContent />
        </Suspense>
      </div>
    </div>
  );
}
