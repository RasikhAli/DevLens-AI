"use client";

import React, { useState, useMemo } from "react";
import { type StoredProject } from "@/lib/data/store";
import {
  Search,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Layers,
  Star,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileRepositoryExplorerProps {
  projects: StoredProject[];
}

export function ProfileRepositoryExplorer({ projects }: ProfileRepositoryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL");
  const [filterTestsOnly, setFilterTestsOnly] = useState(false);
  const [filterCIOnly, setFilterCIOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"complexity" | "stars" | "name">("complexity");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Extract unique languages and counts
  const languageOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const lang = p.primaryLanguage || (p.technologies && p.technologies[0]);
      if (lang && lang.trim()) {
        counts[lang] = (counts[lang] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  // Filter and sort repositories
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = p.name.toLowerCase().includes(q);
          const descMatch = p.description?.toLowerCase().includes(q);
          const techMatch = p.technologies?.some((t) => t.toLowerCase().includes(q));
          if (!nameMatch && !descMatch && !techMatch) return false;
        }

        // Language filter
        if (selectedLanguage !== "ALL") {
          const lang = p.primaryLanguage || (p.technologies && p.technologies[0]);
          if (lang?.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
        }

        // Test filter
        if (filterTestsOnly && !p.hasTests) return false;

        // CI filter
        if (filterCIOnly && !p.hasCI) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "complexity") {
          return (b.complexityScore || 50) - (a.complexityScore || 50);
        }
        if (sortBy === "stars") {
          return (b.starsCount || 0) - (a.starsCount || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [projects, searchQuery, selectedLanguage, filterTestsOnly, filterCIOnly, sortBy]);

  // Flagship spotlight (top 3 highest complexity with description)
  const flagshipProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => (b.complexityScore || 50) - (a.complexityScore || 50))
      .slice(0, 3);
  }, [projects]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  return (
    <div className="bento-card p-6 md:p-8 space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 dark:border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-violet-500 dark:text-violet-400" />
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Interactive Repository Explorer ({projects.length})
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search, filter, and inspect verified test frameworks, CI pipelines, and architecture scores across all ingested codebases.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-muted/60 border border-border/70 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP FLAGSHIP SHOWCASE (TOP 3) */}
      {!searchQuery && selectedLanguage === "ALL" && !filterTestsOnly && !filterCIOnly && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Flagship Core Codebases (Highest Technical Complexity)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flagshipProjects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/[0.03] dark:bg-violet-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {p.name}
                    </span>
                    {p.repositoryUrl && (
                      <a
                        href={p.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-500 hover:text-violet-400 p-0.5"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {p.description || "Production-grade repository with automated analysis indicators."}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Complexity Index</span>
                    <span className="font-bold text-violet-500 dark:text-violet-400">
                      {p.complexityScore || 75}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.primaryLanguage && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/80 text-foreground font-semibold">
                        {p.primaryLanguage}
                      </span>
                    )}
                    {p.hasTests && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold">
                        ✓ Tests
                      </span>
                    )}
                    {p.hasCI && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 font-bold">
                        ✓ CI/CD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH & FILTER CONTROLS TOOLBAR */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder={`Search across ${projects.length} repositories by name, language, or topic...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 text-xs bg-background/60"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="complexity">Highest Complexity</option>
              <option value="stars">Most Starred</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills (Languages & Verification) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => {
              setSelectedLanguage("ALL");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedLanguage === "ALL"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Repos ({projects.length})
          </button>

          {languageOptions.slice(0, 6).map(([lang, count]) => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLanguage(lang);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLanguage === lang
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang} ({count})
            </button>
          ))}

          <div className="h-4 w-px bg-border/80 mx-1 shrink-0" />

          <button
            onClick={() => {
              setFilterTestsOnly(!filterTestsOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              filterTestsOnly
                ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            ✓ Has Tests Only
          </button>

          <button
            onClick={() => {
              setFilterCIOnly(!filterCIOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              filterCIOnly
                ? "bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            ✓ CI/CD Active
          </button>
        </div>
      </div>

      {/* FILTER RESULTS COUNTER */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
        <span>
          Showing <strong className="text-foreground">{filteredProjects.length}</strong> matching repositories
          {selectedLanguage !== "ALL" && ` in ${selectedLanguage}`}
          {filterTestsOnly && " with automated tests"}
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* REPOSITORY CARDS VIEW: GRID */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProjects.map((proj) => (
            <div
              key={proj.id}
              className="group p-4 rounded-xl border border-border/80 bg-card/80 hover:bg-muted/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] hover:border-violet-500/40 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-sm dark:shadow-none"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-foreground group-hover:text-violet-500 transition-colors tracking-tight line-clamp-1">
                    {proj.name}
                  </span>
                  {proj.repositoryUrl && (
                    <a
                      href={proj.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground p-0.5 shrink-0"
                      title="Open Repository on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
                  {proj.description || "Active public repository analyzed for code structure and testing."}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/70 dark:border-white/5">
                {/* Tech tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {proj.technologies && proj.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted border border-border text-foreground dark:bg-white/[0.04] dark:border-white/10 dark:text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                  {proj.technologies && proj.technologies.length > 3 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      +{proj.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Evidence badges and index */}
                <div className="flex items-center justify-between text-[10px] pt-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    {proj.hasTests ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Tests
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">No tests</span>
                    )}

                    {proj.hasCI && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold">
                        ✓ CI
                      </span>
                    )}
                  </div>

                  {proj.complexityScore && (
                    <span className="text-muted-foreground font-semibold">
                      Index: <strong className="text-foreground">{proj.complexityScore}/100</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPOSITORY TABLE VIEW */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-border/80 dark:border-white/10 overflow-hidden bg-card/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/70 dark:border-white/10 font-mono text-[11px] text-muted-foreground">
                <tr>
                  <th className="p-3 pl-4">Repository Name</th>
                  <th className="p-3">Primary Tech</th>
                  <th className="p-3">Test Discipline</th>
                  <th className="p-3">CI/CD Pipeline</th>
                  <th className="p-3">Complexity</th>
                  <th className="p-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-white/5 font-mono">
                {paginatedProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 pl-4 font-sans font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-3.5 h-3.5 text-violet-500" />
                        <span>{p.name}</span>
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] text-foreground font-medium">
                        {p.primaryLanguage || "Multi-stack"}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.hasTests ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Tests
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">Unverified</span>
                      )}
                    </td>
                    <td className="p-3">
                      {p.hasCI ? (
                        <span className="text-cyan-500 font-semibold flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> GitHub Actions
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">None</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      {p.complexityScore || 50}/100
                    </td>
                    <td className="p-3 pr-4 text-right font-sans">
                      {p.repositoryUrl && (
                        <a
                          href={p.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/70 dark:border-white/5 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-xs gap-1.5 h-8"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </Button>

          <span className="text-xs font-mono text-muted-foreground">
            Page <strong className="text-foreground">{currentPage}</strong> of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs gap-1.5 h-8"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
