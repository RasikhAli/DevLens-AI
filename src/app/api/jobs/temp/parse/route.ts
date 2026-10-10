import { NextResponse } from "next/server";
import { aiProvider } from "@/lib/ai/provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description = body.description || "";

    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: "Job description is too short" }, { status: 400 });
    }

    const parsed = await aiProvider.parseJob(description);

    return NextResponse.json({ success: true, parsed });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to extract requirements" }, { status: 500 });
  }
}
