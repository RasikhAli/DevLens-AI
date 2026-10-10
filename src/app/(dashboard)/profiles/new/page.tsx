"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Github,
  Globe,
  Linkedin,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  ShieldCheck,
} from "lucide-react";

function NewProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "cv";

  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [githubInput, setGithubInput] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualSkills, setManualSkills] = useState("");

  // 1. CV Upload Handler
  const handleCvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", cvFile);

      const res = await fetch("/api/profiles/import/cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CV import failed");

      setStatusMessage({ type: "success", text: `Successfully parsed CV. Identified ${data.skillsFound} verified skills.` });
      setTimeout(() => router.push(`/profiles/${data.profile.id}`), 1200);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. GitHub Import Handler
  const handleGithubImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/profiles/import/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: githubInput.trim(),
          token: githubToken.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "GitHub import failed");

      setStatusMessage({ type: "success", text: `Successfully imported GitHub profile and inspected ${data.analyzedReposCount} repositories.` });
      setTimeout(() => router.push(`/profiles/${data.profile.id}`), 1200);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 3. Portfolio Import Handler
  const handlePortfolioImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioUrl.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/profiles/import/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: portfolioUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portfolio import failed");

      setStatusMessage({ type: "success", text: `Scraped portfolio safely with SSRF protections. Detected ${data.technologiesFound.length} technologies.` });
      setTimeout(() => router.push(`/profiles/${data.profile.id}`), 1200);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 4. Manual Profile Creation Handler
  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const skillsArray = manualSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualName.trim(),
          headline: manualTitle.trim() || "Software Engineer",
          skills: skillsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile creation failed");

      setStatusMessage({ type: "success", text: "Manual developer profile created successfully." });
      setTimeout(() => router.push(`/profiles/${data.profile.id}`), 1000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Source Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl border border-border bg-card/60">
        {[
          { id: "cv", label: "Upload CV", icon: Upload },
          { id: "github", label: "GitHub Profile", icon: Github },
          { id: "portfolio", label: "Portfolio URL", icon: Globe },
          { id: "linkedin", label: "LinkedIn Policy", icon: Linkedin },
          { id: "manual", label: "Manual Entry", icon: Edit3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setStatusMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status notification banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: CV UPLOAD */}
      {activeTab === "cv" && (
        <Card className="border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Upload CV or Resume Document</CardTitle>
            <CardDescription className="text-xs">
              Supports PDF (.pdf) and Microsoft Word (.docx) formats up to 10MB. Text is securely extracted and parsed into structured verified skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCvUpload} className="space-y-4">
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center transition-colors">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <input
                  type="file"
                  id="cv-upload"
                  accept=".pdf,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold"
                >
                  Select PDF or DOCX File
                </label>
                {cvFile && (
                  <div className="mt-3 text-xs font-mono font-medium text-primary">
                    Selected: {cvFile.name} ({Math.round(cvFile.size / 1024)} KB)
                  </div>
                )}
              </div>

              <Button type="submit" disabled={!cvFile || loading} className="w-full text-xs h-10 gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {loading ? "Processing Document & Extracting Evidence..." : "Parse CV & Ingest Developer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: GITHUB IMPORT */}
      {activeTab === "github" && (
        <Card className="border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Import Public GitHub Profile</CardTitle>
            <CardDescription className="text-xs">
              Inspects public repositories, primary languages, commit activity, automated test suites (Jest/PyTest/Vitest), and CI/CD pipelines (.github/workflows).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGithubImport} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  GitHub Username or Profile URL
                </label>
                <Input
                  placeholder="e.g. torvalds or https://github.com/torvalds"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    GitHub Personal Access Token (Optional)
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Expands limit from 60 to 5,000 req/hr
                  </span>
                </div>
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional for unlimited rate limit)"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Optional token to fetch all repositories without hitting public rate limits.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Full Repository & Engineering Analysis
                </div>
                <p>
                  Fetches all public repositories, inspects test frameworks (Jest/Vitest/PyTest), and detects CI/CD pipelines (.github/workflows) without dropping any repos.
                </p>
              </div>

              <Button type="submit" disabled={!githubInput.trim() || loading} className="w-full text-xs h-10 gap-2 font-semibold shimmer-button text-white shadow-sm">
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {loading ? "Inspecting Repositories & Workflows..." : "Import GitHub Data"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PORTFOLIO IMPORT */}
      {activeTab === "portfolio" && (
        <Card className="border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Import Portfolio Website</CardTitle>
            <CardDescription className="text-xs">
              Analyzes live portfolio sites with strict SSRF defense (blocking private networks and cloud metadata). Extracts project descriptions, demos, and tech stacks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePortfolioImport} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Portfolio Website URL
                </label>
                <Input
                  placeholder="https://developer-name.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button type="submit" disabled={!portfolioUrl.trim() || loading} className="w-full text-xs h-10 gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {loading ? "Scraping Safely & Extracting Tech Stack..." : "Analyze Portfolio Website"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: LINKEDIN POLICY */}
      {activeTab === "linkedin" && (
        <Card className="border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">LinkedIn Integration Transparency</CardTitle>
            <CardDescription className="text-xs">
              DevLens AI adheres strictly to legal, ethical, and API rate-limiting standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Direct Web Scraping is Prohibited
              </div>
              <p className="leading-relaxed">
                Automated scraping of arbitrary LinkedIn profiles is explicitly prohibited by LinkedIn terms of service and technical access controls. DevLens AI never fabricates or pretends to scrape LinkedIn profiles.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Recommended Verified Alternatives:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                <li>Export your LinkedIn profile to PDF (More → Save to PDF) and upload under the <strong>Upload CV</strong> tab.</li>
                <li>Link your public <strong>GitHub profile</strong> to verify real code and test suites.</li>
                <li>Manually enter your recent employment history with verifiable references.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button variant="outline" onClick={() => setActiveTab("cv")} className="text-xs">
                Switch to Upload CV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: MANUAL ENTRY */}
      {activeTab === "manual" && (
        <Card className="border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Manual Profile Creation</CardTitle>
            <CardDescription className="text-xs">
              Add candidate foundational details manually. You can attach additional evidence documents later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Developer Full Name</label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Headline / Role</label>
                <Input
                  placeholder="e.g. Senior Backend Engineer"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Skills (Comma separated)
                </label>
                <Input
                  placeholder="e.g. TypeScript, React, PostgreSQL, Docker, Go"
                  value={manualSkills}
                  onChange={(e) => setManualSkills(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Skills are automatically normalized using our canonical taxonomy (e.g. 'ts' → TypeScript).
                </p>
              </div>

              <Button type="submit" disabled={!manualName.trim() || loading} className="w-full text-xs h-10 gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {loading ? "Saving Profile..." : "Create Developer Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="New Developer Profile" />

      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Multi-Source Profile Ingestion
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Import candidate data from CVs, GitHub repositories, or live portfolio websites. Every source claim is traceable and auditable.
          </p>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading ingestion workflows...</div>}>
          <NewProfileForm />
        </Suspense>
      </div>
    </div>
  );
}
