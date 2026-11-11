import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function fetchAll(table: string, order: string) {
  const db = supabaseAdmin()!;
  const rows: Record<string, unknown>[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .order(order, { ascending: true })
      .range(from, from + page - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < page) break;
  }
  return rows;
}

/** Returns every participant and event. Requires the ADMIN_PASSWORD header. */
export async function GET(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, reason: "Set ADMIN_PASSWORD in Vercel to open the dashboard." },
      { status: 503 },
    );
  }
  if (req.headers.get("x-admin-password") !== expected) {
    return NextResponse.json({ ok: false, reason: "Wrong password." }, { status: 401 });
  }
  if (!supabaseAdmin()) {
    return NextResponse.json(
      { ok: false, reason: "Supabase is not connected yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }
  try {
    const [participants, events] = await Promise.all([
      fetchAll("participants", "created_at"),
      fetchAll("events", "id"),
    ]);
    return NextResponse.json({ ok: true, participants, events });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: (e as Error).message }, { status: 500 });
  }
}
