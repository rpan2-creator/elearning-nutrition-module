"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { track } from "@/lib/track";
import { Practice } from "./Practice";

/* Sam is fictional. Learners never enter their own body data. */
const SAM = { age: 20, heightCm: 170, weightKg: 65 };
const ACTIVITY = [
  { factor: 1.2, label: "Mostly sitting", example: "classes, studying, little walking" },
  { factor: 1.375, label: "Lightly active", example: "walks across campus, light exercise 1–3 days a week" },
  { factor: 1.55, label: "Moderately active", example: "exercise 3–5 days a week" },
  { factor: 1.725, label: "Very active", example: "hard training 6–7 days a week" },
  { factor: 1.9, label: "Extremely active", example: "athlete with twice-a-day training or physical job" },
];

function bmr(sex: "m" | "f") {
  return 10 * SAM.weightKg + 6.25 * SAM.heightCm - 5 * SAM.age + (sex === "m" ? 5 : -161);
}
const round10 = (n: number) => Math.round(n / 10) * 10;

/* 2.1 — what daily energy use is made of */
export function EnergyUse({ onDone }: { onDone: () => void }) {
  useEffect(onDone, [onDone]);
  const parts = [
    { name: "Basal metabolism (BMR)", share: 64, body: "Breathing, circulation, keeping warm — the energy your body uses at complete rest. Usually the largest part.", color: "var(--ink)" },
    { name: "Physical activity", share: 26, body: "Everything from walking to class to training. The part that changes most from day to day.", color: "var(--leaf)" },
    { name: "Digesting food", share: 10, body: "About a tenth of daily energy goes to digesting and absorbing what you eat.", color: "var(--carb)" },
  ];
  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        The energy you use in a day is called <strong className="text-ink">total daily energy expenditure (TDEE)</strong>. It has three parts. The
        shares below are a typical example for a moderately active student; they differ from person to person.
      </p>
      <div className="mt-8 flex h-16 w-full max-w-2xl overflow-hidden rounded-2xl" role="img" aria-label="BMR about 64%, activity about 26%, digestion about 10%">
        {parts.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ width: 0 }}
            animate={{ width: `${p.share}%` }}
            transition={{ delay: 0.3 + i * 0.45, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex items-center justify-center text-[14px] font-semibold text-white"
            style={{ background: p.color }}
          >
            {p.share}%
          </motion.div>
        ))}
      </div>
      <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.name} className="rounded-2xl bg-tray p-4">
            <span className="inline-block h-2.5 w-6 rounded-full" style={{ background: p.color }} />
            <p className="mt-2 text-[15px] font-semibold">{p.name}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{p.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed">
        Over weeks, eating more energy than you use tends to raise body weight, and eating less tends to lower it. Day to day, your body
        adjusts, so single days matter much less than patterns.
      </p>
    </div>
  );
}

/* 2.2 — estimating Sam's daily energy use */
export function Estimator({ onDone }: { onDone: () => void }) {
  const [sex, setSex] = useState<"m" | "f">("f");
  const [level, setLevel] = useState(1);
  const moved = useRef(0);
  const b = bmr(sex);
  const t = b * ACTIVITY[level].factor;

  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Dietitians often estimate BMR with the <strong className="text-ink">Mifflin–St Jeor equation</strong>, then multiply by an activity
        factor. Meet Sam, a fictional 20-year-old student: 170 cm, 65 kg.
      </p>

      <div className="mt-6 inline-flex rounded-full bg-tray p-1 text-[14px]" role="radiogroup" aria-label="Sam's sex for the equation">
        {(["f", "m"] as const).map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={sex === s}
            onClick={() => {
              setSex(s);
              track({ phase: "learn", screen: "2.2-estimator", event_type: "click", item_id: "2.2-sex", kc: "tdee_calc", response: s });
            }}
            className={`rounded-full px-4 py-1.5 font-medium ${sex === s ? "bg-ink text-white" : "text-muted"}`}
          >
            {s === "f" ? "Female equation" : "Male equation"}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-2xl rounded-3xl bg-tray p-5 sm:p-6">
        <p className="text-[14px] font-semibold text-muted">Step 1 · BMR</p>
        <p className="mt-2 font-mono text-[14px] leading-relaxed sm:text-[15px]">
          10 × {SAM.weightKg} kg + 6.25 × {SAM.heightCm} cm − 5 × {SAM.age} y {sex === "m" ? "+ 5" : "− 161"}
          <br />= <strong className="font-display text-[22px] not-italic">{Math.round(b).toLocaleString()} kcal/day</strong>
        </p>

        <p className="mt-6 text-[14px] font-semibold text-muted">Step 2 · Activity factor</p>
        <input
          type="range"
          min={0}
          max={ACTIVITY.length - 1}
          step={1}
          value={level}
          aria-label="Sam's activity level"
          aria-valuetext={ACTIVITY[level].label}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLevel(v);
            moved.current++;
            track({ phase: "learn", screen: "2.2-estimator", event_type: "slider", item_id: "2.2-activity", kc: "tdee_calc", response: ACTIVITY[v].factor });
          }}
          className="mt-3 w-full accent-[var(--leaf)]"
        />
        <p className="mt-2 text-[15px]">
          <strong>{ACTIVITY[level].label}</strong> × {ACTIVITY[level].factor} — {ACTIVITY[level].example}
        </p>

        <p className="mt-6 text-[14px] font-semibold text-muted">Estimated daily energy use</p>
        <motion.p key={`${sex}-${level}`} initial={{ opacity: 0.3, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display mt-1 text-[clamp(30px,5vw,44px)] font-bold leading-none">
          {round10(t * 0.9).toLocaleString()}–{round10(t * 1.1).toLocaleString()} kcal
        </motion.p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Shown as a range on purpose: equations can be off by 10% or more for an individual. This is a general estimate, not a personal
          target.
        </p>
      </div>

      <div className="mt-10 max-w-xl">
        <Practice
          onDone={onDone}
          item={{
            id: "2.2-check",
            kc: "tdee_calc",
            prompt: "Another student's estimated BMR is 1,700 kcal. They mostly sit (factor 1.2). About how much energy do they use in a day?",
            options: [
              { id: "a", text: "About 1,700 kcal" },
              { id: "b", text: "About 2,040 kcal" },
              { id: "c", text: "About 2,640 kcal" },
              { id: "d", text: "About 1,420 kcal" },
            ],
            correct: "b",
            explain: "1,700 × 1.2 = 2,040 kcal. The activity factor is always above 1, because daily use includes more than resting metabolism.",
          }}
        />
      </div>
    </div>
  );
}

