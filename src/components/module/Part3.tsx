"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Condition } from "@/lib/session";
import { track } from "@/lib/track";
import { Practice } from "./Practice";

/* Hand-portion guide (Human Performance Resources by CHAMP, HPRC). */
const HANDS = [
  { key: "fist", glyph: "✊", name: "Your fist", amount: "about 1 cup", uses: "Cooked rice or pasta, cereal, raw vegetables, a glass of milk" },
  { key: "cupped", glyph: "🤲", name: "A cupped palm", amount: "about ½ cup", uses: "Cooked grains, beans, fruit, starchy sides" },
  { key: "palm", glyph: "✋", name: "Your open palm", amount: "about 3 oz", uses: "Cooked meat, fish, poultry — the palm only, no fingers" },
  { key: "thumb", glyph: "👍", name: "Your thumb", amount: "about 2 tablespoons", uses: "Peanut butter, salad dressing, oil, butter" },
];

/* 3.1 — four cards that fan out and flip */
export function HandCards({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState<string[]>([]);
  useEffect(() => {
    if (open.length === HANDS.length) onDone();
  }, [open, onDone]);

  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Counting calories in a dining hall, at a party, or in a mixed dish is hard. Your hand is always with you and grows with you, so it
        makes a practical measuring tool. Open each card.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4" style={{ perspective: 1200 }}>
        {HANDS.map((h, i) => {
          const isOpen = open.includes(h.key);
          return (
            <motion.button
              key={h.key}
              initial={{ opacity: 0, y: 40, rotate: (i - 1.5) * 6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 140, damping: 16 }}
              onClick={() => {
                if (isOpen) return;
                setOpen((o) => [...o, h.key]);
                track({ phase: "learn", screen: "3.1-hands", event_type: "click", item_id: `hand-${h.key}`, kc: "portion_estimation" });
              }}
              aria-expanded={isOpen}
              className="relative h-56 text-left"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: isOpen ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-ink p-5 text-white" style={{ backfaceVisibility: "hidden" }}>
                  <span className="text-[52px] leading-none" aria-hidden>
                    {h.glyph}
                  </span>
                  <div>
                    <p className="font-display text-[22px] font-bold leading-tight">{h.name}</p>
                    <p className="mt-1 text-[13px] text-white/70">Tap to open</p>
                  </div>
                </div>
                <div
                  className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-tray p-5"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "inset 0 0 0 1px var(--line)" }}
                >
                  <div>
                    <p className="text-[13px] text-muted">{h.name} ≈</p>
                    <p className="font-display text-[26px] font-bold leading-tight text-leaf">{h.amount}</p>
                  </div>
                  <p className="text-[14px] leading-snug">{h.uses}</p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-6 max-w-[62ch] text-[14px] leading-relaxed text-muted">
        These are rough reference amounts, not how much you should eat. Hand sizes vary; once, compare your fist to a measuring cup to
        calibrate.
      </p>
    </div>
  );
}

/* 3.2 — estimate real portions */
export function PortionPractice({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const items = [
    {
      id: "3.2-rice",
      kc: "portion_estimation" as const,
      image: "/food/rice.jpg",
      prompt: "A dining-hall scoop of rice is about the size of two of your fists. Roughly how much rice is that?",
      options: [
        { id: "a", text: "About ½ cup" },
        { id: "b", text: "About 1 cup" },
        { id: "c", text: "About 2 cups" },
        { id: "d", text: "About 4 cups" },
      ],
      correct: "c",
      explain: "One fist ≈ 1 cup, so two fists ≈ 2 cups of rice.",
    },
    {
      id: "3.2-chicken",
      kc: "portion_estimation" as const,
      image: "/food/chicken.jpg",
      prompt: "The sliced chicken on your plate would cover about two of your palms. Roughly how much is that?",
      options: [
        { id: "a", text: "About 2 oz" },
        { id: "b", text: "About 6 oz" },
        { id: "c", text: "About 12 oz" },
        { id: "d", text: "About 1 oz" },
      ],
      correct: "b",
      explain: "One open palm ≈ 3 oz of cooked meat, so two palms ≈ 6 oz.",
    },
    {
      id: "3.2-pb",
      kc: "portion_estimation" as const,
      prompt: "You spread peanut butter on toast. It looks like about two thumbs' worth. Roughly how much is that?",
      options: [
        { id: "a", text: "About 1 teaspoon" },
        { id: "b", text: "About 2 tablespoons" },
        { id: "c", text: "About 4 tablespoons" },
        { id: "d", text: "About 1 cup" },
      ],
      correct: "c",
      explain: "One thumb ≈ 2 tablespoons, so two thumbs ≈ 4 tablespoons. Peanut butter is mostly fat, so small amounts carry a lot of energy.",
    },
  ];
  return (
    <div className="grid max-w-xl gap-10">
      {items.slice(0, step + 1).map((it, i) => (
        <Practice key={it.id} item={it} onDone={() => (i === items.length - 1 ? onDone() : setStep((s) => Math.max(s, i + 1)))} />
      ))}
    </div>
  );
}

/* 3.3 — two plates that look almost the same */
const PLATE_A = [
  { name: "Rice, 1 fist", kcal: 205, color: "var(--carb)" },
  { name: "Chicken, 1 palm", kcal: 140, color: "var(--protein)" },
  { name: "Broccoli, 1 fist", kcal: 30, color: "var(--fiber)" },
];
const PLATE_B = [...PLATE_A, { name: "Oil, 1 thumb (2 tbsp)", kcal: 240, color: "var(--fat)" }];
const sum = (rows: { kcal: number }[]) => rows.reduce((a, b) => a + b.kcal, 0);

function PlatePicture({ label, oil }: { label: string; oil: boolean }) {
  return (
    <div className="rounded-3xl bg-tray p-4 text-center">
      <p className="text-[15px] font-semibold">{label}</p>
      <div className="relative mx-auto mt-2 h-44 w-44">
        <img src="/food/rice.jpg" alt="" className="food absolute left-0 top-2 w-24" draggable={false} />
        <img src="/food/chicken.jpg" alt="" className="food absolute right-0 top-0 w-24" draggable={false} />
        <img src="/food/broccoli.jpg" alt="" className="food absolute bottom-0 left-1/2 w-24 -translate-x-1/2" draggable={false} />
        {oil && (
          <span className="absolute bottom-4 right-0 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: "var(--fat)" }}>
            + oil drizzle
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] text-muted">{oil ? "Same food, stir-fried in about 2 tbsp oil" : "Steamed, no added oil"}</p>
    </div>
  );
}

export function PlateCompare({ condition, onDone }: { condition: Condition; onDone: () => void }) {
  const [guess, setGuess] = useState<string | null>(null);
  const [shown, setShown] = useState(condition === "told");
  const shownAt = useRef(performance.now());
  const max = sum(PLATE_B);

  useEffect(() => {
    if (condition === "told") onDone();
  }, [condition, onDone]);

  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Portions you can see are only part of the story. Energy-dense additions like oil, butter, and dressing take up little space.
      </p>
      <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        <PlatePicture label="Plate A" oil={false} />
        <PlatePicture label="Plate B" oil />
      </div>

      {condition === "predict" && !shown && (
        <div className="mt-8 max-w-xl">
          <p className="text-[19px] font-semibold leading-snug">Predict first: how does Plate B&rsquo;s energy compare with Plate A&rsquo;s?</p>
          <div className="mt-4 grid gap-2">
            {[
              ["same", "About the same — the oil is barely visible"],
              ["little", "A little more, maybe 50 kcal"],
              ["lot", "A lot more, around 200–250 kcal"],
            ].map(([id, text]) => (
              <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-tray px-4 py-3 ${guess === id ? "border-ink" : "border-line"}`}>
                <input type="radio" name="plate-guess" checked={guess === id} onChange={() => setGuess(id)} className="accent-[var(--ink)]" />
                {text}
              </label>
            ))}
          </div>
          <button
            disabled={!guess}
            onClick={() => {
              track({ phase: "learn", screen: "3.3-plates", event_type: "answer", item_id: "3.3-plate-predict", kc: "energy_density", response: guess, correct: guess === "lot", duration_ms: performance.now() - shownAt.current });
              setShown(true);
              onDone();
            }}
            className="mt-4 rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
          >
            Reveal the energy
          </button>
        </div>
      )}

      <AnimatePresence>
        {shown && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 max-w-2xl">
            {[
              ["Plate A", PLATE_A],
              ["Plate B", PLATE_B],
            ].map(([label, rows]) => (
              <div key={label as string} className="mb-4">
                <div className="flex items-baseline justify-between text-[15px]">
                  <span className="font-semibold">{label as string}</span>
                  <span className="tabular-nums text-muted">≈ {sum(rows as typeof PLATE_A)} kcal</span>
                </div>
                <div className="mt-2 flex h-8 overflow-hidden rounded-xl">
                  {(rows as typeof PLATE_A).map((r, i) => (
                    <motion.div
                      key={r.name}
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.kcal / max) * 100}%` }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      title={`${r.name}: about ${r.kcal} kcal`}
                      style={{ background: r.color }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {PLATE_B.map((r) => (
                <span key={r.name} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                  {r.name} ≈ {r.kcal} kcal
                </span>
              ))}
            </div>
            <p className="mt-5 text-[15px] leading-relaxed">
              {condition === "predict" && guess && (guess === "lot" ? "You spotted it. " : "Most people underestimate this. ")}
              Two tablespoons of oil add about 240 kcal — more than the chicken — while barely changing how the plate looks. Fat isn&rsquo;t
              &ldquo;bad&rdquo;; it just carries a lot of energy in a small amount. Values are approximate.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
