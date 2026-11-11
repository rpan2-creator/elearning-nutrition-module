import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_BATCH = 200;
const ALLOWED = [
  "client_ts",
  "participant_id",
  "condition",
  "phase",
  "screen",
  "event_type",
  "item_id",
  "kc",
  "response",
  "correct",
  "attempt",
  "duration_ms",
  "meta",
] as const;

export async function POST(req: Request) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, reason: "database not configured" });

  let body: { events?: Record<string, unknown>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400 });
  }
  const events = (body.events ?? []).slice(0, MAX_BATCH).map((e) => {
    const row: Record<string, unknown> = {};
    for (const k of ALLOWED) if (e[k] !== undefined) row[k] = e[k];
    if (typeof row.duration_ms === "number") row.duration_ms = Math.round(row.duration_ms);
    return row;
  });
  if (!events.length) return NextResponse.json({ ok: true, inserted: 0 });

  const { error } = await db.from("events").insert(events);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, inserted: events.length });
}
