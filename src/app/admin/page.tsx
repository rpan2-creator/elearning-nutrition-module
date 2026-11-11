"use client";

import { useEffect, useMemo, useState } from "react";
import { KCS } from "@/content/kcs";

/* Pre/post colors validated for CVD separation and contrast (dataviz validator). */
const PRE = "#3f7fd0";
const POST = "#2e7d4f";

interface Participant {
  id: string;
  created_at: string;
  condition: "predict" | "told";
  test_order: string;
  background: string | null;
  pre_correct: number | null;
  pre_total: number | null;
  post_correct: number | null;
  post_total: number | null;
  pre_completed_at: string | null;
  learn_completed_at: string | null;
  post_completed_at: string | null;
}
interface Event {
  id: number;
  client_ts: string | null;
  created_at: string;
  participant_id: string;
  condition: string | null;
  phase: string;
  screen: string;
  event_type: string;
  item_id: string | null;
  kc: string | null;
  response: unknown;
  correct: boolean | null;
  attempt: number | null;
  duration_ms: number | null;
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const secs = (ms: number | null) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`);
const minutes = (a: string | null, b: string | null) =>
  a && b ? `${((new Date(b).getTime() - new Date(a).getTime()) / 60000).toFixed(1)} min` : "—";

function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

type Tab = "overview" | "kc" | "items" | "people";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<{ participants: Participant[]; events: Event[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState<string | null>(null);

  async function load(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin", { headers: { "x-admin-password": pw }, cache: "no-store" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.reason);
      setData({ participants: j.participants, events: j.events });
      try {
        sessionStorage.setItem("nm-admin", pw);
      } catch {}
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const pw = sessionStorage.getItem("nm-admin");
      if (pw) {
        setPassword(pw);
        load(pw);
      }
    } catch {}
  }, []);

  if (!data) {
    return (
      <main className="mx-auto max-w-md px-5 py-24">
        <h1 className="font-display text-[40px] font-bold leading-none">Research data</h1>
        <p className="mt-3 text-[15px] text-muted">For the project team. Enter the dashboard password set in Vercel.</p>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Dashboard password"
            className="flex-1 rounded-full border border-line bg-tray px-4 py-2.5 text-[15px] focus:border-ink focus:outline-none"
          />
          <button className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-white" disabled={loading}>
            {loading ? "Loading…" : "Open"}
          </button>
        </form>
        {error && <p className="mt-4 rounded-2xl bg-tray p-4 text-[14px] text-wrong">{error}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[40px] font-bold leading-none">Research data</h1>
          <p className="mt-2 text-[14px] text-muted">
            {data.participants.length} participants · {data.events.length.toLocaleString()} events
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => load(password)} className="rounded-full border border-line bg-tray px-4 py-2 text-[14px] font-medium hover:border-ink">
            Refresh
          </button>
          <button onClick={() => download("participants.csv", toCSV(data.participants as unknown as Record<string, unknown>[]))} className="rounded-full border border-line bg-tray px-4 py-2 text-[14px] font-medium hover:border-ink">
            Download participants.csv
          </button>
          <button onClick={() => download("events.csv", toCSV(data.events as unknown as Record<string, unknown>[]))} className="rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-white">
            Download events.csv
          </button>
        </div>
      </div>

      <nav className="mt-8 flex gap-1 border-b border-line" role="tablist">
        {(
          [
            ["overview", "Overview"],
            ["kc", "By knowledge component"],
            ["items", "By item"],
            ["people", "Participants"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-medium ${tab === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && <Overview data={data} />}
        {tab === "kc" && <ByKC events={data.events} />}
        {tab === "items" && <ByItem events={data.events} />}
        {tab === "people" && <People data={data} selected={selected} setSelected={setSelected} />}
      </div>
    </main>
  );
}

function Overview({ data }: { data: { participants: Participant[]; events: Event[] } }) {
  const rows = (["predict", "told"] as const).map((c) => {
    const ps = data.participants.filter((p) => p.condition === c);
    const done = ps.filter((p) => p.post_completed_at);
    const pre = done.map((p) => pct(p.pre_correct ?? 0, p.pre_total ?? 0));
    const post = done.map((p) => pct(p.post_correct ?? 0, p.post_total ?? 0));
    const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
    const learnMins = done
      .map((p) => (p.pre_completed_at && p.learn_completed_at ? (new Date(p.learn_completed_at).getTime() - new Date(p.pre_completed_at).getTime()) / 60000 : null))
      .filter((x): x is number => x != null);
    return { c, started: ps.length, completed: done.length, pre: avg(pre), post: avg(post), learn: median(learnMins) };
  });
  return (
    <div>
      <p className="max-w-[70ch] text-[15px] text-muted">
        <strong className="text-ink">predict</strong> = guessed before the reveal (innovative principle). <strong className="text-ink">told</strong> = saw the answer
        first, then answered a check. Scores are % correct on auto-scored items for participants who finished.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-tray">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-line text-muted">
            <tr>
              {["Condition", "Started", "Finished", "Mean pre", "Mean post", "Gain", "Median learn time"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.c} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold">{r.c}</td>
                <td className="px-4 py-3 tabular-nums">{r.started}</td>
                <td className="px-4 py-3 tabular-nums">{r.completed}</td>
                <td className="px-4 py-3 tabular-nums">{r.pre == null ? "—" : `${r.pre}%`}</td>
                <td className="px-4 py-3 tabular-nums">{r.post == null ? "—" : `${r.post}%`}</td>
                <td className="px-4 py-3 tabular-nums">{r.pre == null || r.post == null ? "—" : `${r.post - r.pre > 0 ? "+" : ""}${r.post - r.pre} pts`}</td>
                <td className="px-4 py-3 tabular-nums">{r.learn == null ? "—" : `${r.learn.toFixed(1)} min`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] text-muted">Session recordings (every click and scroll, replayable) are in PostHog → Session replay, filtered by person = participant ID.</p>
    </div>
  );
}

function ByKC({ events }: { events: Event[] }) {
  const [cond, setCond] = useState<"all" | "predict" | "told">("all");
  const rows = useMemo(() => {
    const ans = events.filter((e) => e.event_type === "answer" && (e.phase === "pre" || e.phase === "post") && e.correct !== null && (cond === "all" || e.condition === cond));
    return (Object.keys(KCS) as (keyof typeof KCS)[])
      .map((kc) => {
        const pre = ans.filter((e) => e.kc === kc && e.phase === "pre");
        const post = ans.filter((e) => e.kc === kc && e.phase === "post");
        return {
          kc,
          label: KCS[kc],
          pre: pct(pre.filter((e) => e.correct).length, pre.length),
          post: pct(post.filter((e) => e.correct).length, post.length),
          nPre: pre.length,
          nPost: post.length,
        };
      })
      .filter((r) => r.nPre || r.nPost);
  }, [events, cond]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-full bg-tray p-1 text-[13px]">
          {(["all", "predict", "told"] as const).map((c) => (
            <button key={c} onClick={() => setCond(c)} className={`rounded-full px-3 py-1.5 font-medium ${cond === c ? "bg-ink text-white" : "text-muted"}`}>
              {c === "all" ? "Both conditions" : c}
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-[13px] text-muted" aria-label="Legend">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: PRE }} />Pre-check</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: POST }} />Post-check</span>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No test answers yet.</p>
      ) : (
        <div className="mt-6 grid gap-5">
          {rows.map((r) => (
            <div key={r.kc} className="grid gap-2 sm:grid-cols-[260px_1fr] sm:items-center">
              <div>
                <p className="text-[14px] font-semibold">{r.label}</p>
                <p className="text-[12px] text-muted">n = {r.nPre} pre / {r.nPost} post answers</p>
              </div>
              <div className="grid gap-[2px]">
                {[
                  ["Pre", r.pre, PRE, r.nPre],
                  ["Post", r.post, POST, r.nPost],
                ].map(([l, v, c, n]) => (
                  <div key={l as string} className="flex items-center gap-2" title={`${l}: ${v}% correct (${n} answers)`}>
                    <div className="h-4 flex-1 rounded-r bg-transparent">
                      <div className="h-full rounded-r" style={{ width: `${Math.max(v as number, 0.5)}%`, background: c as string }} />
                    </div>
                    <span className="w-12 text-right text-[12px] tabular-nums text-muted">{v as number}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ByItem({ events }: { events: Event[] }) {
  const rows = useMemo(() => {
    const ans = events.filter((e) => e.event_type === "answer" && e.item_id);
    const byId = new Map<string, Event[]>();
    for (const e of ans) byId.set(e.item_id!, [...(byId.get(e.item_id!) ?? []), e]);
    return [...byId.entries()]
      .map(([id, es]) => {
        const scored = es.filter((e) => e.correct !== null);
        const first = scored.filter((e) => (e.attempt ?? 1) <= 1 || e.phase !== "learn");
        return {
          id,
          phase: es[0].phase,
          kc: es[0].kc ? KCS[es[0].kc as keyof typeof KCS] ?? es[0].kc : "—",
          n: new Set(es.map((e) => e.participant_id)).size,
          correct: scored.length ? `${pct(first.filter((e) => e.correct).length, first.length)}%` : "open text",
          time: secs(median(es.map((e) => e.duration_ms ?? 0).filter(Boolean))),
        };
      })
      .sort((a, b) => a.phase.localeCompare(b.phase) || a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [events]);
  return (
    <div className="overflow-x-auto rounded-2xl bg-tray">
      <table className="w-full text-left text-[14px]">
        <thead className="border-b border-line text-muted">
          <tr>
            {["Item", "Phase", "Knowledge component", "People", "First-try correct", "Median time"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-mono text-[13px]">{r.id}</td>
              <td className="px-4 py-2.5">{r.phase}</td>
              <td className="px-4 py-2.5">{r.kc}</td>
              <td className="px-4 py-2.5 tabular-nums">{r.n}</td>
              <td className="px-4 py-2.5 tabular-nums">{r.correct}</td>
              <td className="px-4 py-2.5 tabular-nums">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function People({
  data,
  selected,
  setSelected,
}: {
  data: { participants: Participant[]; events: Event[] };
  selected: string | null;
  setSelected: (id: string | null) => void;
}) {
  const timeline = useMemo(() => (selected ? data.events.filter((e) => e.participant_id === selected) : []), [data, selected]);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="overflow-x-auto rounded-2xl bg-tray">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line text-muted">
            <tr>
              {["Started", "Condition", "Background", "Pre", "Post", "Learn time"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...data.participants].reverse().map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`cursor-pointer border-b border-line last:border-0 ${selected === p.id ? "bg-porcelain" : "hover:bg-porcelain"}`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">{new Date(p.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
                <td className="px-3 py-2.5">{p.condition}</td>
                <td className="px-3 py-2.5">{p.background ?? "—"}</td>
                <td className="px-3 py-2.5 tabular-nums">{p.pre_total ? `${p.pre_correct}/${p.pre_total}` : "—"}</td>
                <td className="px-3 py-2.5 tabular-nums">{p.post_total ? `${p.post_correct}/${p.post_total}` : "—"}</td>
                <td className="px-3 py-2.5 tabular-nums">{minutes(p.pre_completed_at, p.learn_completed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl bg-tray p-4">
        {!selected ? (
          <p className="text-[14px] text-muted">Select a participant to see every click, answer, and time on screen.</p>
        ) : (
          <>
            <p className="font-mono text-[12px] text-muted">{selected}</p>
            <ol className="mt-3 max-h-[70vh] overflow-y-auto text-[13px]">
              {timeline.map((e) => (
                <li key={e.id} className="grid grid-cols-[70px_80px_1fr_70px] gap-2 border-b border-line py-2 last:border-0">
                  <span className="tabular-nums text-muted">{new Date(e.client_ts ?? e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  <span className="text-muted">{e.event_type}</span>
                  <span className="min-w-0 break-words">
                    <span className="font-medium">{e.item_id ?? e.screen}</span>
                    {e.response != null && <span className="text-muted"> · {typeof e.response === "string" ? e.response : JSON.stringify(e.response)}</span>}
                    {e.correct != null && <span className={e.correct ? "text-leaf" : "text-wrong"}> · {e.correct ? "correct" : "wrong"}</span>}
                  </span>
                  <span className="text-right tabular-nums text-muted">{e.duration_ms ? secs(e.duration_ms) : ""}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
