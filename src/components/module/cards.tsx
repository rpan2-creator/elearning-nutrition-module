"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Food } from "@/content/foods";
import { MACRO, Macro, KC } from "@/content/kcs";
import type { Condition } from "@/lib/session";
import { track } from "@/lib/track";
import { MacroBars, RoleChip } from "./kit";

/* ────────────────────────── 3D flip card ────────────────────────── */

export function FlipCard({
  food,
  flipped,
  highlight,
  onClick,
  selected,
  className = "",
  max,
}: {
  food: Food;
  flipped: boolean;
  highlight?: Macro;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  max?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={selected}
      className={`relative block h-[300px] w-[220px] shrink-0 text-left [perspective:1200px] disabled:cursor-default ${className}`}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        {/* front */}
        <div
          className={`absolute inset-0 flex flex-col rounded-[26px] bg-tray p-4 shadow-[0_20px_40px_-20px_rgba(17,0,0,0.35)] [backface-visibility:hidden] ${selected ? "ring-4 ring-ink" : "ring-1 ring-line"}`}
        >
          <div className="flex flex-1 items-center justify-center">
            <img src={food.img} alt="" className="illus h-36 w-36 object-contain" />
          </div>
          <p className="font-display text-[19px] font-bold leading-tight">{food.name}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            {food.portion}
            {food.hand ? ` · about ${food.hand}` : ""}
          </p>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex flex-col rounded-[26px] bg-night p-4 text-[#fdfbee] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center gap-2">
            <img src={food.img} alt="" className="illus h-12 w-12 object-contain" />
            <div>
              <p className="text-[13px] font-semibold leading-tight">{food.name}</p>
              <p className="text-[12px] text-[#fdfbee]/60">{food.portion}</p>
            </div>
          </div>
          {highlight && (
            <p className="font-display mt-3 text-[44px] font-extrabold leading-none" style={{ color: highlight === "carb" ? "#ffb84d" : highlight === "protein" ? "#ff8a8a" : highlight === "fat" ? "#e8c76a" : "#b5d98a" }}>
              {food[highlight === "carb" ? "carb" : highlight]} g
              <span className="ml-1 text-[14px] font-semibold text-[#fdfbee]/70">{MACRO[highlight].label.toLowerCase()}</span>
            </p>
          )}
          <div className="mt-3 rounded-xl bg-white/95 p-2.5 text-ink">
            <MacroBars carb={food.carb} protein={food.protein} fat={food.fat} fiber={food.fiber} highlight={highlight} max={max} />
          </div>
          <p className="mt-auto pt-2 text-[12px] text-[#fdfbee]/70">≈ {food.kcal} kcal · typical values</p>
        </div>
      </motion.div>
    </button>
  );
}

/* ─────────────── Guess-then-flip deck (carbohydrate grams) ─────────────── */

export function GuessDeck({ id, kc, foods, macro, onDone }: { id: string; kc: KC; foods: Food[]; macro: Macro; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState(20);
  const [flipped, setFlipped] = useState(false);
  const [log, setLog] = useState<{ food: Food; guess: number }[]>([]);
  const shownAt = useRef(performance.now());
  const done = idx >= foods.length;
  const max = Math.max(...foods.map((f) => f[macro as "carb"]));

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  const current = foods[idx];

  function flip() {
    const actual = current[macro as "carb"];
    track({ phase: "learn", screen: id, event_type: "answer", item_id: `${id}-${current.id}`, kc, response: guess, correct: Math.abs(guess - actual) <= Math.max(5, actual * 0.25), duration_ms: performance.now() - shownAt.current, meta: { actual } });
    setFlipped(true);
    setLog((l) => [...l, { food: current, guess }]);
  }
  function next() {
    setFlipped(false);
    setTimeout(() => {
      setIdx((i) => i + 1);
      setGuess(20);
      shownAt.current = performance.now();
    }, 250);
  }

  if (done) {
    const sorted = [...log].sort((a, b) => b.food[macro as "carb"] - a.food[macro as "carb"]);
    return (
      <div className="rounded-[28px] bg-tray p-6">
        <p className="font-display text-[22px] font-bold">Your guesses vs. the labels</p>
        <p className="mt-1 text-[14px] text-muted">Sorted from most to least {MACRO[macro].label.toLowerCase()}. The outline shows your guess.</p>
        <div className="mt-5 grid gap-3">
          {sorted.map(({ food, guess }) => {
            const a = food[macro as "carb"];
            return (
              <div key={food.id} className="grid grid-cols-[44px_150px_1fr] items-center gap-3 text-[14px] sm:grid-cols-[44px_190px_1fr]">
                <img src={food.img} alt="" className="illus h-10 w-10" />
                <span>
                  {food.name} <span className="text-muted">· {food.portion}</span>
                </span>
                <div className="relative h-6">
                  <div className="absolute inset-y-0 left-0 rounded-r-md" style={{ width: `${(a / max) * 100}%`, background: MACRO[macro].color }} />
                  <div className="absolute inset-y-0 left-0 rounded-r-md border-2 border-dashed border-ink" style={{ width: `${Math.min(100, (guess / max) * 100)}%` }} />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] tabular-nums text-muted">
                    {a} g (you: {guess})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
      {/* stacked deck, TIDY-style fan */}
      <div className="relative mx-auto h-[330px] w-[260px]">
        {foods.slice(idx + 1, idx + 4).map((f, k) => (
          <motion.div
            key={f.id}
            className="absolute left-5 top-3"
            animate={{ rotate: (k + 1) * 5, x: (k + 1) * 10, y: (k + 1) * 4, opacity: 1 - (k + 1) * 0.2 }}
            style={{ zIndex: 5 - k }}
          >
            <div className="h-[300px] w-[220px] rounded-[26px] bg-tray ring-1 ring-line" />
          </motion.div>
        ))}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            className="absolute left-5 top-3 z-10"
            initial={{ y: 30, opacity: 0, rotate: 6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -260, opacity: 0, rotate: -14 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            <FlipCard food={current} flipped={flipped} highlight={macro} max={max} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-md">
        <p className="text-[13px] font-medium text-muted">
          Card {idx + 1} of {foods.length}
        </p>
        <p className="font-display mt-1 text-[26px] font-bold leading-tight">
          How many grams of {MACRO[macro].label.toLowerCase()} in {current.portion} of {current.name.toLowerCase()}?
        </p>
        {!flipped ? (
          <>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-[56px] font-extrabold leading-none tabular-nums" style={{ color: MACRO[macro].color }}>
                {guess}
              </span>
              <span className="text-[16px] text-muted">g, your guess</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={guess}
              onChange={(e) => setGuess(Number(e.target.value))}
              aria-label="Your guess in grams"
              className="mt-4 w-full accent-[var(--ink)]"
            />
            <button onClick={flip} className="mt-6 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white">
              Flip the card
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <p className="text-[17px] leading-relaxed">
              Actual: <strong>{current[macro as "carb"]} g</strong>. You guessed {guess} g
              {Math.abs(guess - current[macro as "carb"]) <= Math.max(5, current[macro as "carb"] * 0.25) ? " — close." : "."}
            </p>
            {current.note && <p className="mt-2 text-[15px] text-muted">{current.note}</p>}
            <button onClick={next} className="mt-5 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white">
              {idx + 1 < foods.length ? "Next card" : "See all cards"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Which has more? (predict, then both flip) ─────────────── */

export interface Pair {
  a: Food;
  b: Food;
  question: string;
  explain: string;
}

export function PredictPairs({ id, kc, pairs, macro, condition, onDone }: { id: string; kc: KC; pairs: Pair[]; macro: Macro; condition: Condition; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(condition === "told");
  const shownAt = useRef(performance.now());
  const done = idx >= pairs.length;

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);
  if (done) {
    return <p className="rounded-2xl bg-tray p-5 text-[16px]">All pairs done. Similar-looking foods can be very different — the label tells you, not the name.</p>;
  }
  const pr = pairs[idx];
  const winner = pr.a[macro as "carb"] >= pr.b[macro as "carb"] ? pr.a.id : pr.b.id;

  function choose(fid: string) {
    if (revealed && condition === "predict") return;
    setPick(fid);
    track({ phase: "learn", screen: id, event_type: "answer", item_id: `${id}-${idx + 1}`, kc, response: fid, correct: fid === winner, duration_ms: performance.now() - shownAt.current, meta: { condition } });
    if (condition === "predict") setRevealed(true);
  }
  function next() {
    setIdx(idx + 1);
    setPick(null);
    setRevealed(condition === "told");
    shownAt.current = performance.now();
  }

  return (
    <div>
      <p className="text-[13px] font-medium text-muted">
        Pair {idx + 1} of {pairs.length}
      </p>
      <p className="font-display mt-1 max-w-[30ch] text-[26px] font-bold leading-tight">{pr.question}</p>
      <p className="mt-1 text-[14px] text-muted">{condition === "predict" ? "Tap your prediction — then both cards flip." : "Both labels are shown. Tap the one with more."}</p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <FlipCard food={pr.a} flipped={revealed} highlight={macro} onClick={() => choose(pr.a.id)} selected={pick === pr.a.id} />
        <span className="font-display text-[22px] font-bold text-muted">vs</span>
        <FlipCard food={pr.b} flipped={revealed} highlight={macro} onClick={() => choose(pr.b.id)} selected={pick === pr.b.id} />
      </div>
      <AnimatePresence>
        {pick && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 max-w-xl rounded-2xl p-4 text-[15px] leading-relaxed ${pick === winner ? "bg-cream-2" : "bg-[#fde9e1]"}`}>
            <p className="font-semibold">{pick === winner ? "Right." : condition === "predict" ? "Most people guess that one." : "Look again at the numbers."}</p>
            <p className="mt-1">{pr.explain}</p>
            <button onClick={next} className="mt-3 rounded-full bg-ink px-5 py-2 text-[14px] font-semibold text-white">
              {idx + 1 < pairs.length ? "Next pair" : "Finish"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Sort cards into two bins ─────────────── */

export function SortBins({
  id,
  kc,
  items,
  bins,
  answer,
  explain,
  onDone,
}: {
  id: string;
  kc: KC;
  items: Food[];
  bins: [string, string];
  answer: (f: Food) => 0 | 1;
  explain: (f: Food) => string;
  onDone: () => void;
}) {
  const [placed, setPlaced] = useState<Record<string, 0 | 1>>({});
  const [checked, setChecked] = useState(false);
  const shownAt = useRef(performance.now());
  const all = items.every((f) => placed[f.id] !== undefined);

  function place(f: Food, b: 0 | 1) {
    if (checked) return;
    setPlaced((p) => ({ ...p, [f.id]: b }));
    track({ phase: "learn", screen: id, event_type: "click", item_id: `${id}-${f.id}`, kc, response: bins[b] });
  }
  function check() {
    for (const f of items) {
      track({ phase: "learn", screen: id, event_type: "answer", item_id: `${id}-${f.id}`, kc, response: bins[placed[f.id]], correct: placed[f.id] === answer(f), duration_ms: performance.now() - shownAt.current });
    }
    setChecked(true);
    onDone();
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => {
          const p = placed[f.id];
          const right = checked && p === answer(f);
          const wrong = checked && p !== answer(f);
          return (
            <motion.div
              layout
              key={f.id}
              className={`rounded-[22px] bg-tray p-4 ${right ? "ring-2 ring-ok" : wrong ? "ring-2 ring-wrong" : "ring-1 ring-line"}`}
            >
              <div className="flex items-center gap-3">
                <img src={f.img} alt="" className="illus h-16 w-16" />
                <div>
                  <p className="text-[15px] font-semibold leading-tight">{f.name}</p>
                  <p className="text-[12.5px] text-muted">
                    {f.portion} · {f.kcal} kcal
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {bins.map((b, k) => (
                  <button
                    key={b}
                    onClick={() => place(f, k as 0 | 1)}
                    disabled={checked}
                    aria-pressed={p === k}
                    className={`rounded-full px-2 py-1.5 text-[12.5px] font-semibold transition-colors ${p === k ? "bg-ink text-white" : "bg-cream-2 text-ink hover:bg-line"}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {checked && <p className="mt-2 text-[13px] leading-snug text-muted">{explain(f)}</p>}
            </motion.div>
          );
        })}
      </div>
      {!checked && (
        <button onClick={check} disabled={!all} className="mt-6 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white disabled:bg-line disabled:text-muted">
          Check my sorting
        </button>
      )}
    </div>
  );
}

/* ─────────────── Tag each food with its roles (predict / told) ─────────────── */

const ALL: Macro[] = ["carb", "protein", "fat", "fiber"];

export function RoleTagger({ id, foods, condition, onDone }: { id: string; foods: Food[]; condition: Condition; onDone: () => void }) {
  const [picks, setPicks] = useState<Record<string, Macro[]>>({});
  const [revealed, setRevealed] = useState(condition === "told");
  const shownAt = useRef(performance.now());

  useEffect(() => {
    if (condition === "told") onDone();
  }, [condition, onDone]);

  function toggle(fid: string, r: Macro) {
    if (revealed) return;
    setPicks((p) => {
      const cur = p[fid] ?? [];
      return { ...p, [fid]: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] };
    });
  }
  function reveal() {
    for (const f of foods) {
      const mine = [...(picks[f.id] ?? [])].sort().join(",");
      track({ phase: "learn", screen: id, event_type: "answer", item_id: `${id}-${f.id}`, kc: "multi_roles", response: picks[f.id] ?? [], correct: mine === [...f.roles].sort().join(","), duration_ms: performance.now() - shownAt.current });
    }
    setRevealed(true);
    onDone();
  }

  return (
    <div>
      <p className="text-[15px] text-muted">
        {condition === "predict" ? "Predict first: tap every role each food plays. Then reveal." : "Here are the roles each food plays. Notice which ones play more than one."}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {foods.map((f) => (
          <div key={f.id} className="rounded-[22px] bg-tray p-4 ring-1 ring-line">
            <img src={f.img} alt="" className="illus mx-auto h-24 w-24" />
            <p className="mt-2 text-center text-[15px] font-semibold">{f.name}</p>
            <p className="text-center text-[12.5px] text-muted">{f.portion}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {ALL.map((r) => {
                const on = (picks[f.id] ?? []).includes(r);
                const right = f.roles.includes(r);
                if (revealed && !right && !on) return null;
                const style = revealed
                  ? right
                    ? { background: MACRO[r].color, color: "white", borderColor: MACRO[r].color }
                    : { color: "var(--wrong)", borderColor: "var(--wrong)", textDecoration: "line-through", background: "white" }
                  : on
                    ? { background: MACRO[r].color, color: "white", borderColor: MACRO[r].color }
                    : { color: "var(--muted)", borderColor: "var(--line)", background: "white" };
                return (
                  <button key={r} onClick={() => toggle(f.id, r)} disabled={revealed} aria-pressed={on} className="rounded-full border px-2.5 py-1 text-[12px] font-semibold" style={style}>
                    {MACRO[r].label}
                  </button>
                );
              })}
            </div>
            {revealed && f.note && <p className="mt-2 text-center text-[12.5px] leading-snug text-muted">{f.note}</p>}
          </div>
        ))}
      </div>
      {!revealed && (
        <button
          onClick={reveal}
          disabled={!foods.every((f) => (picks[f.id] ?? []).length)}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white disabled:bg-line disabled:text-muted"
        >
          Reveal the roles
        </button>
      )}
    </div>
  );
}

export { RoleChip };
