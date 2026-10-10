"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfileSourceBadge } from "./ProfileSourceBadge";
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  GitCompare,
  FolderGit2,
  CheckCircle,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import type { StoredDeveloperProfile } from "@/lib/data/store";

export function ProfileCard({
  profile,
  isSelected,
  onSelect,
  onDelete,
}: {
  profile: StoredDeveloperProfile;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const verifiedCount = profile.skills.filter((s) => s.evidenceStatus === "VERIFIED").length;
  const testedProjectsCount = profile.projects.filter((p) => p.hasTests).length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(profile.id);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete profile");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete candidate profile");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div
      className={`bento-card group flex flex-col justify-between p-5 transition-all duration-300 relative ${
        isSelected
          ? "ring-2 ring-primary border-primary/80 bg-violet-950/20 shadow-xl shadow-violet-500/10"
          : "hover:border-violet-500/40"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-600/10 blur-2xl group-hover:bg-violet-600/20 transition-all duration-500 pointer-events-none" />

      <div className="space-y-4">
        {/* Header with Title, Verification and Selection / Delete */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profiles/${profile.id}`}
                className="font-bold text-base text-foreground group-hover:text-primary transition-colors tracking-tight"
              >
                {profile.name}
              </Link>
              {verifiedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> {verifiedCount} Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {profile.headline || "Software Engineer"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                aria-label={`Select ${profile.name}`}
                className="w-4 h-4 rounded border-border bg-background dark:border-white/20 dark:bg-zinc-900 text-primary focus:ring-primary cursor-pointer mt-0.5"
              />
            )}
          </div>
        </div>

        {/* Location & Sources */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-0.5">
          {profile.location && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1 flex-wrap">
            {profile.sources.map((s) => (
              <ProfileSourceBadge key={s.id} source={s} />
            ))}
          </div>
        </div>

        {/* Repositories & Engineering stats Bento chip */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/80 dark:bg-white/[0.03] dark:border-white/5 text-center font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Repos</span>
            <span className="font-bold text-xs text-foreground flex items-center justify-center gap-1">
              <FolderGit2 className="w-3 h-3 text-primary" /> {profile.projects.length}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Tests</span>
            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" /> {testedProjectsCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Evidence</span>
            <span className="font-bold text-xs text-violet-600 dark:text-violet-400">
              {profile.evidences.length}
            </span>
          </div>
        </div>

        {/* Skills Tag Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Primary Skills</span>
            <span className="font-mono text-[10px]">{profile.skills.length} total</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {profile.skills.slice(0, 5).map((sk) => (
              <span
                key={sk.id}
                className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-colors ${
                  sk.evidenceStatus === "VERIFIED"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted/70 border-border text-foreground dark:bg-white/[0.04] dark:border-white/10 dark:text-zinc-300"
                }`}
              >
                {sk.canonicalName}
              </span>
            ))}
            {profile.skills.length > 5 && (
              <span className="text-[10px] text-muted-foreground font-mono pl-0.5">
                +{profile.skills.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Profile Completeness bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Completeness</span>
            <span className="font-mono font-semibold text-foreground">{Math.round(profile.completeness)}%</span>
          </div>
          <Progress value={profile.completeness} className="h-1.5 bg-muted dark:bg-zinc-800" />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-4 border-t border-border/80 dark:border-white/10 flex items-center justify-between gap-2">
        <Link href={`/profiles/${profile.id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8 gap-1.5 bg-transparent border-border dark:border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10"
          >
            View Dossier ({profile.projects.length}) <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>

        <Link href={`/compare?dev=${profile.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
            title="Compare Developer"
          >
            <GitCompare className="w-3.5 h-3.5" />
          </Button>
        </Link>

        {/* Delete Candidate Action */}
        {showConfirm ? (
          <div className="flex items-center gap-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 px-2 text-[10px] gap-1 font-semibold"
              title="Confirm Permanent Deletion"
            >
              {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelDelete}
              className="h-8 w-7 text-muted-foreground hover:text-foreground"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
            title="Delete Candidate Profile"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
