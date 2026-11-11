"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, useTime, MotionValue, useMotionValueEvent } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";

/**
 * The home page opening, after the ROSSO "ingredient ballet":
 *   1. a maroon hero with a fork lifting a bite,
 *   2. a cream panel rises ("a little bit of everything"),
 *   3. the lunch's ingredients twirl in a vertical helix, each labelled with its role,
 *   4. they land on the plate and the finished lunch appears.
 * Everything is driven by scroll; the helix also drifts slowly on its own.
 */

interface Piece {
  id: string;
  name: string;
  roles: Macro[];
  size: number;
  plate: [number, number]; // landing spot, in plate-width fractions from the plate's center
}

const PIECES: Piece[] = [
  { id: "spinach", name: "Spinach", roles: ["fiber"], size: 1.0, plate: [0.1, 0.12] },
  { id: "salmon", name: "Salmon", roles: ["protein", "fat"], size: 1.1, plate: [-0.08, -0.06] },
  { id: "brown-rice", name: "Brown rice", roles: ["carb", "fiber"], size: 1.0, plate: [-0.27, -0.1] },
  { id: "egg", name: "Soft egg", roles: ["protein", "fat"], size: 0.8, plate: [0.27, 0.12] },
  { id: "avocado", name: "Avocado", roles: ["fat", "fiber"], size: 0.9, plate: [0.24, -0.08] },
  { id: "edamame", name: "Edamame", roles: ["protein", "fiber"], size: 0.85, plate: [-0.28, 0.12] },
  { id: "broccoli", name: "Broccoli", roles: ["fiber"], size: 0.95, plate: [0.12, -0.16] },
  { id: "tomato", name: "Tomatoes", roles: ["fiber"], size: 0.8, plate: [-0.06, 0.16] },
  { id: "lemon", name: "Lemon", roles: [], size: 0.6, plate: [0.36, 0.0] },
];

const MAROON = "#5a1610";

