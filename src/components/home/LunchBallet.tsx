"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, useTime, MotionValue, useMotionValueEvent } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";

/**
 * The hero: lunch ingredients float in a slow helix (after the ROSSO "ingredient
 * ballet"), each labelled with its role. Scrolling spins the helix, then every
 * ingredient drops onto the plate and the lunch assembles.
 */

interface Piece {
  id: string;
  name: string;
  roles: Macro[];
  size: number; // relative size (1 = 13% of the short viewport side)
  plate: [number, number]; // landing spot, in plate-width fractions from plate center
  rot: number;
}

const PIECES: Piece[] = [
  { id: "spinach", name: "Spinach", roles: ["fiber"], size: 1.05, plate: [-0.24, -0.08], rot: -10 },
  { id: "salmon", name: "Salmon", roles: ["protein", "fat"], size: 1.1, plate: [0.2, -0.08], rot: 8 },
  { id: "rice", name: "Rice", roles: ["carb"], size: 1.15, plate: [-0.02, -0.12], rot: 0 },
  { id: "egg", name: "Soft egg", roles: ["protein", "fat"], size: 0.72, plate: [0.04, 0.06], rot: -6 },
  { id: "avocado", name: "Avocado", roles: ["fat", "fiber"], size: 0.9, plate: [-0.17, 0.08], rot: 18 },
  { id: "edamame", name: "Edamame", roles: ["protein", "fiber"], size: 0.85, plate: [0.25, 0.08], rot: -14 },
  { id: "broccoli", name: "Broccoli", roles: ["fiber"], size: 0.9, plate: [-0.3, 0.05], rot: 6 },
  { id: "carrot", name: "Carrots", roles: ["fiber"], size: 0.8, plate: [0.32, -0.03], rot: 12 },
  { id: "tomato", name: "Cherry tomatoes", roles: ["fiber"], size: 0.7, plate: [-0.08, 0.16], rot: 0 },
  { id: "lemon", name: "Lemon", roles: [], size: 0.6, plate: [0.14, 0.16], rot: -20 },
];

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

