import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";
    const metrics = dbStore.getMetrics(ownerId);
    return NextResponse.json({ metrics, user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
