"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, MotionValue } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";

/* ── A statement that lights up word by word as you scroll (after realfood.gov) ── */
function Word({ word, i, n, p }: { word: string; i: number; n: number; p: MotionValue<number> }) {
  const start = (i / n) * 0.8;
  const opacity = useTransform(p, [start, start + 0.12], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.24em] inline-block">
      {word}
    </motion.span>
  );
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 45%"] });
  const words = "Most of us know which foods are “healthy.” Far fewer can say what a meal actually gives them, how much of it is there, or how to change it.".split(" ");
  return (
    <section className="bg-night text-[#fdfbee]">
      <div ref={ref} className="mx-auto max-w-5xl px-6 py-[22vh] sm:px-10">
        <p className="font-display text-[clamp(30px,4.6vw,64px)] font-bold leading-[1.06] tracking-[-0.015em]">
          {words.map((w, i) => (
            <Word key={i} word={w} i={i} n={words.length} p={scrollYProgress} />
          ))}
        </p>
      </div>
    </section>
  );
}

/* ── Numbers that count up when they enter the screen ── */
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1100);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{v.toFixed(decimals)}</span>;
}

const FACTS: { n: number; unit: string; body: string; color: string; img: string }[] = [
  { n: 4, unit: "kcal", body: "in every gram of carbohydrate or protein", color: "var(--carb)", img: "/illus/bread.svg" },
  { n: 9, unit: "kcal", body: "in every gram of fat — more than twice as much", color: "var(--fat)", img: "/illus/olive-oil.svg" },
  { n: 1, unit: "fist", body: "is about one cup of rice, pasta, or cereal", color: "var(--red)", img: "/illus/hand-fist.svg" },
  { n: 17, unit: "g", body: "of protein in a cup of plain Greek yogurt vs. about 9 g in regular", color: "var(--protein)", img: "/illus/yogurt.svg" },
];

