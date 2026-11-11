import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * One-time database setup: creates the participants and events tables from
 * supabase/schema.sql. Safe to run again (every statement is "if not exists").
 * Requires the admin password.
 */
export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || req.headers.get("x-admin-password") !== expected) {
    return NextResponse.json({ ok: false, reason: "Wrong or missing admin password." }, { status: 401 });
  }
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!url) return NextResponse.json({ ok: false, reason: "No POSTGRES_URL in the environment." }, { status: 503 });
  const sql = postgres(url, { ssl: "require", max: 1, prepare: false });
  try {
    const schema = await readFile(path.join(process.cwd(), "supabase/schema.sql"), "utf8");
    await sql.unsafe(schema);
    const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' and table_name in ('participants','events')`;
    return NextResponse.json({ ok: true, tables: tables.map((t) => t.table_name) });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: (e as Error).message }, { status: 500 });
  } finally {
    await sql.end({ timeout: 2 });
  }
}
