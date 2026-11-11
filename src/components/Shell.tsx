"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, newSession, Phase, PHASE_PATH, saveSession, Session } from "@/lib/session";
import { track } from "@/lib/track";

const ORDER: Phase[] = ["start", "pre", "learn", "post", "done"];
const LABEL: Record<Phase, string> = {
  start: "Start",
  pre: "Pre-check",
  learn: "Learn",
  post: "Post-check",
  done: "Results",
};

/**
 * Wraps each flow page. Every part is open: a visitor can jump straight to
 * Pre-check, Learn, or Post-check. Arriving without a session creates one, so
 * their clicks are still recorded (flagged as a direct entry).
 */
export function useFlowGuard(phase: Phase): Session | null {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    let s = getSession();
    if (!s) {
      s = newSession();
      s.phase = phase;
      saveSession(s);
      fetch("/api/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, condition: s.condition, order: s.order, background: "direct_entry", consent: false }),
      }).catch(() => {});
    } else if (s.phase !== phase && phase !== "start") {
      s = { ...s, phase };
      saveSession(s);
    }
    setSession(s);
    track({ phase, screen: phase, event_type: "click", meta: { action: "enter_part" } });
  }, [phase]);
  return session;
}

export function FlowHeader({ phase, right }: { phase: Phase; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-porcelain/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <Link href="/" className="font-display shrink-0 text-[18px] font-bold">
          <span className="hidden sm:inline">What&rsquo;s in your bowl?</span>
          <span className="sm:hidden" aria-label="What's in your bowl? Home">Bowl</span>
        </Link>
        <nav aria-label="Parts" className="flex items-center gap-1 text-[13px] sm:gap-2">
          {ORDER.slice(1, 4).map((p) => {
            const now = p === phase;
            return (
              <Link
                key={p}
                href={PHASE_PATH[p]}
                aria-current={now ? "page" : undefined}
                className={
                  now
                    ? "whitespace-nowrap rounded-full bg-ink px-3 py-1 font-semibold text-porcelain"
                    : "whitespace-nowrap rounded-full px-2.5 py-1 text-ink/70 transition-colors hover:bg-cream-2 hover:text-ink sm:px-3"
                }
              >
                {LABEL[p]}
              </Link>
            );
          })}
        </nav>
        <div className="hidden text-[13px] text-muted md:block">{right}</div>
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
