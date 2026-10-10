import React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileBarChart2, Download, FileSpreadsheet, GitCompare, Calendar, ArrowRight } from "lucide-react";
import { dbStore } from "@/lib/data/store";
import { DeleteReportButton } from "@/components/reports/DeleteReportButton";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const comparisons = dbStore.getComparisons("demo-user-1");

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Reports & Export Archive" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Auditable Evaluation Reports ({comparisons.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download full CSV or JSON evidence breakdown reports for hiring team reviews, compliance, and deterministic audits.
          </p>
        </div>

        {comparisons.length === 0 ? (
          <div className="py-20 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-3">
            <FileBarChart2 className="w-10 h-10 text-muted-foreground mx-auto opacity-50 mb-1" />
            <p className="text-sm font-semibold text-foreground">No comparisons recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Run a candidate-to-job match or a developer-vs-developer comparison to automatically archive an audit report here.
            </p>
            <Link href="/jobs">
              <Button size="sm" className="text-xs mt-2">
                Go to Job Matching
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {comparisons.map((c) => (
              <Card key={c.id} className="border-border bg-card/80 hover:border-primary/40 transition-all">
                <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <FileBarChart2 className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base font-semibold">{c.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {c.comparisonType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      <span>{c.results.length} Candidates Evaluated</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a href={`/api/reports/${c.id}/export?format=csv`} download>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
                      </Button>
                    </a>
                    <a href={`/api/reports/${c.id}/export?format=json`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground">
                        Raw JSON
                      </Button>
                    </a>
                    <DeleteReportButton reportId={c.id} />
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-4 pt-1">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60 text-xs flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Top Ranked Candidate</span>
                      <div className="font-semibold text-foreground">
                        {c.results[0]?.developerName || "Candidate"} — Score: {c.results[0]?.totalScore}/100
                      </div>
                    </div>
                    {c.jobId && (
                      <Link href={`/jobs/${c.jobId}/match`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                          Re-open Match View <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
