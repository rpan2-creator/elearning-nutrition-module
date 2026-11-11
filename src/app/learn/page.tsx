"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FlowHeader, Button, useFlowGuard } from "@/components/Shell";
import type { Condition } from "@/lib/session";
import { completePhase } from "@/lib/flow";
import { track } from "@/lib/track";
import { BowlSort, EnergyPerGram, RolesIntro, SimilarFoods } from "@/components/module/Part1";
import { BmiLimits, EnergyUse, Estimator } from "@/components/module/Part2";
import { HandCards, PlateCompare, PortionPractice } from "@/components/module/Part3";
import { PlateFix, PlateModel, SnackPairs, Wrap } from "@/components/module/Part4";

type ScreenProps = { condition: Condition; onDone: () => void };
interface Screen {
  id: string;
  part: number;
  title: string;
  Body: (p: ScreenProps) => React.ReactNode;
}

const PARTS = ["What's in your food", "What your body uses", "Portions by hand", "Adjust a plate or snack", "Take it with you"];

const SCREENS: Screen[] = [
  { id: "1.1-roles", part: 0, title: "Four roles on every plate", Body: ({ onDone }) => <RolesIntro onDone={onDone} /> },
  { id: "1.2-bowl", part: 0, title: "Open the bowl", Body: ({ condition, onDone }) => <BowlSort condition={condition} onDone={onDone} /> },
  { id: "1.3-energy", part: 0, title: "Energy per gram", Body: ({ onDone }) => <EnergyPerGram onDone={onDone} /> },
  { id: "1.4-similar", part: 0, title: "Same name, different food", Body: ({ condition, onDone }) => <SimilarFoods condition={condition} onDone={onDone} /> },
  { id: "2.1-tdee", part: 1, title: "Where a day's energy goes", Body: ({ onDone }) => <EnergyUse onDone={onDone} /> },
  { id: "2.2-estimator", part: 1, title: "Estimating daily energy use", Body: ({ onDone }) => <Estimator onDone={onDone} /> },
  { id: "2.3-bmi", part: 1, title: "What BMI can and can't tell you", Body: ({ onDone }) => <BmiLimits onDone={onDone} /> },
  { id: "3.1-hands", part: 2, title: "Your hand is a measuring tool", Body: ({ onDone }) => <HandCards onDone={onDone} /> },
  { id: "3.2-estimate", part: 2, title: "Estimate real portions", Body: ({ onDone }) => <PortionPractice onDone={onDone} /> },
  { id: "3.3-plates", part: 2, title: "Two plates that look alike", Body: ({ condition, onDone }) => <PlateCompare condition={condition} onDone={onDone} /> },
  { id: "4.1-plate", part: 3, title: "A plate as a reference", Body: ({ onDone }) => <PlateModel onDone={onDone} /> },
  { id: "4.2-fix", part: 3, title: "Fix a pasta plate", Body: ({ onDone }) => <PlateFix onDone={onDone} /> },
  { id: "4.3-snack", part: 3, title: "Build a balanced snack", Body: ({ onDone }) => <SnackPairs onDone={onDone} /> },
  { id: "5.1-wrap", part: 4, title: "A checklist for any meal", Body: ({ onDone }) => <Wrap onDone={onDone} /> },
];

const POS_KEY = "nm-learn-pos";

export default function LearnPage() {
  const router = useRouter();
  const session = useFlowGuard("learn");
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [finishing, setFinishing] = useState(false);
  const enteredAt = useRef(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(POS_KEY));
      if (saved > 0 && saved < SCREENS.length) setIndex(saved);
    } catch {}
  }, []);

  const screen = SCREENS[index];

  useEffect(() => {
    if (!session) return;
    enteredAt.current = performance.now();
    track({ phase: "learn", screen: screen.id, event_type: "page_view", meta: { part: screen.part + 1, condition: session.condition } });
    try {
      localStorage.setItem(POS_KEY, String(index));
    } catch {}
  }, [session, screen, index]);

  const markDone = useCallback(() => {
    setDone((d) => (d[screen.id] ? d : { ...d, [screen.id]: true }));
  }, [screen.id]);

  if (!session) return <FlowHeader phase="learn" />;

  function leave() {
    track({ phase: "learn", screen: screen.id, event_type: "page_leave", duration_ms: performance.now() - enteredAt.current });
  }

  async function next() {
    leave();
    if (index + 1 < SCREENS.length) {
      if (SCREENS[index + 1].part !== screen.part) {
        track({ phase: "learn", screen: screen.id, event_type: "section_complete", meta: { part: screen.part + 1 } });
      }
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFinishing(true);
    try {
      localStorage.removeItem(POS_KEY);
    } catch {}
    await completePhase(session!, "learn", "post");
    router.push("/post");
  }

  function back() {
    leave();
    setIndex(Math.max(0, index - 1));
    window.scrollTo({ top: 0 });
  }

  const partScreens = SCREENS.filter((s) => s.part === screen.part);
  const posInPart = partScreens.indexOf(screen);
  const newPart = posInPart === 0;

  return (
    <>
      <FlowHeader phase="learn" right={`Part ${Math.min(screen.part + 1, 4)} of 4`} />

      {/* Chapter pill, after realfood.gov's section indicator */}
      <div className="sticky top-14 z-20 flex justify-center pt-3">
        <div className="flex items-center gap-3 rounded-full bg-ink/90 py-1.5 pl-4 pr-3 text-[13px] text-white shadow-lg backdrop-blur">
          <span className="font-semibold">{PARTS[screen.part]}</span>
          <span className="flex gap-1.5" aria-label={`Screen ${posInPart + 1} of ${partScreens.length}`}>
            {partScreens.map((s, i) => (
              <span key={s.id} className={`h-1.5 rounded-full transition-all ${i === posInPart ? "w-5 bg-[#cfe8c4]" : i < posInPart ? "w-1.5 bg-white/80" : "w-1.5 bg-white/30"}`} />
            ))}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">
          <motion.section
            key={screen.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            aria-labelledby="screen-title"
            className="bg-porcelain"
          >
            {newPart && screen.part < 4 && (
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0em" }}
                transition={{ duration: 0.8 }}
                className="font-display text-[15px] font-semibold text-leaf"
              >
                Part {screen.part + 1}
              </motion.p>
            )}
            <h1 id="screen-title" className="font-display mt-1 max-w-[20ch] text-[clamp(32px,5vw,58px)] font-bold leading-[0.95]">
              {screen.title}
            </h1>
            <div className="mt-8">
              <screen.Body condition={session.condition} onDone={markDone} />
            </div>
          </motion.section>

        <div className="mt-14 flex items-center justify-between border-t border-line pt-6">
          {index > 0 ? (
            <Button variant="quiet" onClick={back}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {!done[screen.id] && <span className="hidden text-[14px] text-muted sm:inline">Finish the activity to continue</span>}
            <Button onClick={next} disabled={!done[screen.id] || finishing}>
              {index + 1 < SCREENS.length ? "Continue" : finishing ? "Saving…" : "Go to the post-check"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