export function Facts() {
  return (
    <section className="bg-porcelain">
      <div className="mx-auto max-w-7xl px-6 py-28 sm:px-10">
        <h2 className="font-display max-w-[16ch] text-[clamp(36px,5vw,72px)] font-extrabold leading-[0.92] tracking-[-0.02em]">
          A few numbers worth carrying around
        </h2>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <motion.div
              key={f.unit + f.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 120, damping: 18 }}
              className="relative overflow-hidden rounded-[28px] bg-tray p-6"
            >
              <img src={f.img} alt="" className="illus absolute -right-6 -top-6 h-32 w-32 opacity-90" />
              <p className="font-display text-[84px] font-extrabold leading-none tracking-[-0.03em]" style={{ color: f.color }}>
                <CountUp to={f.n} />
                <span className="ml-1 text-[26px] font-bold text-ink">{f.unit}</span>
              </p>
              <p className="mt-5 max-w-[22ch] text-[16px] leading-snug text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── The four roles, as a stacked illustrated grid (after realfood's pyramid) ── */
const ROLE_PANELS: { role: Macro; line: string; foods: string[] }[] = [
  { role: "carb", line: "Your body's main quick fuel — brain, muscles, long study days.", foods: ["rice", "bread", "pasta", "banana", "potato", "oatmeal"] },
  { role: "protein", line: "Builds and repairs tissue, and helps a meal keep you full.", foods: ["salmon", "chicken", "egg", "tofu", "yogurt", "edamame"] },
  { role: "fat", line: "Concentrated energy that helps absorb some vitamins.", foods: ["avocado", "almonds", "olive-oil", "peanut-butter"] },
  { role: "fiber", line: "Supports digestion and fullness; comes with plants.", foods: ["broccoli", "spinach", "raspberries", "carrot", "apple", "black-beans"] },
];

export function FourRoles() {
  return (
    <section className="bg-porcelain pb-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <h2 className="font-display max-w-[14ch] text-[clamp(36px,5vw,72px)] font-extrabold leading-[0.92] tracking-[-0.02em]">
          Four roles on every plate
        </h2>
        <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-muted">
          Some foods play more than one. Beans are protein, carbohydrate, and fiber at once. Peanut butter is grouped with protein, but most of its
          energy is fat. That&rsquo;s where the module starts.
        </p>
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {ROLE_PANELS.map((p, i) => (
            <motion.div
              key={p.role}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: (i % 2) * 0.12, type: "spring", stiffness: 110, damping: 18 }}
              className="group relative min-h-[300px] overflow-hidden rounded-[32px] bg-cream-2 p-7 text-ink"
            >
              <p className="font-display text-[44px] font-extrabold leading-none" style={{ color: MACRO[p.role].color }}>{MACRO[p.role].label}</p>
              <p className="mt-3 max-w-[30ch] text-[16px] leading-snug text-ink/75">{p.line}</p>
              <div className="absolute inset-x-4 bottom-2 flex items-end justify-center">
                {p.foods.map((f, k) => (
                  <img
                    key={f}
                    src={`/illus/${f}.svg`}
                    alt=""
                    className="illus -mx-2 h-28 w-28 transition-transform duration-500 group-hover:-translate-y-3 sm:h-32 sm:w-32"
                    style={{ transitionDelay: `${k * 40}ms`, transform: `rotate(${(k - p.foods.length / 2) * 4}deg)` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── The route through the module ── */
const ROUTE = [
  { t: "Pre-check", m: "10 min", b: "What you already know. Skip anything you're unsure of.", img: "/illus/crackers.svg" },
  { t: "Macronutrients", m: "12 min", b: "Carbs, protein, fat, fiber — with flip cards for real foods.", img: "/illus/pasta.svg" },
  { t: "Energy", m: "7 min", b: "Calories, BMR, daily energy use, and what BMI can't say.", img: "/illus/banana.svg" },
  { t: "Portions by hand", m: "6 min", b: "Fist, palm, cupped hand, thumb — estimating without a scale.", img: "/illus/hand-palm.svg" },
  { t: "Build a plate", m: "5 min", b: "Fix a lunch, pair a snack, explain why.", img: "/illus/salmon.svg" },
  { t: "Post-check", m: "10 min", b: "See how far you moved.", img: "/illus/apple.svg" },
];

export function Route() {
  return (
    <section className="bg-night text-[#fdfbee]">
      <div className="mx-auto max-w-7xl px-6 py-28 sm:px-10">
        <h2 className="font-display max-w-[14ch] text-[clamp(36px,5vw,72px)] font-extrabold leading-[0.92] tracking-[-0.02em]">How the 50 minutes go</h2>
        <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTE.map((r, i) => (
            <motion.li
              key={r.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="relative overflow-hidden rounded-[28px] bg-night-2 p-6"
            >
              <img src={r.img} alt="" className="illus absolute -bottom-4 -right-4 h-28 w-28 opacity-90" />
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[40px] font-extrabold leading-none text-red">{i + 1}</span>
                <span className="text-[13px] text-[#fdfbee]/60">{r.m}</span>
              </div>
              <p className="mt-4 text-[21px] font-semibold">{r.t}</p>
              <p className="mt-2 max-w-[28ch] text-[15px] leading-relaxed text-[#fdfbee]/70">{r.b}</p>
            </motion.li>
          ))}
        </ol>
        <div className="mt-20 flex flex-col items-start gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[60ch] text-[14px] leading-relaxed text-[#fdfbee]/60">
            General nutrition education for a class project, not personal advice. What works for you depends on your health, activity, preferences,
            allergies, and food access — for personal guidance, talk with a Registered Dietitian. Answers and clicks are recorded anonymously.
          </p>
          <Link href="/start" className="inline-flex shrink-0 items-center rounded-full bg-red px-7 py-3.5 text-[16px] font-bold text-[#fdfbee] transition-transform hover:scale-[1.03]">
            Start learning
          </Link>
        </div>
      </div>
    </section>
  );
}
