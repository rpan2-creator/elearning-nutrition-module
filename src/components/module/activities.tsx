"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FOODS, Food } from "@/content/foods";
import { MACRO, Macro } from "@/content/kcs";
import type { Condition } from "@/lib/session";
import { track } from "@/lib/track";

/* ═════════════ Energy ═════════════ */

const SAM = { age: 20, heightCm: 170, weightKg: 65 };
export const ACTIVITY = [
  { factor: 1.2, label: "Mostly sitting", example: "classes and studying, little walking" },
  { factor: 1.375, label: "Lightly active", example: "walking across campus, light exercise 1–3 days a week" },
  { factor: 1.55, label: "Moderately active", example: "exercise 3–5 days a week" },
  { factor: 1.725, label: "Very active", example: "hard training 6–7 days a week" },
  { factor: 1.9, label: "Extremely active", example: "twice-a-day training or a physical job" },
];
const bmr = (sex: "f" | "m") => 10 * SAM.weightKg + 6.25 * SAM.heightCm - 5 * SAM.age + (sex === "m" ? 5 : -161);
const r10 = (n: number) => Math.round(n / 10) * 10;

/** Animated stacked bar of daily energy use. Used inside a Learn slide. */
export function TdeeBar() {
  const parts = [
    { name: "Basal metabolism (BMR)", share: 64, color: "var(--ink)", body: "Breathing, heartbeat, staying warm — the energy used at complete rest." },
    { name: "Physical activity", share: 26, color: "var(--red)", body: "Walking to class, training, everything you do. Changes most day to day." },
    { name: "Digesting food", share: 10, color: "var(--carb)", body: "About a tenth goes to digesting what you eat." },
  ];
  return (
    <div className="w-full">
      <div className="flex h-16 w-full overflow-hidden rounded-2xl" role="img" aria-label="BMR about 64%, activity about 26%, digestion about 10%">
        {parts.map((p, i) => (
          <motion.div key={p.name} initial={{ width: 0 }} animate={{ width: `${p.share}%` }} transition={{ delay: 0.2 + i * 0.4, duration: 0.7 }} className="flex items-center justify-center text-[15px] font-bold text-white" style={{ background: p.color }}>
            {p.share}%
          </motion.div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {parts.map((p) => (
          <div key={p.name} className="flex gap-3 text-[14px] leading-snug">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
            <span>
              <strong>{p.name}.</strong> <span className="text-muted">{p.body}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-muted">Typical shares for a moderately active student; they vary by person.</p>
    </div>
  );
}

export function Estimator({ onDone }: { onDone: () => void }) {
  const [sex, setSex] = useState<"f" | "m">("f");
  const [level, setLevel] = useState(1);
  const moves = useRef(0);
  const b = bmr(sex);
  const t = b * ACTIVITY[level].factor;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="rounded-[28px] bg-tray p-6 sm:p-8">
        <p className="text-[15px] text-muted">Meet Sam, a fictional 20-year-old student: 170 cm, 65 kg.</p>
        <div className="mt-4 inline-flex rounded-full bg-cream-2 p-1 text-[14px]" role="radiogroup" aria-label="Which equation">
          {(["f", "m"] as const).map((s) => (
            <button key={s} role="radio" aria-checked={sex === s} onClick={() => { setSex(s); track({ phase: "learn", screen: "energy-try", event_type: "click", item_id: "estimator-sex", kc: "tdee_calc", response: s }); }} className={`rounded-full px-4 py-1.5 font-medium ${sex === s ? "bg-ink text-white" : "text-muted"}`}>
              {s === "f" ? "Female equation" : "Male equation"}
            </button>
          ))}
        </div>
        <p className="mt-6 text-[13px] font-semibold text-muted">Step 1 · BMR (Mifflin–St Jeor)</p>
        <p className="mt-1 font-mono text-[14px] leading-relaxed">
          10 × 65 + 6.25 × 170 − 5 × 20 {sex === "m" ? "+ 5" : "− 161"} = <strong className="font-display text-[24px]">{Math.round(b).toLocaleString()} kcal</strong>
        </p>
        <p className="mt-6 text-[13px] font-semibold text-muted">Step 2 · Choose Sam&rsquo;s activity</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {ACTIVITY.map((a, i) => (
            <button key={a.factor} onClick={() => { setLevel(i); moves.current++; track({ phase: "learn", screen: "energy-try", event_type: "slider", item_id: "estimator-activity", kc: "tdee_calc", response: a.factor }); if (moves.current >= 2) onDone(); }} aria-pressed={level === i} className={`rounded-xl px-1 py-2 text-[12px] font-semibold leading-tight ${level === i ? "bg-red text-white" : "bg-cream-2"}`}>
              ×{a.factor}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[14px]">
          <strong>{ACTIVITY[level].label}</strong> — {ACTIVITY[level].example}
        </p>
      </div>
      <div className="flex flex-col justify-center rounded-[28px] bg-night p-6 text-[#fdfbee]">
        <p className="text-[13px] text-[#fdfbee]/60">Estimated daily energy use</p>
        <motion.p key={`${sex}-${level}`} initial={{ opacity: 0.3, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="font-display mt-2 text-[40px] font-extrabold leading-none">
          {r10(t * 0.9).toLocaleString()}–{r10(t * 1.1).toLocaleString()}
        </motion.p>
        <p className="mt-1 text-[14px] text-[#fdfbee]/70">kcal per day</p>
        <p className="mt-5 text-[13px] leading-relaxed text-[#fdfbee]/60">A range on purpose: equations can be off by 10% or more for one person. Try at least two activity levels.</p>
      </div>
    </div>
  );
}

export function BmiScale() {
  const v = SAM.weightKg / (SAM.heightCm / 100) ** 2;
  const bands = [
    { label: "< 18.5", name: "Underweight", from: 15, to: 18.5, c: "#f3f0d6" },
    { label: "18.5–24.9", name: "Healthy weight", from: 18.5, to: 25, c: "#f6c9bd" },
    { label: "25–29.9", name: "Overweight", from: 25, to: 30, c: "#f3f0d6" },
    { label: "30+", name: "Obesity", from: 30, to: 35, c: "#e7e1c8" },
  ];
  return (
    <div className="w-full">
      <p className="font-display text-[44px] font-extrabold leading-none">
        {v.toFixed(1)} <span className="text-[16px] font-semibold text-muted">Sam&rsquo;s BMI</span>
      </p>
      <div className="relative mt-4 flex h-12 overflow-hidden rounded-xl text-[12px] font-semibold">
        {bands.map((b) => (
          <div key={b.name} className="flex items-center justify-center" style={{ width: `${((b.to - b.from) / 20) * 100}%`, background: b.c }}>
            {b.label}
          </div>
        ))}
        <motion.div initial={{ left: "0%" }} animate={{ left: `${((v - 15) / 20) * 100}%` }} transition={{ duration: 1 }} className="absolute top-0 h-full w-1.5 -translate-x-1/2 rounded bg-ink" />
      </div>
      <div className="mt-1 flex text-[11.5px] text-muted">
        {bands.map((b) => (
          <div key={b.name} className="text-center" style={{ width: `${((b.to - b.from) / 20) * 100}%` }}>
            {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════ Portions ═════════════ */

const HANDS = [
  { key: "fist", img: "/food/hand-fist.webp", name: "Your fist", amount: "≈ 1 cup", uses: "Cooked rice or pasta, cereal, raw vegetables, a glass of milk", food: "/food/rice.webp" },
  { key: "cupped", img: "/food/hand-cupped.webp", name: "A cupped palm", amount: "≈ ½ cup", uses: "Cooked grains, beans, fruit, starchy sides", food: "/food/black-beans.webp" },
  { key: "palm", img: "/food/hand-palm.webp", name: "Your open palm", amount: "≈ 3 oz", uses: "Cooked meat, fish, poultry, tofu — palm only, no fingers", food: "/food/salmon.webp" },
  { key: "thumb", img: "/food/hand-thumb.webp", name: "Your thumb", amount: "≈ 2 tbsp", uses: "Peanut butter, salad dressing, oil, butter", food: "/food/peanut-butter.webp" },
];

export function HandCards({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState<string[]>([]);
  useEffect(() => {
    if (open.length === HANDS.length) onDone?.();
  }, [open, onDone]);
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {HANDS.map((h, i) => {
        const isOpen = open.includes(h.key);
        return (
          <motion.button
            key={h.key}
            initial={{ opacity: 0, y: 30, rotate: (i - 1.5) * 5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 140, damping: 15 }}
            onClick={() => {
              if (isOpen) return;
              setOpen((o) => [...o, h.key]);
              track({ phase: "learn", screen: "hands", event_type: "click", item_id: `hand-${h.key}`, kc: "portion_estimation" });
            }}
            aria-expanded={isOpen}
            className="relative h-48 text-left [perspective:1000px]"
          >
            <motion.div className="absolute inset-0 [transform-style:preserve-3d]" animate={{ rotateY: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 15 }}>
              <div className="absolute inset-0 flex flex-col justify-between rounded-[22px] bg-night p-4 text-[#fdfbee] [backface-visibility:hidden]">
                <img src={h.img} alt="" className="illus h-24 w-24 self-center" />
                <div>
                  <p className="font-display text-[19px] font-bold leading-tight">{h.name}</p>
                  <p className="text-[12px] text-[#fdfbee]/60">Tap to open</p>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col rounded-[22px] bg-tray p-4 ring-1 ring-line [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[28px] font-extrabold leading-none text-red">{h.amount}</p>
                  <img src={h.food} alt="" className="illus h-14 w-14" />
                </div>
                <p className="mt-auto text-[13px] leading-snug">{h.uses}</p>
              </div>
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Count portions with hand units, then convert. */
export function PortionCounter({ onDone }: { onDone: () => void }) {
  const tasks = [
    { id: "rice", food: FOODS.rice, unit: "fists", per: "1 fist ≈ 1 cup", count: 2, options: ["½ cup", "1 cup", "2 cups", "4 cups"], correct: "2 cups", why: "Two fists ≈ 2 cups — about 410 kcal and 90 g carbohydrate of rice." },
    { id: "salmon", food: FOODS.salmon, unit: "palms", per: "1 palm ≈ 3 oz", count: 2, options: ["2 oz", "3 oz", "6 oz", "12 oz"], correct: "6 oz", why: "Two palms ≈ 6 oz — about 44 g protein." },
    { id: "pb", food: FOODS.pb, unit: "thumbs", per: "1 thumb ≈ 2 tbsp", count: 2, options: ["1 tsp", "2 tbsp", "4 tbsp", "1 cup"], correct: "4 tbsp", why: "Two thumbs ≈ 4 tbsp — about 380 kcal, mostly from fat." },
  ];
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const shownAt = useRef(performance.now());
  const t = tasks[k];
  useEffect(() => {
    if (k >= tasks.length) onDone();
  }, [k, tasks.length, onDone]);
  if (!t) return <p className="rounded-2xl bg-tray p-5">Nice — you can now size a plate without a scale.</p>;

  return (
    <div className="grid gap-8 rounded-[28px] bg-tray p-6 sm:p-8 lg:grid-cols-[280px_1fr] lg:items-center">
      <div className="relative mx-auto flex h-56 w-64 items-end justify-center">
        <img src={t.food.img} alt="" className="illus absolute top-0 h-40 w-40" />
        <div className="relative flex gap-1">
          {Array.from({ length: t.count }).map((_, i) => (
            <motion.img key={i} src={t.id === "rice" ? "/food/hand-fist.webp" : t.id === "salmon" ? "/food/hand-palm.webp" : "/food/hand-thumb.webp"} alt="" className="illus h-20 w-20" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.2 }} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[13px] font-medium text-muted">
          {k + 1} of {tasks.length} · {t.per}
        </p>
        <p className="font-display mt-1 text-[24px] font-bold leading-tight">
          Your {t.food.name.toLowerCase()} is about {t.count} {t.unit}. Roughly how much is that?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {t.options.map((o) => (
            <button
              key={o}
              disabled={!!pick}
              onClick={() => {
                setPick(o);
                track({ phase: "learn", screen: "portions-try", event_type: "answer", item_id: `portion-${t.id}`, kc: "portion_estimation", response: o, correct: o === t.correct, duration_ms: performance.now() - shownAt.current });
              }}
              className={`rounded-2xl border px-4 py-3 text-[16px] font-medium ${pick ? (o === t.correct ? "border-ok bg-cream-2" : o === pick ? "border-wrong bg-[#fde9e1]" : "border-line opacity-60") : "border-line hover:border-ink"}`}
            >
              {o}
            </button>
          ))}
        </div>
        {pick && (
          <div className="mt-4">
            <p className="text-[15px] leading-relaxed">
              <strong>{pick === t.correct ? "Right. " : "Not quite. "}</strong>
              {t.why}
            </p>
            <button onClick={() => { setK(k + 1); setPick(null); shownAt.current = performance.now(); }} className="mt-3 rounded-full bg-ink px-5 py-2 text-[14px] font-semibold text-white">
              {k + 1 < tasks.length ? "Next" : "Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Two plates, same food; one cooked in oil */
const PLATE_A = [
  { name: "Rice, 1 fist", kcal: 205, color: "var(--carb)" },
  { name: "Chicken, 1 palm", kcal: 140, color: "var(--protein)" },
  { name: "Broccoli, 1 fist", kcal: 55, color: "var(--fiber)" },
];
const PLATE_B = [...PLATE_A, { name: "Oil, 2 tbsp", kcal: 240, color: "var(--fat)" }];
const sum = (r: { kcal: number }[]) => r.reduce((a, b) => a + b.kcal, 0);

function MiniPlate({ oil, label }: { oil: boolean; label: string }) {
  return (
    <div className="rounded-[24px] bg-tray p-4 text-center">
      <p className="font-display text-[18px] font-bold">{label}</p>
      <div className="relative mx-auto mt-2 h-40 w-60">
        <img src="/food/plate.webp" alt="" className="illus absolute inset-x-0 bottom-0 w-full" />
        <img src="/food/rice.webp" alt="" className="illus absolute left-6 top-6 h-20 w-20" />
        <img src="/food/chicken.webp" alt="" className="illus absolute right-6 top-5 h-20 w-20" />
        <img src="/food/broccoli.webp" alt="" className="illus absolute left-1/2 top-14 h-16 w-16 -translate-x-1/2" />
        {oil && <img src="/food/olive-oil.webp" alt="" className="illus absolute -right-2 bottom-2 h-16 w-16 rotate-[25deg]" />}
      </div>
      <p className="mt-1 text-[13px] text-muted">{oil ? "Stir-fried in about 2 tbsp oil" : "Steamed, no added oil"}</p>
    </div>
  );
}

export function OilPlates({ condition, onDone }: { condition: Condition; onDone: () => void }) {
  const [guess, setGuess] = useState<string | null>(null);
  const [shown, setShown] = useState(condition === "told");
  const shownAt = useRef(performance.now());
  useEffect(() => {
    if (condition === "told") onDone();
  }, [condition, onDone]);
  const max = sum(PLATE_B);
  return (
    <div>
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <MiniPlate oil={false} label="Plate A" />
        <MiniPlate oil label="Plate B" />
      </div>
      {condition === "predict" && !shown && (
        <div className="mt-6 max-w-xl">
          <p className="font-display text-[22px] font-bold">Predict: how much more energy is on Plate B?</p>
          <div className="mt-3 grid gap-2">
            {[
              ["same", "About the same — you can barely see the oil"],
              ["little", "A little more, maybe 50 kcal"],
              ["lot", "A lot more, around 200–250 kcal"],
            ].map(([id, t]) => (
              <button key={id} onClick={() => setGuess(id)} className={`rounded-2xl border bg-tray px-4 py-3 text-left text-[15px] ${guess === id ? "border-ink" : "border-line"}`}>
                {t}
              </button>
            ))}
          </div>
          <button disabled={!guess} onClick={() => { track({ phase: "learn", screen: "oil-try", event_type: "answer", item_id: "oil-predict", kc: "energy_density", response: guess, correct: guess === "lot", duration_ms: performance.now() - shownAt.current }); setShown(true); onDone(); }} className="mt-4 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white disabled:bg-line disabled:text-muted">
            Reveal the energy
          </button>
        </div>
      )}
      <AnimatePresence>
        {shown && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 max-w-3xl rounded-[24px] bg-tray p-6">
            {[
              ["Plate A", PLATE_A],
              ["Plate B", PLATE_B],
            ].map(([l, rows]) => (
              <div key={l as string} className="mb-4">
                <div className="flex justify-between text-[15px]">
                  <strong>{l as string}</strong>
                  <span className="tabular-nums text-muted">≈ {sum(rows as typeof PLATE_A)} kcal</span>
                </div>
                <div className="mt-2 flex h-8 gap-[2px] overflow-hidden rounded-lg">
                  {(rows as typeof PLATE_A).map((r, i) => (
                    <motion.div key={r.name} title={`${r.name}: about ${r.kcal} kcal`} initial={{ width: 0 }} animate={{ width: `${(r.kcal / max) * 100}%` }} transition={{ delay: i * 0.15 }} style={{ background: r.color }} />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {PLATE_B.map((r) => (
                <span key={r.name} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                  {r.name} ≈ {r.kcal}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed">
              {condition === "predict" && guess ? (guess === "lot" ? "You spotted it. " : "Most people underestimate this. ") : ""}
              Two tablespoons of oil add about 240 kcal — more than the chicken — while barely changing how the plate looks. Fat isn&rsquo;t
              &ldquo;bad&rdquo;; it just carries a lot of energy in a small amount.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═════════════ Plates and snacks ═════════════ */

export function PlateModelVisual() {
  const R = 92;
  const arc = (a: number, b: number) => {
    const a0 = (a - 0.25) * 2 * Math.PI, a1 = (b - 0.25) * 2 * Math.PI;
    return `M100 100 L${100 + R * Math.cos(a0)} ${100 + R * Math.sin(a0)} A${R} ${R} 0 ${b - a > 0.5 ? 1 : 0} 1 ${100 + R * Math.cos(a1)} ${100 + R * Math.sin(a1)} Z`;
  };
  const slices = [
    { a: 0, b: 0.5, c: "var(--fiber)", l: "Vegetables & fruit", img: "/food/broccoli.webp", pos: "right-2 top-14" },
    { a: 0.5, b: 0.75, c: "var(--carb)", l: "Whole grains", img: "/food/quinoa.webp", pos: "left-4 bottom-6" },
    { a: 0.75, b: 1, c: "var(--protein)", l: "Protein", img: "/food/salmon.webp", pos: "left-4 top-4" },
  ];
  return (
    <div className="relative h-72 w-72">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <circle cx="100" cy="100" r="99" fill="white" stroke="var(--line)" />
        {slices.map((s, i) => (
          <motion.path key={s.l} d={arc(s.a, s.b)} fill={s.c} fillOpacity={0.85} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.2 }} style={{ transformOrigin: "100px 100px" }} />
        ))}
        <circle cx="100" cy="100" r="99" fill="none" stroke="white" strokeWidth="5" />
      </svg>
      {slices.map((s) => (
        <img key={s.l} src={s.img} alt="" className={`illus absolute h-20 w-20 ${s.pos}`} />
      ))}
      <img src="/food/avocado.webp" alt="" className="illus absolute -bottom-2 -right-2 h-16 w-16" />
    </div>
  );
}

const ADDONS: { id: string; food: Food; label: string; effect: "add" | "remove" }[] = [
  { id: "chicken", food: FOODS.chicken, label: "Add a palm of chicken", effect: "add" },
  { id: "beans", food: FOODS.beans, label: "Add ½ cup black beans", effect: "add" },
  { id: "broccoli", food: FOODS.broccoli, label: "Add a fist of broccoli", effect: "add" },
  { id: "removepasta", food: FOODS.pasta, label: "Remove the pasta", effect: "remove" },
  { id: "soda", food: FOODS.soda, label: "Add a soda", effect: "add" },
  { id: "oil", food: FOODS.oil, label: "Add 2 tbsp more oil", effect: "add" },
];

/** One line of feedback per thing the learner did (or still needs), so the feedback matches the plate they see. */
function plateNotes(chosen: string[]): { ok: boolean; text: string }[] {
  const notes: { ok: boolean; text: string }[] = [];
  const has = (id: string) => chosen.includes(id);
  if (has("chicken")) notes.push({ ok: true, text: "Chicken adds the missing protein (about 26 g)." });
  if (has("beans")) notes.push({ ok: true, text: "Black beans add the missing protein (about 8 g) and some fiber." });
  if (!has("chicken") && !has("beans")) notes.push({ ok: false, text: "Still no real protein source — pasta alone has only a little." });
  if (has("broccoli")) notes.push({ ok: true, text: "Broccoli adds vegetables and fiber, the other missing part of the plate." });
  else notes.push({ ok: false, text: has("beans") ? "Beans bring some fiber, but the plate still has no vegetables." : "Still no vegetables — a fist of broccoli would add them." });
  if (has("removepasta")) notes.push({ ok: false, text: "Removing the pasta takes away the main energy source right before practice." });
  if (has("soda")) notes.push({ ok: false, text: "Soda adds 39 g of added sugar but no missing role." });
  if (has("oil")) notes.push({ ok: false, text: "Extra oil adds about 240 kcal of fat but no missing role." });
  return notes;
}

export function PlateBuilder({ onDone }: { onDone: () => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const shownAt = useRef(performance.now());

  const plate = useMemo(() => {
    const items: Food[] = chosen.includes("removepasta") ? [] : [FOODS.pasta, FOODS.pasta];
    for (const c of chosen) {
      const a = ADDONS.find((x) => x.id === c)!;
      if (a.effect === "add") items.push(c === "oil" ? { ...a.food, kcal: 240, fat: 28 } : a.food);
    }
    return items;
  }, [chosen]);
  const total = plate.reduce((t, f) => ({ kcal: t.kcal + f.kcal, carb: t.carb + f.carb, protein: t.protein + f.protein, fat: t.fat + f.fat, fiber: t.fiber + f.fiber }), { kcal: 0, carb: 0, protein: 0, fat: 0, fiber: 0 });
  const roles = new Set<Macro>(plate.flatMap((f) => f.roles));
  const hasProtein = chosen.includes("chicken") || chosen.includes("beans");
  const good = hasProtein && chosen.includes("broccoli") && !chosen.includes("removepasta") && !chosen.includes("soda");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <p className="text-[16px] leading-relaxed text-muted">
          Lunch: a big plate of pasta (2 fists) with a little tomato sauce. You have practice this afternoon. Choose up to <strong className="text-ink">two</strong> changes.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {ADDONS.map((a) => {
            const on = chosen.includes(a.id);
            return (
              <button
                key={a.id}
                disabled={checked || (!on && chosen.length >= 2)}
                aria-pressed={on}
                onClick={() => {
                  const next = on ? chosen.filter((x) => x !== a.id) : [...chosen, a.id];
                  setChosen(next);
                  track({ phase: "learn", screen: "plate-try", event_type: "click", item_id: `plate-${a.id}`, kc: "plate_adjust", response: next });
                }}
                className={`flex items-center gap-3 rounded-2xl border bg-tray p-3 text-left text-[15px] transition-colors disabled:opacity-45 ${on ? "border-ink ring-2 ring-ink" : "border-line hover:border-muted"}`}
              >
                <img src={a.food.img} alt="" className="illus h-12 w-12" />
                <span className="font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
        {!checked ? (
          <button
            disabled={chosen.length === 0}
            onClick={() => {
              setChecked(true);
              track({ phase: "learn", screen: "plate-try", event_type: "answer", item_id: "plate-fix", kc: "plate_adjust", response: chosen, correct: good, duration_ms: performance.now() - shownAt.current });
              onDone();
            }}
            className="mt-5 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            Check my plate
          </button>
        ) : (
          <div className={`mt-5 rounded-2xl p-4 text-[15px] leading-relaxed ${good ? "bg-cream-2" : "bg-[#fde9e1]"}`}>
            <p className="font-semibold">{good ? "A balanced fix." : "Here's what your changes did"}</p>
            <ul className="mt-2 grid gap-1.5">
              {plateNotes(chosen).map((n) => (
                <li key={n.text} className="grid grid-cols-[18px_1fr] gap-1.5">
                  <span aria-hidden className={n.ok ? "text-ink" : "text-red"}>
                    {n.ok ? "✓" : "•"}
                  </span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ul>
            {!good && (
              <p className="mt-2 text-muted">
                Strongest two changes here: a protein (chicken or beans) plus a fist of broccoli — the pasta stays as fuel for practice.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-[28px] bg-night p-5 text-[#fdfbee]">
        <div className="relative mx-auto h-44 w-full max-w-[300px]">
          <img src="/food/plate.webp" alt="" className="illus absolute inset-x-0 bottom-0 w-full" />
          <AnimatePresence>
            {plate.map((f, i) => (
              <motion.img
                key={`${f.id}-${i}`}
                src={f.img}
                alt=""
                className="illus absolute h-20 w-20"
                style={{ left: `${12 + ((i * 23) % 62)}%`, top: `${8 + ((i * 37) % 30)}%` }}
                initial={{ y: -60, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 14 }}
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5" aria-live="polite">
          {(["carb", "protein", "fat", "fiber"] as Macro[]).map((r) => (
            <motion.span key={r} animate={{ opacity: roles.has(r) ? 1 : 0.25 }} className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: MACRO[r].color }}>
              {MACRO[r].label}
            </motion.span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
          <div className="rounded-xl bg-white/10 p-2.5">
            <p className="text-[#fdfbee]/60">Energy</p>
            <p className="font-display text-[22px] font-bold">{Math.round(total.kcal)} kcal</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5">
            <p className="text-[#fdfbee]/60">Protein / Fiber</p>
            <p className="font-display text-[22px] font-bold">
              {Math.round(total.protein)} g / {Math.round(total.fiber)} g
            </p>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-[#fdfbee]/50">Typical values; sauce not counted.</p>
      </div>
    </div>
  );
}

const SNACKS = [
  { id: "crackers", base: FOODS.crackers, need: "protein" as Macro, options: [FOODS.cheese, FOODS.granola, FOODS.soda], correct: "cheese", why: "Crackers are the carbohydrate; a cheese stick adds protein." },
  { id: "jerky", base: FOODS.jerky, need: "carb" as Macro, options: [FOODS.egg, FOODS.apple, FOODS.cheese], correct: "apple", why: "Jerky is mostly protein; an apple adds carbohydrate and fiber." },
  { id: "berries", base: FOODS.raspberries, need: "protein" as Macro, options: [FOODS.regular, FOODS.greek, FOODS.almondmilk], correct: "greek", why: "Greek yogurt adds about twice the protein of regular, for the same cup." },
];

export function SnackMatch({ onDone }: { onDone: () => void }) {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const shownAt = useRef(performance.now());
  useEffect(() => {
    if (k >= SNACKS.length) onDone();
  }, [k, onDone]);
  const s = SNACKS[k];
  if (!s) return <p className="rounded-2xl bg-tray p-5">Three balanced snacks. Now explain one below.</p>;
  return (
    <div className="rounded-[28px] bg-tray p-6 sm:p-8">
      <p className="text-[13px] font-medium text-muted">
        Snack {k + 1} of {SNACKS.length}
      </p>
      <p className="font-display mt-1 text-[24px] font-bold leading-tight">
        You have {s.base.name.toLowerCase()}. Which addition brings in {MACRO[s.need].label.toLowerCase()}?
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-col items-center rounded-[22px] bg-cream-2 p-3">
          <img src={s.base.img} alt="" className="illus h-24 w-24" />
          <p className="mt-1 text-[13px] font-semibold">{s.base.name}</p>
        </div>
        <span className="font-display text-[34px] font-bold text-muted">+</span>
        {s.options.map((o) => {
          const right = o.id === s.correct;
          return (
            <motion.button
              key={o.id}
              whileHover={{ y: -4 }}
              disabled={!!pick}
              onClick={() => {
                setPick(o.id);
                track({ phase: "learn", screen: "snack-try", event_type: "answer", item_id: `snack-${s.id}`, kc: "snack_pairing", response: o.id, correct: right, duration_ms: performance.now() - shownAt.current });
              }}
              className={`flex w-36 flex-col items-center rounded-[22px] border p-3 ${pick ? (right ? "border-ok bg-cream-2" : pick === o.id ? "border-wrong bg-[#fde9e1]" : "border-line opacity-50") : "border-line hover:border-ink"}`}
            >
              <img src={o.img} alt="" className="illus h-20 w-20" />
              <p className="mt-1 text-center text-[13px] font-semibold leading-tight">{o.name}</p>
              {pick && <p className="mt-1 text-[12px] text-muted">{o.protein} g protein · {o.carb} g carb</p>}
            </motion.button>
          );
        })}
      </div>
      {pick && (
        <div className="mt-5">
          <p className="text-[15px] leading-relaxed">
            <strong>{pick === s.correct ? "Balanced. " : "Not quite. "}</strong>
            {s.why}
          </p>
          <button onClick={() => { setK(k + 1); setPick(null); shownAt.current = performance.now(); }} className="mt-3 rounded-full bg-ink px-5 py-2 text-[14px] font-semibold text-white">
            {k + 1 < SNACKS.length ? "Next snack" : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
}