/* 2.3 — BMI and its limits */
export function BmiLimits({ onDone }: { onDone: () => void }) {
  const value = SAM.weightKg / (SAM.heightCm / 100) ** 2;
  const bands = [
    { label: "Under 18.5", name: "Underweight", from: 15, to: 18.5 },
    { label: "18.5–24.9", name: "Healthy weight", from: 18.5, to: 25 },
    { label: "25–29.9", name: "Overweight", from: 25, to: 30 },
    { label: "30 and over", name: "Obesity", from: 30, to: 35 },
  ];
  const pos = ((value - 15) / 20) * 100;
  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        <strong className="text-ink">Body mass index (BMI)</strong> is weight in kilograms divided by height in meters squared. For Sam: 65 ÷
        1.70² = <strong className="text-ink">{value.toFixed(1)}</strong>.
      </p>
      <div className="mt-8 max-w-2xl">
        <div className="relative flex h-10 overflow-hidden rounded-xl text-[12px] font-medium">
          {bands.map((b, i) => (
            <div key={b.name} className="flex items-center justify-center border-r border-porcelain last:border-0" style={{ width: `${((b.to - b.from) / 20) * 100}%`, background: ["#e7ece4", "#d3e3d6", "#e7ece4", "#dfe5dc"][i] }}>
              {b.label}
            </div>
          ))}
          <motion.div initial={{ left: "0%" }} animate={{ left: `${pos}%` }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} className="absolute top-0 h-full w-1 -translate-x-1/2 bg-ink" />
        </div>
        <div className="mt-1 flex text-[12px] text-muted">
          {bands.map((b) => (
            <div key={b.name} className="text-center" style={{ width: `${((b.to - b.from) / 20) * 100}%` }}>
              {b.name}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-tray p-4">
          <p className="text-[15px] font-semibold">What BMI is good for</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">A quick screening number for adults that is easy to compare across large groups of people.</p>
        </div>
        <div className="rounded-2xl bg-tray p-4">
          <p className="text-[15px] font-semibold">What it cannot tell you</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">
            It can&rsquo;t tell muscle from fat, where fat is stored, fitness, or what someone should eat. A muscular athlete can land in
            &ldquo;overweight.&rdquo;
          </p>
        </div>
      </div>
      <div className="mt-10 max-w-xl">
        <Practice
          onDone={onDone}
          item={{
            id: "2.3-check",
            kc: "bmi_limits",
            prompt: "Two students both have a BMI of 29. One lifts weights five days a week; the other rarely exercises. What does BMI tell you about the difference between them?",
            options: [
              { id: "a", text: "They have the same amount of body fat" },
              { id: "b", text: "Very little — BMI doesn't separate muscle from fat" },
              { id: "c", text: "The lifter is less healthy" },
              { id: "d", text: "Both should eat 500 kcal less per day" },
            ],
            correct: "b",
            explain: "BMI only uses weight and height. Two people with the same BMI can have very different body composition and health.",
          }}
        />
      </div>
    </div>
  );
}
