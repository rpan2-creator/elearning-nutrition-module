"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, Phase, PHASE_PATH, Session } from "@/lib/session";

const ORDER: Phase[] = ["start", "pre", "learn", "post", "done"];
const LABEL: Record<Phase, string> = {
  start: "Start",
  pre: "Pre-check",
  learn: "Learn",
  post: "Post-check",
  done: "Results",
};

/**
 * Wraps each flow page. Sends the learner to the phase they are on, so the
 * pre-test cannot be retaken after learning and the order is preserved.
 */
export function useFlowGuard(phase: Phase): Session | null {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const s = getSession();
    if (!s) {
      if (phase !== "start") router.replace("/start");
      return;
    }
    if (s.phase !== phase && phase !== "start") {
      router.replace(PHASE_PATH[s.phase]);
      return;
    }
    setSession(s);
  }, [phase, router]);
  return session;
}

export function FlowHeader({ phase, right }: { phase: Phase; right?: React.ReactNode }) {
  const idx = ORDER.indexOf(phase);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-porcelain/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
        <Link href="/" className="font-display text-[18px] font-bold">
          What&rsquo;s in your bowl?
        </Link>
        <nav aria-label="Progress" className="hidden items-center gap-2 text-[13px] sm:flex">
          {ORDER.slice(1, 4).map((p, i) => {
            const state = i + 1 < idx ? "done" : i + 1 === idx ? "now" : "later";
            return (
              <span
                key={p}
                aria-current={state === "now" ? "step" : undefined}
                className={
                  state === "now"
                    ? "rounded-full bg-ink px-3 py-1 font-semibold text-white"
                    : state === "done"
                      ? "px-3 py-1 text-leaf"
                      : "px-3 py-1 text-muted"
                }
              >
                {LABEL[p]}
              </span>
            );
          })}
        </nav>
        <div className="text-[13px] text-muted">{right}</div>
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
          ? "inline-flex items-center rounded-full bg-ink px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-leaf disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          : "inline-flex items-center rounded-full border border-line bg-tray px-5 py-2.5 text-[15px] font-medium transition-colors hover:border-ink"
      }
    >
      {children}
    </button>
  );
}
