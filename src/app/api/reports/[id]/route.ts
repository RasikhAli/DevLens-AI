import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comparison = dbStore.getComparisonById(id);

    if (!comparison) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report: comparison });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch report" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    if (user && user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized: View-only users cannot delete audit reports." }, { status: 403 });
    }

    const deleted = dbStore.deleteComparison(id);
    if (!deleted) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete report" }, { status: 500 });
  }
}
