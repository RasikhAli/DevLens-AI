import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const comparison = dbStore.getComparisonById(id);
    if (!comparison) {
      return NextResponse.json({ error: "Report / Comparison not found" }, { status: 404 });
    }

    if (format === "json") {
      return NextResponse.json({ report: comparison });
    }

    // Generate CSV format
    const headers = [
      "Rank",
      "Candidate Name",
      "Total Score (/100)",
      "Evidence Coverage (%)",
      "Tech Skills Score",
      "Project Relevance Score",
      "Experience Alignment Score",
      "Engineering Practices Score",
      "Key Strengths",
      "Identified Gaps",
    ];

    const rows = comparison.results.map((r) => {
      const cat = r.categoryScores || {};
      const techScore = cat.techSkills?.score ?? "";
      const projScore = cat.projectRelevance?.score ?? "";
      const expScore = cat.experienceAlignment?.score ?? "";
      const engScore = cat.engineeringPractices?.score ?? "";

      const escape = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;

      return [
        r.ranking,
        escape(r.developerName),
        r.totalScore,
        `${r.evidenceCoverage}%`,
        techScore,
        projScore,
        expScore,
        engScore,
        escape(r.strengths.join("; ")),
        escape(r.gaps.join("; ")),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="devlens_report_${id}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Export failed" }, { status: 500 });
  }
}