function Ingredient({ piece, i, n, p, time, vp, reduce }: { piece: Piece; i: number; n: number; p: MotionValue<number>; time: MotionValue<number>; vp: { w: number; h: number }; reduce: boolean }) {
  const wide = vp.w >= 1024;
  const unit = Math.min(vp.w, vp.h) * (wide ? 0.19 : 0.21);
  const size = unit * piece.size;
  const cx = wide ? vp.w * 0.64 : vp.w * 0.5;
  const R = Math.min(vp.w * (wide ? 0.19 : 0.3), 320);
  const span = vp.h * (wide ? 0.74 : 0.5);
  const midY = vp.h * (wide ? 0.5 : 0.64);
  const plateW = Math.min(vp.w * (wide ? 0.5 : 0.92), 680);
  const plateCy = vp.h * (wide ? 0.6 : 0.58);
  const plateCx = vp.w * 0.5;

  const compute = (v: number, ms = 0) => {
    const idle = reduce ? 0 : (ms / 1000) * 0.22 * (1 - ease(clamp((v - 0.42) / 0.2)));
    const spin = (reduce ? 0 : clamp(v / 0.45)) * Math.PI * 1.3 + idle;
    const theta = i * 0.95 + spin;
    const depth = Math.cos(theta); // -1 back … 1 front
    const sx = cx + Math.sin(theta) * R;
    const sy = midY - span / 2 + (i / (n - 1)) * span;
    const ss = 0.78 + 0.28 * (depth + 1) / 2;
    const t = ease(clamp((v - 0.45) / 0.3));
    const px = plateCx + piece.plate[0] * plateW;
    const py = plateCy + piece.plate[1] * plateW * 0.55;
    const ps = wide ? 0.74 : 0.62;
    return {
      x: sx + (px - sx) * t - size / 2,
      y: sy + (py - sy) * t - size / 2,
      s: ss + (ps - ss) * t,
      r: piece.rot * (1 - t) + piece.rot * 0.3 * t + (1 - t) * Math.sin(theta) * 10,
      z: Math.round(t > 0.5 ? 10 + piece.plate[1] * 100 : 10 + depth * 10),
      depth,
      t,
      side: Math.sin(theta) >= 0 ? 1 : -1,
    };
  };

  const x = useTransform([p, time], ([v, t]: number[]) => compute(v, t).x);
  const y = useTransform([p, time], ([v, t]: number[]) => compute(v, t).y);
  const scale = useTransform([p, time], ([v, t]: number[]) => compute(v, t).s);
  const rotate = useTransform([p, time], ([v, t]: number[]) => compute(v, t).r);
  const zIndex = useTransform([p, time], ([v, t]: number[]) => compute(v, t).z);
  const labelOpacity = useTransform([p, time], ([v, t]: number[]) => {
    const c = compute(v, t);
    const appear = clamp((v - 0.04) / 0.08);
    const leave = 1 - clamp((v - 0.38) / 0.08);
    return appear * leave * clamp((c.depth + 0.35) / 0.6);
  });
  const [side, setSide] = useState(1);
  useMotionValueEvent(time, "change", (t) => {
    const s = compute(p.get(), t).side;
    if (s !== side) setSide(s);
  });

  return (
    <motion.div className="absolute left-0 top-0" style={{ x, y, zIndex, width: size, height: size }}>
      <motion.div style={{ scale, rotate }} className="h-full w-full">
        <div className="bob h-full w-full" style={{ animationDelay: `${-i * 0.7}s`, animationDuration: `${4.5 + (i % 3)}s` }}>
          <img src={`/illus/${piece.id}.svg`} alt={piece.name} className="illus h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(17,0,0,0.18)]" />
        </div>
      </motion.div>
      {piece.roles.length > 0 && (
        <motion.div
          style={{ opacity: labelOpacity }}
          className={
            wide
              ? `pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap ${side > 0 ? "left-[92%]" : "right-[92%] flex-row-reverse"}`
              : "pointer-events-none absolute left-1/2 top-[88%] flex -translate-x-1/2 flex-col items-center whitespace-nowrap"
          }
        >
          {wide && <span className="h-px w-8 bg-ink/40" />}
          <span className={`flex flex-col gap-1 ${!wide ? "items-center" : side > 0 ? "items-start" : "items-end"}`}>
            <span className={`font-display font-semibold text-ink ${wide ? "text-[15px]" : "text-[12px]"}`}>{piece.name}</span>
            <span className="flex gap-1">
              {piece.roles.map((r) => (
                <span key={r} className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white" style={{ background: MACRO[r].color }}>
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
  const vp = useViewport();
  const reduce = Boolean(useReducedMotion());
  const wide = vp.w >= 1024;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const time = useTime();

  const plateScale = useTransform(p, [0.38, 0.6], [0.6, 1]);
  const plateOpacity = useTransform(p, [0.38, 0.52], [0, 1]);
  const introOpacity = useTransform(p, [0, 0.3, 0.42], [1, 1, 0]);
  const introY = useTransform(p, [0.3, 0.42], [0, -40]);
  const outroOpacity = useTransform(p, [0.7, 0.82], [0, 1]);
  const outroY = useTransform(p, [0.7, 0.82], [30, 0]);
  const outroEvents = useTransform(outroOpacity, (v) => (v > 0.6 ? "auto" : "none"));
  const hintOpacity = useTransform(p, [0, 0.06], [1, 0]);
  const glow = useTransform(p, [0, 0.5, 1], ["rgba(243,240,214,0.9)", "rgba(246,201,189,0.55)", "rgba(243,240,214,0.9)"]);
  const plateW = Math.min(vp.w * (wide ? 0.5 : 0.92), 680);
  const glowBg = useTransform(glow, (g) => `radial-gradient(60% 55% at ${wide ? "64%" : "50%"} 52%, ${g}, transparent 70%)`);

  return (
    <section ref={ref} className="relative h-[420vh] bg-porcelain" aria-label="Lunch, ingredient by ingredient">
      <div className="grain sticky top-0 h-svh overflow-hidden bg-porcelain text-red-3">
        <motion.div aria-hidden className="absolute inset-0" style={{ background: glowBg }} />

        <motion.img
          src="/illus/plate.svg"
          alt=""
          aria-hidden
          className="illus absolute"
          style={{
            width: plateW,
            left: vp.w * 0.5 - plateW / 2,
            top: vp.h * (wide ? 0.6 : 0.58) - (plateW * 2) / 3 / 2,
            scale: plateScale,
            opacity: plateOpacity,
          }}
        />

        {PIECES.map((piece, i) => (
          <Ingredient key={piece.id} piece={piece} i={i} n={PIECES.length} p={p} time={time} vp={vp} reduce={reduce} />
        ))}

        <motion.div style={{ opacity: introOpacity, y: introY }} className="pointer-events-none absolute inset-0 z-30 mx-auto flex max-w-7xl flex-col px-6 pt-24 sm:px-10 lg:justify-center lg:pt-0">
          <p className="text-[14px] font-semibold text-red">A 50-minute nutrition module for college students</p>
          <h1 className="font-display mt-4 max-w-[9ch] text-[clamp(44px,8.4vw,128px)] font-extrabold leading-[0.88] tracking-[-0.025em]">
            What&rsquo;s really on your plate?
          </h1>
          <p className="mt-6 max-w-[34ch] text-[16px] leading-relaxed text-ink/70 sm:text-[17px]">
            Every lunch is a cast of ingredients, each with a job. Scroll to watch one come together.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: outroOpacity, y: outroY, pointerEvents: outroEvents }}
          className="absolute inset-x-0 top-0 z-40 mx-auto flex max-w-3xl flex-col items-center px-6 pt-[9vh] text-center"
        >
          <h2 className="font-display text-[clamp(40px,6.4vw,92px)] font-extrabold leading-[0.9] tracking-[-0.02em]">Lunch, assembled.</h2>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-ink/70">
            Carbohydrate, protein, fat, and fiber — learn to read them, size them with your hand, and adjust any plate.
          </p>
          <Link href="/start" className="mt-7 inline-flex items-center rounded-full bg-red px-7 py-3.5 text-[16px] font-bold text-[#fdfbee] transition-transform hover:scale-[1.03]">
            Start learning
          </Link>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-7 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 text-[13px] text-ink/55">
          Scroll
          <span className="h-9 w-[22px] rounded-full border border-ink/30 p-1">
            <motion.span className="block h-2 w-full rounded-full bg-ink/60" animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
