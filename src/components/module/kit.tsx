"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";
import { track } from "@/lib/track";

export function RoleChip({ role, size = "md" }: { role: Macro; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12.5px]"}`}
      style={{ background: MACRO[role].color }}
    >
      {MACRO[role].label}
    </span>
  );
}

export function Illus({ src, className = "", bob = false, delay = 0 }: { src: string; className?: string; bob?: boolean; delay?: number }) {
  return (
    <div className={bob ? "bob" : ""} style={bob ? { animationDelay: `${-delay}s` } : undefined}>
      <img src={src} alt="" className={`illus ${className}`} />
    </div>
  );
}

/** A defined term, shown the first time a concept appears. */
export function Term({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-tray p-4">
      <p className="text-[12px] font-semibold text-red">Key term</p>
      <p className="font-display mt-1 text-[22px] font-bold leading-tight">{word}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div className={`rounded-2xl p-4 text-[15px] leading-relaxed ${tone === "warn" ? "bg-[#fde9e1]" : "bg-cream-2"}`}>{children}</div>
  );
}

export interface Slide {
  title: string;
  body: React.ReactNode;
  /** A picture, or an interactive piece that calls `done` once the learner has used it. */
  visual?: React.ReactNode | ((done: () => void) => React.ReactNode);
  /** Put the visual full-width under the text (for interactive visuals like the card wheel). */
  wide?: boolean;
  /** When set, Next stays locked until the visual calls `done`; the text tells the learner what to do. */
  gate?: string;
}

/**
 * The "Learn" phase: a short sequence of illustrated concept slides.
 * Learners move at their own pace; reaching the last slide unlocks "Try it".
 */
export function LearnSlides({ id, slides, onDone, open = false }: { id: string; slides: Slide[]; onDone: () => void; open?: boolean }) {
  const [i, setI] = useState(0);
  const [cleared, setCleared] = useState<Record<number, boolean>>({});
  const seen = useRef(new Set<number>([0]));
  const enteredAt = useRef(performance.now());

  useEffect(() => {
    if (i === slides.length - 1) onDone();
  }, [i, slides.length, onDone]);

  function go(n: number) {
    track({ phase: "learn", screen: id, event_type: "click", item_id: `${id}-slide-${i + 1}`, duration_ms: performance.now() - enteredAt.current, meta: { action: n > i ? "next" : "back", to: n + 1 } });
    enteredAt.current = performance.now();
    seen.current.add(n);
    setI(n);
  }

  const s = slides[i];
  const locked = !!s.gate && !cleared[i] && !open;
  const clear = (k: number) => () => setCleared((c) => (c[k] ? c : { ...c, [k]: true }));
  const visual = typeof s.visual === "function" ? s.visual(clear(i)) : s.visual;
  return (
    <div>
      <div className="relative min-h-[420px] overflow-hidden rounded-[32px] bg-tray">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className={`grid gap-8 p-6 sm:p-10 ${s.wide ? "" : "lg:grid-cols-[1.05fr_1fr] lg:items-center"}`}
          >
            <div className={s.wide ? "max-w-3xl" : ""}>
              <p className="text-[13px] font-medium text-muted">
                Learn · {i + 1} of {slides.length}
              </p>
              <h3 className="font-display mt-2 text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.02]">{s.title}</h3>
              <div className="mt-4 grid gap-4 text-[16.5px] leading-relaxed">{s.body}</div>
            </div>
            {visual && <div className={s.wide ? "min-w-0" : "flex items-center justify-center"}>{visual}</div>}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="rounded-full border border-line bg-tray px-4 py-2 text-[14px] font-medium disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((_, k) => (
            <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-ink" : seen.current.has(k) ? "w-1.5 bg-muted" : "w-1.5 bg-line"}`} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {locked && <span className="hidden text-[13px] text-muted sm:inline">{s.gate}</span>}
          <button
            onClick={() => go(i + 1)}
            disabled={i === slides.length - 1 || locked}
            className={`rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-white disabled:cursor-not-allowed ${i === slides.length - 1 ? "invisible" : "disabled:bg-line disabled:text-muted"}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/** Horizontal macro bars for a food (grams). */
export function MacroBars({ carb, protein, fat, fiber, max = 45, highlight }: { carb: number; protein: number; fat: number; fiber?: number; max?: number; highlight?: Macro }) {
  const rows: [Macro, number][] = [
    ["carb", carb],
    ["protein", protein],
    ["fat", fat],
  ];
  if (fiber !== undefined) rows.push(["fiber", fiber]);
  return (
    <div className="grid gap-1.5">
      {rows.map(([m, g]) => (
        <div key={m} className={`grid grid-cols-[78px_1fr_42px] items-center gap-2 text-[12px] ${highlight && highlight !== m ? "opacity-45" : ""}`}>
          <span className="font-medium">{MACRO[m].label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-cream-2">
            <motion.span className="block h-full rounded-full" style={{ background: MACRO[m].color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (g / max) * 100)}%` }} transition={{ duration: 0.6, delay: 0.25 }} />
          </span>
          <span className="text-right tabular-nums">{g} g</span>
        </div>
      ))}
    </div>
  );
}

/** Shows step A; once it reports done, reveals step B. B's completion completes the whole sequence. */
export function Sequence({ first, second, onDone }: { first: (done: () => void) => React.ReactNode; second: (done: () => void) => React.ReactNode; onDone: () => void }) {
  const [a, setA] = useState(false);
  const markA = useRef(() => setA(true)).current;
  return (
    <div className="grid gap-10">
      {first(markA)}
      {a && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {second(onDone)}
        </motion.div>
      )}
    </div>
  );
}

/** Completes immediately (for screens with nothing to do). */
export function AutoDone({ onDone, children }: { onDone: () => void; children: React.ReactNode }) {
  useEffect(onDone, [onDone]);
  return <>{children}</>;
}