function useViewport() {
  const [v, setV] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return v;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// scroll milestones (0–1 across the whole sequence)
const BALLET_IN = 0.24;
const BALLET_SPIN_END = 0.6;
const LAND_START = 0.58;
const LAND_END = 0.74;

function Ingredient({ piece, i, n, p, time, vp, reduce }: { piece: Piece; i: number; n: number; p: MotionValue<number>; time: MotionValue<number>; vp: { w: number; h: number }; reduce: boolean }) {
  const wide = vp.w >= 900;
  const unit = Math.min(vp.w, vp.h) * (wide ? 0.17 : 0.2);
  const size = unit * piece.size;
  const cx = vp.w * 0.5;
  const R = Math.min(vp.w * (wide ? 0.13 : 0.12), 230);
  const span = vp.h * 0.6;
  const top = vp.h * 0.27;
  const plateW = Math.min(vp.w * (wide ? 0.46 : 0.9), 640);
  const plateCx = vp.w * 0.5;
  const plateCy = vp.h * 0.58;

  const compute = (v: number, ms = 0) => {
    const idle = reduce ? 0 : (ms / 1000) * 0.35 * (1 - ease(clamp((v - LAND_START) / 0.1)));
    const spin = clamp((v - BALLET_IN) / (BALLET_SPIN_END - BALLET_IN)) * Math.PI * 2.2 + idle;
    const theta = i * 1.15 + spin;
    const depth = Math.cos(theta);
    const enter = ease(clamp((v - (BALLET_IN - 0.06) - i * 0.006) / 0.1)); // rise in from below
    const sx = cx + Math.sin(theta) * R;
    const sy = top + (i / (n - 1)) * span + (1 - enter) * vp.h * 0.9;
    const ss = 0.8 + 0.26 * (depth + 1) / 2;
    const t = ease(clamp((v - LAND_START - i * 0.004) / (LAND_END - LAND_START)));
    const px = plateCx + piece.plate[0] * plateW;
    const py = plateCy + piece.plate[1] * plateW * 0.55;
    const ps = wide ? 0.62 : 0.5;
    return {
      x: sx + (px - sx) * t - size / 2,
      y: sy + (py - sy) * t - size / 2,
      s: ss + (ps - ss) * t,
      r: (1 - t) * Math.sin(theta) * 16,
      z: Math.round(t > 0.5 ? 20 + piece.plate[1] * 100 : 20 + depth * 10),
      depth,
      t,
      side: Math.sin(theta) >= 0 ? 1 : -1,
      enter,
    };
  };

  const x = useTransform([p, time], ([v, t]: number[]) => compute(v, t).x);
  const y = useTransform([p, time], ([v, t]: number[]) => compute(v, t).y);
  const scale = useTransform([p, time], ([v, t]: number[]) => compute(v, t).s);
  const rotate = useTransform([p, time], ([v, t]: number[]) => compute(v, t).r);
  const zIndex = useTransform([p, time], ([v, t]: number[]) => compute(v, t).z);
  // pieces hand over to the finished painting once they have landed
  const opacity = useTransform(p, [BALLET_IN - 0.07, BALLET_IN - 0.02, LAND_END + 0.02, LAND_END + 0.07], [0, 1, 1, 0]);
  const labelOpacity = useTransform([p, time], ([v, t]: number[]) => {
    const c = compute(v, t);
    const appear = clamp((v - BALLET_IN - 0.02) / 0.05);
    const leave = 1 - clamp((v - LAND_START + 0.03) / 0.04);
    return appear * leave * clamp((c.depth + 0.2) / 0.5);
  });
  const [side, setSide] = useState(1);
  useMotionValueEvent(time, "change", (t) => {
    const s = compute(p.get(), t).side;
    if (s !== side) setSide(s);
  });

  return (
    <motion.div className="absolute left-0 top-0" style={{ x, y, zIndex, width: size, height: size, opacity }}>
      <motion.div style={{ scale, rotate }} className="h-full w-full">
        <img src={`/food/${piece.id}.webp`} alt={piece.name} className="illus h-full w-full object-contain drop-shadow-[0_14px_14px_rgba(60,20,10,0.18)]" />
      </motion.div>
      {piece.roles.length > 0 && (
        <motion.div
          style={{ opacity: labelOpacity }}
          className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap ${side > 0 ? "left-[96%]" : "right-[96%] flex-row-reverse"}`}
        >
          <span className="h-px w-6 bg-[#5a1610]/50 sm:w-12" />
          <span className={`flex flex-col gap-1 ${side > 0 ? "items-start" : "items-end"}`}>
            <span className="font-serif text-[13px] italic text-[#5a1610] sm:text-[17px]">{piece.name}</span>
            <span className="flex gap-1">
              {piece.roles.map((r) => (
                <span key={r} className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white sm:text-[10.5px]" style={{ background: MACRO[r].color }}>
                  {MACRO[r].label}
                </span>
              ))}
            </span>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LunchBallet() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const vp = useViewport();
  const wide = vp.w >= 900;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const time = useTime();

  // 1 · maroon hero
  const heroOpacity = useTransform(p, [0, 0.1, 0.16], [1, 1, 0]);
  const heroY = useTransform(p, [0, 0.16], [0, -60]);
  const forkY = useTransform(p, [0, 0.22], [0, -vp.h * 1.25]);
  const forkOpacity = useTransform(p, [0.14, 0.22], [1, 0]);
  const forkRot = useTransform(p, [0, 0.2], [-8, 14]);
  const forkScale = useTransform(p, [0, 0.2], [1, 1.15]);
  // 2 · cream panel rises
  const panelY = useTransform(p, [0.06, 0.2], ["100%", "0%"]);
  const midOpacity = useTransform(p, [0.15, 0.19, 0.25, 0.29], [0, 1, 1, 0]);
  const midY = useTransform(p, [0.15, 0.29], [40, -40]);
  // 3 · ballet title
  const balletTitle = useTransform(p, [BALLET_IN - 0.02, BALLET_IN + 0.03, LAND_START - 0.02, LAND_START + 0.02], [0, 1, 1, 0]);
  // 4 · plate and finished lunch
  const plateW = Math.min(vp.w * (wide ? 0.46 : 0.9), 640);
  const mealW = Math.min(plateW * 1.05, vp.h * 0.6 / 0.744, vp.w * 0.94);
  const plateOpacity = useTransform(p, [LAND_START - 0.02, LAND_START + 0.04, LAND_END + 0.03, LAND_END + 0.07], [0, 1, 1, 0]);
  const plateScale = useTransform(p, [LAND_START - 0.02, LAND_START + 0.06], [0.85, 1]);
  const mealOpacity = useTransform(p, [LAND_END, LAND_END + 0.06], [0, 1]);
  const mealScale = useTransform(p, [LAND_END, 1], [0.96, 1.04]);
  const outroOpacity = useTransform(p, [LAND_END + 0.05, LAND_END + 0.11], [0, 1]);
  const outroY = useTransform(p, [LAND_END + 0.05, LAND_END + 0.11], [24, 0]);
  const outroEvents = useTransform(outroOpacity, (v) => (v > 0.6 ? "auto" : "none"));
  const heroEvents = useTransform(heroOpacity, (v) => (v > 0.5 ? "auto" : "none"));
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);

  return (
    <section ref={ref} className="relative h-[640vh]" style={{ background: MAROON }} aria-label="A healthy lunch, ingredient by ingredient">
      <div className="sticky top-0 h-svh overflow-hidden" style={{ background: MAROON }}>
        {/* site bar, ROSSO-style */}
        <div className="absolute inset-x-0 top-0 z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-[13px] sm:px-10">
          <span className="font-serif text-[20px] font-semibold tracking-[0.02em] text-[#f6ead9] mix-blend-difference">What&rsquo;s in your bowl?</span>
          <nav className="hidden items-center gap-6 text-[#f6ead9] mix-blend-difference sm:flex" aria-label="Parts">
            <Link href="/pre" className="hover:underline">Pre-check</Link>
            <Link href="/learn" className="hover:underline">Learn</Link>
            <Link href="/post" className="hover:underline">Post-check</Link>
          </nav>
        </div>

        {/* 1 · hero */}
        <motion.div style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }} className="absolute inset-0 z-30 mx-auto flex max-w-7xl flex-col justify-center px-6 sm:px-10">
          <p className="font-serif text-[15px] italic text-[#f0c9b8]">A 50-minute nutrition module for college students</p>
          <h1 className="font-serif mt-5 max-w-[11ch] text-[clamp(46px,7.6vw,120px)] font-medium uppercase leading-[0.9] tracking-[-0.01em] text-[#f6ead9]">
            What&rsquo;s really on your plate?
          </h1>
          <p className="mt-6 max-w-[38ch] text-[16px] leading-relaxed text-[#f6ead9]/80 sm:text-[17px]">
            Read a meal by what it gives you, size portions with your hand, and build a plate that fits your day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/start" className="rounded-full bg-[#f6ead9] px-7 py-3.5 text-[15px] font-semibold text-[#5a1610] transition-transform hover:scale-[1.03]">
              Start learning
            </Link>
            <Link href="/learn" className="rounded-full border border-[#f6ead9]/60 px-7 py-3.5 text-[15px] font-semibold text-[#f6ead9] transition-colors hover:bg-[#f6ead9]/10">
              Browse the lessons
            </Link>
          </div>
        </motion.div>
        <motion.img
          src="/food/fork.webp"
          alt=""
          aria-hidden
          className="illus absolute z-20"
          style={{
            height: Math.min(vp.h * 0.86, wide ? 820 : 480),
            right: wide ? vp.w * 0.08 : -vp.w * 0.12,
            top: wide ? vp.h * 0.08 : vp.h * 0.44,
            y: forkY,
            rotate: forkRot,
            scale: forkScale,
            opacity: forkOpacity,
          }}
        />

        {/* 2 · the cream panel */}
        <motion.div className="absolute inset-0 z-10 bg-[#f6f0e2]" style={{ y: panelY }}>
          <div className="grain absolute inset-0 opacity-60" />
        </motion.div>
        <motion.div style={{ opacity: midOpacity, y: midY }} className="pointer-events-none absolute inset-0 z-30 mx-auto flex max-w-7xl flex-col justify-center px-6 sm:px-10">
          <h2 className="font-serif max-w-[12ch] text-[clamp(40px,6vw,96px)] font-medium uppercase leading-[0.92] text-[#5a1610]">A little bit of everything.</h2>
          <p className="mt-5 max-w-[36ch] text-[17px] leading-relaxed text-[#3a1a14]/75">
            A good lunch isn&rsquo;t one perfect food. It&rsquo;s a cast — each ingredient brings something different.
          </p>
        </motion.div>

        {/* 3 · the ballet */}
        <motion.div style={{ opacity: balletTitle }} className="pointer-events-none absolute inset-x-0 top-[9vh] z-40 flex flex-col items-center text-center">
          <p className="font-serif text-[clamp(22px,2.6vw,34px)] uppercase tracking-[0.04em] text-[#5a1610]">The lunch ballet</p>
          <p className="mt-1 text-[13px] text-[#3a1a14]/60">Every ingredient has a job.</p>
        </motion.div>

        <motion.img
          src="/food/plate.webp"
          alt=""
          aria-hidden
          className="illus absolute z-[15]"
          style={{ width: plateW, left: vp.w * 0.5 - plateW / 2, top: vp.h * 0.58 - (plateW * 0.585) / 2, opacity: plateOpacity, scale: plateScale }}
        />
        {PIECES.map((piece, i) => (
          <Ingredient key={piece.id} piece={piece} i={i} n={PIECES.length} p={p} time={time} vp={vp} reduce={reduce} />
        ))}

        {/* 4 · the finished lunch */}
        <motion.img
          src="/food/meal.webp"
          alt="The finished lunch: salmon, brown rice, broccoli, avocado, egg, spinach, tomatoes, edamame, and lemon on a plate"
          className="illus absolute z-[60]"
          style={{ width: mealW, left: vp.w * 0.5 - mealW / 2, top: vp.h * 0.6 - (mealW * 0.744) / 2, opacity: mealOpacity, scale: mealScale }}
        />
        <motion.div
          style={{ opacity: outroOpacity, y: outroY, pointerEvents: outroEvents }}
          className="absolute inset-x-0 top-0 z-[70] mx-auto flex max-w-3xl flex-col items-center px-6 pt-[8vh] text-center"
        >
          <p className="font-serif text-[15px] italic text-[#5a1610]/80">Carbohydrate, protein, fat, and fiber — together</p>
          <h2 className="font-serif mt-3 text-[clamp(32px,4.6vw,68px)] font-medium uppercase leading-[0.95] text-[#5a1610]">Your lunch, balanced.</h2>
        </motion.div>
        <motion.div style={{ opacity: outroOpacity, pointerEvents: outroEvents }} className="absolute inset-x-0 bottom-[3.5vh] z-[70] flex justify-center gap-3">
          <Link href="/start" className="rounded-full border border-[#5a1610] bg-[#f6f0e2] px-8 py-3.5 font-serif text-[15px] uppercase tracking-[0.06em] text-[#5a1610] transition-colors hover:bg-[#5a1610] hover:text-[#f6ead9]">
            Start learning
          </Link>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 text-[12px] text-[#f6ead9]/60">
          <span>Scroll</span>
          <span className="h-9 w-[22px] rounded-full border border-[#f6ead9]/40 p-1">
            <motion.span className="block h-2 w-full rounded-full bg-[#f6ead9]/70" animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
