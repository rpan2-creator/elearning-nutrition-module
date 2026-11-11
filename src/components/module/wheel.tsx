"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Food } from "@/content/foods";
import { MACRO, Macro, KC } from "@/content/kcs";
import { track } from "@/lib/track";
import { MacroBars } from "./kit";

/**
 * A ring of food cards that turns like a wheel (after the arc-carousel reference).
 * Drag, scroll, use the arrows, or tap a card to bring it to the front; tap the
 * front card to flip it. "explore" lets learners browse and sort; "guess" asks
 * for an estimate before each card flips.
 */

function useSize() {
  const [w, setW] = useState(1200);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

const grams = (f: Food, m: Macro) => f[m === "carb" ? "carb" : m];

function WheelCard({
  food,
  index,
  pos,
  geo,
  flipped,
  hidden,
  macro,
  max,
  onClick,
}: {
  food: Food;
  index: number;
  pos: MotionValue<number>;
  geo: { R: number; step: number; w: number; h: number };
  flipped: boolean;
  hidden: boolean;
  macro: Macro;
  max: number;
  onClick: () => void;
}) {
  const rel = useTransform(pos, (p) => index - p);
  const angle = useTransform(rel, (r) => r * geo.step);
  const x = useTransform(angle, (a) => Math.sin((a * Math.PI) / 180) * geo.R);
  const y = useTransform(angle, (a) => geo.R * (1 - Math.cos((a * Math.PI) / 180)));
  const scale = useTransform(rel, (r) => 1.12 - Math.min(Math.abs(r), 3) * 0.08);
  const opacity = useTransform(rel, (r) => (Math.abs(r) > 4.6 ? 0 : 1 - Math.max(0, Math.abs(r) - 3) * 0.6));
  const zIndex = useTransform(rel, (r) => 100 - Math.round(Math.abs(r) * 10));
  const isFront = useTransform(rel, (r) => Math.abs(r) < 0.5);
  const [front, setFront] = useState(false);
  useEffect(() => isFront.on("change", setFront), [isFront]);
  useEffect(() => setFront(isFront.get()), [isFront]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={front ? `${food.name}. ${flipped ? "Showing the label" : "Tap to flip"}` : `Bring ${food.name} to the front`}
      className="absolute left-1/2 origin-bottom [perspective:1400px]"
      style={{ x, y, rotate: angle, scale, opacity, zIndex, width: geo.w, height: geo.h, marginLeft: -geo.w / 2, top: geo.h * 0.12 + 14 }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 15 }}
      >
        {/* front */}
        <div
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-[22px] bg-[#fffdf4] text-left shadow-[0_24px_40px_-24px_rgba(17,0,0,0.45)] [backface-visibility:hidden] ${front ? "ring-2 ring-ink" : "ring-1 ring-line"}`}
        >
          <div className="flex flex-1 items-center justify-center p-3">
            <img src={food.img} alt="" draggable={false} className={`illus h-full max-h-[78%] w-full object-contain ${hidden ? "opacity-40" : ""}`} />
          </div>
          <div className="px-3.5 pb-3.5">
            <p className="font-display text-[clamp(14px,1.4vw,18px)] font-bold leading-tight">{food.name}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {food.portion}
              {food.hand ? ` · ${food.hand}` : ""}
            </p>
          </div>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex flex-col rounded-[22px] bg-night p-3.5 text-left text-porcelain [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-[12px] text-porcelain/60">
            {food.name} · {food.portion}
          </p>
          <p className="font-display mt-2 text-[clamp(34px,3.4vw,46px)] font-extrabold leading-none tabular-nums">
            {grams(food, macro)}
            <span className="ml-1 text-[15px] font-semibold">g</span>
          </p>
          <p className="text-[12px] font-semibold" style={{ color: "#ff9a8a" }}>
            {MACRO[macro].label.toLowerCase()}
          </p>
          <div className="mt-2.5 hidden rounded-xl bg-porcelain p-2 text-ink sm:block">
            <MacroBars carb={food.carb} protein={food.protein} fat={food.fat} fiber={food.fiber} highlight={macro} max={max} />
          </div>
          <ul className="mt-2 grid gap-0.5 text-[11.5px] text-porcelain/80 sm:hidden">
            {(["carb", "protein", "fat", "fiber"] as Macro[])
              .filter((m) => m !== macro)
              .map((m) => (
                <li key={m} className="flex justify-between">
                  <span>{MACRO[m].label}</span>
                  <span className="tabular-nums">{grams(food, m)} g</span>
                </li>
              ))}
          </ul>
          <p className="mt-auto pt-2 text-[11.5px] text-porcelain/70">≈ {food.kcal} kcal</p>
        </div>
      </motion.div>
    </motion.button>
  );
}

export function CardWheel({
  id,
  kc,
  foods: input,
  macro,
  mode = "explore",
  minFlips = 3,
  onDone,
}: {
  id: string;
  kc: KC;
  foods: Food[];
  macro: Macro;
  mode?: "explore" | "guess";
  minFlips?: number;
  onDone: () => void;
}) {
  const vw = useSize();
  const small = vw < 640;
  const geo = useMemo(
    () => (small ? { R: 640, step: 13, w: 150, h: 204 } : { R: 1100, step: 12.5, w: 200, h: 272 }),
    [small],
  );
  const [sorted, setSorted] = useState(false);
  const foods = useMemo(
    () => (sorted ? [...input].sort((a, b) => grams(b, macro) - grams(a, macro)) : input),
    [input, sorted, macro],
  );
  const max = Math.max(...input.map((f) => grams(f, macro)));
  const target = useMotionValue(Math.floor(input.length / 2) - (input.length % 2 === 0 ? 1 : 0));
  const pos = useSpring(target, { stiffness: 140, damping: 22, mass: 0.7 });
  const [active, setActive] = useState(target.get());
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [guesses, setGuesses] = useState<Record<string, number>>({});
  const [guess, setGuess] = useState(20);
  const shownAt = useRef(performance.now());
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  const go = useCallback(
    (i: number, how: string) => {
      const n = Math.max(0, Math.min(foods.length - 1, i));
      target.set(n);
      setActive(n);
      setGuess(20);
      shownAt.current = performance.now();
      track({ phase: "learn", screen: id, event_type: "click", item_id: `${id}-${foods[n].id}`, kc, meta: { action: "wheel_turn", how } });
    },
    [foods, id, kc, target],
  );

  // drag to turn
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, start: target.get(), moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 6) drag.current.moved = true;
    if (drag.current.moved) target.set(Math.max(-0.4, Math.min(foods.length - 0.6, drag.current.start - dx / (geo.w * 0.9))));
  }
  function onPointerUp() {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    if (moved) go(Math.round(target.get()), "drag");
  }
  const wheelLock = useRef(0);
  function onWheel(e: React.WheelEvent) {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    if (!d || performance.now() - wheelLock.current < 260) return;
    wheelLock.current = performance.now();
    go(active + (d > 0 ? 1 : -1), "scroll");
  }

  const current = foods[active];
  const nFlipped = Object.values(flipped).filter(Boolean).length;

  useEffect(() => {
    if (mode === "explore" && nFlipped >= Math.min(minFlips, foods.length)) finish();
    if (mode === "guess" && nFlipped >= foods.length) finish();
  }, [nFlipped, mode, minFlips, foods.length, finish]);

  function tapCard(i: number) {
    if (drag.current?.moved) return;
    if (i !== active) return go(i, "tap");
    if (mode === "guess" && !flipped[foods[i].id]) return; // must guess first
    const f = foods[i];
    setFlipped((s) => ({ ...s, [f.id]: !s[f.id] }));
    track({ phase: "learn", screen: id, event_type: "reveal", item_id: `${id}-${f.id}`, kc, meta: { flipped: !flipped[f.id] } });
  }

  function submitGuess() {
    const a = grams(current, macro);
    track({
      phase: "learn",
      screen: id,
      event_type: "answer",
      item_id: `${id}-${current.id}`,
      kc,
      response: guess,
      correct: Math.abs(guess - a) <= Math.max(5, a * 0.25),
      duration_ms: performance.now() - shownAt.current,
      meta: { actual: a },
    });
    setGuesses((g) => ({ ...g, [current.id]: guess }));
    setFlipped((s) => ({ ...s, [current.id]: true }));
  }

  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1, "key");
    if (e.key === "ArrowLeft") go(active - 1, "key");
  };

  const allGuessed = mode === "guess" && nFlipped >= foods.length;
  const unit = MACRO[macro].label.toLowerCase();

  return (
    <div>
      {/* stage */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${MACRO[macro].label} food cards`}
        tabIndex={0}
        onKeyDown={keys}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        className="relative -mx-5 cursor-grab touch-pan-y select-none overflow-hidden px-5 active:cursor-grabbing sm:mx-0 sm:rounded-[32px] sm:bg-cream-2"
        style={{ height: geo.h * 1.12 + (small ? 96 : 140), paddingTop: geo.h * 0.12 + 14 }}
      >
        {foods.map((f, i) => (
          <WheelCard
            key={f.id}
            food={f}
            index={i}
            pos={pos}
            geo={geo}
            flipped={!!flipped[f.id]}
            hidden={false}
            macro={macro}
            max={max}
            onClick={() => tapCard(i)}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(active - 1, "arrow")}
            disabled={active === 0}
            aria-label="Previous card"
            className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-porcelain text-[18px] ring-1 ring-line transition-colors hover:bg-ink hover:text-porcelain disabled:opacity-40"
          >
            ‹
          </button>
          <span className="min-w-16 text-center text-[13px] tabular-nums text-muted">
            {active + 1} / {foods.length}
          </span>
          <button
            type="button"
            onClick={() => go(active + 1, "arrow")}
            disabled={active === foods.length - 1}
            aria-label="Next card"
            className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-porcelain text-[18px] ring-1 ring-line transition-colors hover:bg-ink hover:text-porcelain disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      {/* panel under the wheel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        {mode === "explore" ? (
          <div>
            <p className="text-[15px] leading-relaxed text-muted">
              Drag or scroll the wheel, tap a card to bring it forward, tap again to flip it. Flipped {Math.min(nFlipped, foods.length)} of{" "}
              {Math.min(minFlips, foods.length)} so far.
            </p>
            {current && flipped[current.id] && current.note && (
              <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed">{current.note}</p>
            )}
          </div>
        ) : !allGuessed ? (
          <div className="max-w-lg">
            <p className="font-display text-[22px] font-bold leading-tight">
              {flipped[current.id]
                ? `${current.name}: ${grams(current, macro)} g. You guessed ${guesses[current.id]} g.`
                : `How many grams of ${unit} in ${current.portion} of ${current.name.toLowerCase()}?`}
            </p>
            {!flipped[current.id] ? (
              <>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-[48px] font-extrabold leading-none tabular-nums text-red">{guess}</span>
                  <span className="text-[15px] text-muted">g, your guess</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={guess}
                  onChange={(e) => setGuess(Number(e.target.value))}
                  aria-label="Your guess in grams"
                  className="mt-3 w-full accent-[var(--red)]"
                />
                <button onClick={submitGuess} className="mt-4 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-porcelain hover:bg-red">
                  Flip the card
                </button>
              </>
            ) : (
              <div className="mt-3">
                {current.note && <p className="text-[15px] text-muted">{current.note}</p>}
                <button
                  onClick={() => {
                    const nextIdx = foods.findIndex((f) => !flipped[f.id]);
                    if (nextIdx >= 0) go(nextIdx, "next_unguessed");
                  }}
                  className="mt-4 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-porcelain hover:bg-red"
                >
                  Next card
                </button>
              </div>
            )}
            <p className="mt-4 text-[13px] text-muted">
              {nFlipped} of {foods.length} guessed
            </p>
          </div>
        ) : (
          <GuessSummary foods={foods} guesses={guesses} macro={macro} max={max} />
        )}
        {mode === "explore" && (
          <button
            type="button"
            onClick={() => {
              setSorted((s) => !s);
              target.set(0);
              setActive(0);
              track({ phase: "learn", screen: id, event_type: "click", kc, meta: { action: sorted ? "unsort" : "sort_by_grams" } });
            }}
            className="justify-self-start rounded-full border border-ink px-5 py-2.5 text-[14px] font-semibold transition-colors hover:bg-ink hover:text-porcelain"
          >
            {sorted ? "Original order" : `Line up by ${unit}, most first`}
          </button>
        )}
      </div>
    </div>
  );
}

function GuessSummary({ foods, guesses, macro, max }: { foods: Food[]; guesses: Record<string, number>; macro: Macro; max: number }) {
  const rows = [...foods].sort((a, b) => grams(b, macro) - grams(a, macro));
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[26px] bg-tray p-5 ring-1 ring-line lg:col-span-2">
        <p className="font-display text-[22px] font-bold">Your guesses against the labels</p>
        <p className="mt-1 text-[14px] text-muted">Solid bar: the label. Dashed outline: your guess.</p>
        <div className="mt-4 grid gap-2.5">
          {rows.map((f) => {
            const a = grams(f, macro);
            const g = guesses[f.id] ?? 0;
            return (
              <div key={f.id} className="grid grid-cols-[40px_minmax(0,140px)_1fr] items-center gap-3 text-[14px] sm:grid-cols-[40px_200px_1fr]">
                <img src={f.img} alt="" className="illus h-10 w-10 object-contain" />
                <span className="truncate">
                  {f.name} <span className="text-muted">· {f.portion}</span>
                </span>
                <div className="relative h-6">
                  <div className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: `${(a / max) * 100}%`, background: MACRO[macro].color }} />
                  <div className="absolute inset-y-0 left-0 rounded-r-[4px] border-2 border-dashed border-ink" style={{ width: `${Math.min(100, (g / max) * 100)}%` }} />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] tabular-nums text-muted">
                    {a} g · you {g}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

