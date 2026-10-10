"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ProfileCard } from "@/components/profiles/ProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, GitCompare, Filter, Sparkles, RefreshCw } from "lucide-react";
import type { StoredDeveloperProfile } from "@/lib/data/store";

export default function ProfilesListPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<StoredDeveloperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const allSkills = Array.from(
    new Set(profiles.flatMap((p) => p.skills.map((s) => s.canonicalName)))
  ).slice(0, 8);

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.headline?.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.canonicalName.toLowerCase().includes(search.toLowerCase()));

    const matchesSkill =
      selectedSkill === "ALL" ||
      p.skills.some((s) => s.canonicalName.toLowerCase() === selectedSkill.toLowerCase());

    return matchesSearch && matchesSkill;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLaunchComparison = () => {
    if (selectedIds.length >= 2) {
      router.push(`/compare?ids=${selectedIds.join(",")}`);
    }
  };

  const handleDeleteProfile = (deletedId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== deletedId));
    setSelectedIds((prev) => prev.filter((id) => id !== deletedId));
  };

  const handleBatchDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} candidate profiles?`)) return;
    try {
      await Promise.all(
        selectedIds.map((id) => fetch(`/api/profiles/${id}`, { method: "DELETE" }))
      );
      setProfiles((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err: any) {
      alert("Failed to delete some profiles: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <AppHeader title="Developer Profiles" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-mono mb-2">
              <Sparkles className="w-3 h-3" /> Talent Evidence Pool
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Candidate Pool ({profiles.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select multiple developers to launch evidence-based comparisons or import new talent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profiles/new">
              <Button size="sm" className="shimmer-button text-xs gap-1.5 h-9 px-4">
                <Plus className="w-3.5 h-3.5" /> Ingest Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <Input
              placeholder="Search by name, title, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-zinc-900/60 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>

          {/* Skill Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => setSelectedSkill("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSkill === "ALL"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400/40"
                  : "bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              All Skills
            </button>
            {allSkills.map((sk) => (
              <button
                key={sk}
                onClick={() => setSelectedSkill(sk)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSkill === sk
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400/40"
                    : "bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Bar when 2+ chosen */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-900/60 to-zinc-950/80 border border-violet-500/40 text-xs text-foreground shadow-lg shadow-violet-500/10">
            <span className="font-semibold text-violet-300">
              {selectedIds.length} candidate{selectedIds.length > 1 ? "s" : ""} selected for comparison
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                className="h-8 text-xs gap-1.5 font-semibold"
              >
                Delete Selected ({selectedIds.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Selection
              </Button>
              <Button
                size="sm"
                disabled={selectedIds.length < 2}
                onClick={handleLaunchComparison}
                className="shimmer-button h-8 text-xs gap-1.5 shadow-sm px-4"
              >
                <GitCompare className="w-3.5 h-3.5" /> Compare Candidates ({selectedIds.length})
              </Button>
            </div>
          </div>
        )}

        {/* Profiles Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading developer profiles...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-3">
            <p className="text-sm text-muted-foreground">No developer profiles match the selected filters.</p>
            <Link href="/profiles/new">
              <Button size="sm" variant="outline" className="text-xs">
                Import First Developer
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isSelected={selectedIds.includes(profile.id)}
                onSelect={() => toggleSelect(profile.id)}
                onDelete={handleDeleteProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
