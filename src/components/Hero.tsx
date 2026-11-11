"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";

interface Ingredient {
  key: string;
  name: string;
  src: string;
  roles: Macro[];
  /** Final offset from the bowl, in vmin. */
  to: [number, number];
  size: number;
  rotate: number;
}

const INGREDIENTS: Ingredient[] = [
  { key: "beans", name: "Edamame & black beans", src: "/food/beans.jpg", roles: ["protein", "carb", "fiber"], to: [0, -37], size: 18, rotate: 4 },
  { key: "rice", name: "Jasmine rice", src: "/food/rice.jpg", roles: ["carb"], to: [-34, -14], size: 22, rotate: -8 },
  { key: "chicken", name: "Grilled chicken", src: "/food/chicken.jpg", roles: ["protein"], to: [34, -16], size: 23, rotate: 10 },
  { key: "broccoli", name: "Broccoli", src: "/food/broccoli.jpg", roles: ["fiber"], to: [-28, 24], size: 20, rotate: 6 },
  { key: "avocado", name: "Avocado", src: "/food/avocado.jpg", roles: ["fat", "fiber"], to: [30, 23], size: 20, rotate: -12 },
];

/** Tracks the viewport so the stage can be laid out in vmin and the bowl can sit right of the text on wide screens. */
function useStage() {
  const [s, setS] = useState({ vmin: 8, wide: true, radius: 1, stretchY: 1 });
  useEffect(() => {
    const on = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const narrow = w < 640;
      setS({ vmin: Math.min(w, h) / 100, wide: w >= 1024, radius: w >= 1024 ? 1 : narrow ? 1.12 : 0.9, stretchY: narrow ? 1.45 : 1 });
    };
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

function Piece({ ing, p, reduce, radius, stretchY }: { ing: Ingredient; p: MotionValue<number>; reduce: boolean; radius: number; stretchY: number }) {
  const range = reduce ? [0, 0.001] : [0.08, 0.5];
  const x = useTransform(p, range, ["0vmin", `${ing.to[0] * radius}vmin`]);
  const y = useTransform(p, range, ["-3vmin", `${ing.to[1] * radius * stretchY}vmin`]);
  const scale = useTransform(p, range, [0.5, 1]);
  const rotate = useTransform(p, range, [0, ing.rotate]);
  const labelOpacity = useTransform(p, reduce ? [0, 0.001] : [0.38, 0.52], [0, 1]);
  const size = ing.size * radius;

  return (
    <motion.div
      className="food absolute"
      style={{ x, y, width: `${size}vmin`, height: `${size}vmin`, left: `calc(-${size / 2}vmin)`, top: `calc(-${size / 2}vmin)` }}
    >
      <motion.img src={ing.src} alt={ing.name} className="block h-full w-full object-contain" style={{ scale, rotate }} draggable={false} />
      <motion.div style={{ opacity: labelOpacity }} className="absolute left-1/2 top-[92%] flex -translate-x-1/2 flex-col items-center gap-1 whitespace-nowrap">
        <span className="text-[13px] font-medium text-ink">{ing.name}</span>
        <span className="flex gap-1">
          {ing.roles.map((r) => (
            <span key={r} className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: MACRO[r].color }}>
              {MACRO[r].label}
            </span>
          ))}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { vmin, wide, radius, stretchY } = useStage();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const bowlScale = useTransform(p, [0, 0.5], [1, 0.8]);
  const lineOpacity = useTransform(p, [0.35, 0.5], [0, 1]);
  const askOpacity = useTransform(p, [0, 0.3, 0.42], [1, 1, 0]);
  const askY = useTransform(p, [0.3, 0.42], [0, -24]);
  const answerOpacity = useTransform(p, [0.52, 0.64], [0, 1]);
  const answerY = useTransform(p, [0.52, 0.64], [24, 0]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);
  const answerEvents = useTransform(answerOpacity, (v) => (v > 0.6 ? "auto" : "none"));

  // Bowl center: right of the text column on wide screens, centered (and a bit high) on narrow ones.
  const cx = wide ? "64%" : "50%";
  const cy = wide ? "50%" : "40%";

  return (
    <section ref={ref} className="relative h-[320vh]" aria-label="Introduction">
      {/* bg-porcelain here lets the white-background food photos multiply into the page */}
      <div className="sticky top-0 h-svh overflow-hidden bg-porcelain">
        <div className="absolute" style={{ left: cx, top: cy }}>
          <motion.svg aria-hidden className="pointer-events-none absolute overflow-visible" width="1" height="1" style={{ opacity: lineOpacity }}>
            {INGREDIENTS.map((ing) => (
              <line
                key={ing.key}
                x1={0}
                y1={0}
                x2={ing.to[0] * radius * vmin * 0.7}
                y2={ing.to[1] * radius * stretchY * vmin * 0.7}
                stroke="#b9c4b6"
                strokeWidth="1.5"
                strokeDasharray="3 5"
              />
            ))}
          </motion.svg>
          <motion.img
            src="/food/bowl.jpg"
            alt=""
            aria-hidden
            className="food absolute max-w-none"
            style={{ scale: bowlScale, width: `${42 * radius}vmin`, left: `-${21 * radius}vmin`, top: `-${21 * radius}vmin` }}
            draggable={false}
          />
          {INGREDIENTS.map((ing) => (
            <Piece key={ing.key} ing={ing} p={p} reduce={reduce} radius={radius} stretchY={stretchY} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-6xl px-5 pt-8 sm:px-8 lg:items-center lg:pt-0">
          <motion.h1
            style={{ opacity: askOpacity, y: askY }}
            className="font-display max-w-[9ch] text-[clamp(44px,7.5vw,104px)] font-bold leading-[0.92] tracking-[-0.02em] lg:max-w-[7.5ch]"
          >
            What&rsquo;s actually in your bowl?
          </motion.h1>
        </div>

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-6xl items-end px-5 pb-6 sm:px-8 lg:items-center lg:pb-0">
          <motion.div style={{ opacity: answerOpacity, y: answerY, pointerEvents: answerEvents }} className="w-full max-w-sm rounded-3xl bg-tray/95 p-5 sm:p-7 lg:max-w-[380px]">
            <h2 className="font-display text-[clamp(28px,4vw,44px)] font-bold leading-none">One bowl, four roles.</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              Some foods play more than one. In about 50 minutes you&rsquo;ll learn to read a meal, estimate portions with your hand, and
              adjust a plate or snack.
            </p>
            <Link href="/start" className="mt-5 inline-flex items-center rounded-full bg-ink px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-leaf">
              Start the module
            </Link>
          </motion.div>
        </div>

        <motion.p style={{ opacity: hintOpacity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[13px] text-muted">
          Scroll to open the bowl
        </motion.p>
      </div>
    </section>
  );
}
