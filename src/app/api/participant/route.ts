import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UPDATABLE = [
  "pre_correct",
  "pre_total",
  "post_correct",
  "post_total",
  "pre_completed_at",
  "learn_completed_at",
  "post_completed_at",
] as const;

/** POST creates a participant; PATCH records scores and completion times. */
export async function POST(req: Request) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, reason: "database not configured" });
  const b = await req.json();
  const { error } = await db.from("participants").upsert({
    id: b.id,
    condition: b.condition,
    test_order: b.order,
    background: b.background ?? null,
    consent: Boolean(b.consent),
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  });
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, reason: "database not configured" });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ ok: false, reason: "missing id" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  for (const k of UPDATABLE) if (b[k] !== undefined) patch[k] = b[k];
  const { error } = await db.from("participants").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
