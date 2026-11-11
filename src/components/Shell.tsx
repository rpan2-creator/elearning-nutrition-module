"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, isPreview, newSession, Phase, PHASE_PATH, saveSession, Session } from "@/lib/session";

const ORDER: Phase[] = ["start", "pre", "learn", "post", "done"];
const LABEL: Record<Phase, string> = {
  start: "Start",
  pre: "Pre-check",
  learn: "Learn",
  post: "Post-check",
  done: "Results",
};

/**
 * Wraps each flow page.
 * Learners go through the parts in order: Pre-check, Learn, Post-check. A
 * learner who opens a later part is sent back to the part they are on, so the
 * learning can't be skipped and the pre-check can't be retaken afterwards.
 * Preview mode (?preview=1) opens everything for the design team; a preview
 * visitor without a session gets one, flagged "preview" in the data.
 */
export function useFlowGuard(phase: Phase): Session | null {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const preview = isPreview();
    let s = getSession();
    if (!s) {
      if (!preview) {
        if (phase !== "start") router.replace("/start");
        return;
      }
      s = newSession();
      s.phase = phase;
      saveSession(s);
      fetch("/api/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, condition: s.condition, order: s.order, background: "preview", consent: false }),
      }).catch(() => {});
    } else if (s.phase !== phase && phase !== "start") {
      if (!preview) {
        router.replace(PHASE_PATH[s.phase]);
        return;
      }
      s = { ...s, phase };
      saveSession(s);
    }
    setSession(s);
  }, [phase, router]);
  return session;
}

export function FlowHeader({ phase, right }: { phase: Phase; right?: React.ReactNode }) {
  const [preview, setPreview] = useState(false);
  useEffect(() => setPreview(isPreview()), []);
  const idx = ORDER.indexOf(phase);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-porcelain/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <Link href="/" className="font-display shrink-0 text-[18px] font-bold">
          <span className="hidden sm:inline">What&rsquo;s in your bowl?</span>
          <span className="sm:hidden" aria-label="What's in your bowl? Home">Bowl</span>
        </Link>
        <nav aria-label="Parts" className="flex items-center gap-1 text-[13px] sm:gap-2">
          {ORDER.slice(1, 4).map((p, i) => {
            const now = p === phase;
            const done = i + 1 < idx;
            const cls = now
              ? "whitespace-nowrap rounded-full bg-ink px-3 py-1 font-semibold text-porcelain"
              : "whitespace-nowrap rounded-full px-2.5 py-1 text-ink/70 transition-colors hover:bg-cream-2 hover:text-ink sm:px-3";
            return preview ? (
              <Link key={p} href={PHASE_PATH[p]} aria-current={now ? "page" : undefined} className={cls}>
                {LABEL[p]}
              </Link>
            ) : (
              <span key={p} aria-current={now ? "step" : undefined} className={now ? cls : `whitespace-nowrap px-2.5 py-1 sm:px-3 ${done ? "text-ink/70" : "text-ink/35"}`}>
                {done ? "✓ " : ""}
                {LABEL[p]}
              </span>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 text-[13px] text-muted md:flex">
          {preview && <span className="rounded-full bg-red px-2 py-0.5 text-[11px] font-semibold text-porcelain">Preview</span>}
          {right}
        </div>
      </div>
    </header>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "solid",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "quiet";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        variant === "solid"
          ? "inline-flex items-center rounded-full bg-ink px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-red disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          : "inline-flex items-center rounded-full border border-line bg-tray px-5 py-2.5 text-[15px] font-medium transition-colors hover:border-ink"
      }
    >
      {children}
    </button>
  );
}
