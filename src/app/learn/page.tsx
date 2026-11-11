"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FlowHeader, Button, useFlowGuard } from "@/components/Shell";
import { completePhase } from "@/lib/flow";
import { track } from "@/lib/track";
import { isPreview } from "@/lib/session";
import { CHAPTERS, LESSONS } from "@/components/module/lessons";
import { LearnSlides } from "@/components/module/kit";

const POS_KEY = "nm-learn-pos";
const PROGRESS_KEY = "nm-learn-progress";

function loadProgress(): { learned: Record<string, boolean>; tried: Record<string, boolean> } {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { learned: {}, tried: {} };
}
type Step = "learn" | "try";

export default function LearnPage() {
  const router = useRouter();
  const session = useFlowGuard("learn");
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>("learn");
  const [learned, setLearned] = useState<Record<string, boolean>>({});
  const [tried, setTried] = useState<Record<string, boolean>>({});
  const [finishing, setFinishing] = useState(false);
  const [preview, setPreview] = useState(false);
  const enteredAt = useRef(0);
  const tryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreview(isPreview());
    const p = loadProgress();
    setLearned(p.learned);
    setTried(p.tried);
    try {
      const saved = Number(localStorage.getItem(POS_KEY));
      if (saved > 0 && saved < LESSONS.length) setIndex(saved);
    } catch {}
  }, []);

  // keep the current lesson visible in the (horizontally scrolling) lesson index
  useEffect(() => {
    const el = document.querySelector('nav[aria-label="Lessons"] [aria-current="page"]');
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [index, session]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ learned, tried }));
    } catch {}
  }, [learned, tried]);

  const lesson = LESSONS[index];

  useEffect(() => {
    if (!session) return;
    enteredAt.current = performance.now();
    setStep("learn");
    track({ phase: "learn", screen: lesson.id, event_type: "page_view", meta: { chapter: lesson.chapter + 1, condition: session.condition } });
    try {
      localStorage.setItem(POS_KEY, String(index));
    } catch {}
  }, [session, lesson, index]);

  const markLearned = useCallback(() => setLearned((d) => (d[lesson.id] ? d : { ...d, [lesson.id]: true })), [lesson.id]);
  const markTried = useCallback(() => setTried((d) => (d[lesson.id] ? d : { ...d, [lesson.id]: true })), [lesson.id]);

  if (!session) return <FlowHeader phase="learn" />;

  function startTry() {
    track({ phase: "learn", screen: lesson.id, event_type: "click", meta: { action: "start_try", learn_ms: Math.round(performance.now() - enteredAt.current) } });
    setStep("try");
    setTimeout(() => tryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  function leave() {
    track({ phase: "learn", screen: lesson.id, event_type: "page_leave", duration_ms: performance.now() - enteredAt.current });
  }

  async function next() {
    leave();
    if (index + 1 < LESSONS.length) {
      if (LESSONS[index + 1].chapter !== lesson.chapter) track({ phase: "learn", screen: lesson.id, event_type: "section_complete", meta: { chapter: lesson.chapter + 1 } });
      setIndex(index + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    setFinishing(true);
    try {
      localStorage.removeItem(POS_KEY);
      localStorage.removeItem(PROGRESS_KEY);
    } catch {}
    await completePhase(session!, "learn", "post");
    router.push("/post");
  }

  function back() {
    leave();
    setIndex(Math.max(0, index - 1));
    window.scrollTo({ top: 0 });
  }

  function jump(i: number) {
    if (i === index) return;
    leave();
    track({ phase: "learn", screen: lesson.id, event_type: "click", meta: { action: "jump_lesson", to: LESSONS[i].id } });
    setIndex(i);
    window.scrollTo({ top: 0 });
  }

  // A lesson opens once the one before it has its activity done (preview: all open).
  const unlocked = (i: number) => preview || i === 0 || !!tried[LESSONS[i - 1].id];
  const canTry = preview || !!learned[lesson.id];
  const canNext = preview || !!tried[lesson.id];

  const inChapter = LESSONS.filter((l) => l.chapter === lesson.chapter);
  const pos = inChapter.indexOf(lesson);
  const Try = lesson.Try;

  return (
    <>
      <FlowHeader phase="learn" right={lesson.chapter < 4 ? `Chapter ${lesson.chapter + 1} of 4` : "Wrap-up"} />

      {/* lesson index: finished lessons can be revisited; later ones open in order */}
      <nav aria-label="Lessons" className="sticky top-14 z-20 border-b border-line bg-porcelain/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 py-2.5 [scrollbar-width:none]">
          {CHAPTERS.map((c, ci) => {
            const ls = LESSONS.map((l, li) => ({ l, li })).filter((x) => x.l.chapter === ci);
            if (!ls.length) return null;
            return (
              <div key={c} className="flex shrink-0 items-center gap-1.5">
                <span className={`mr-1 text-[12.5px] font-semibold ${ci === lesson.chapter ? "text-red" : "text-muted"}`}>{c}</span>
                {ls.map(({ l, li }) => (
                  <button
                    key={l.id}
                    onClick={() => jump(li)}
                    disabled={!unlocked(li)}
                    aria-current={li === index ? "page" : undefined}
                    title={unlocked(li) ? l.title : `${l.title} — finish the earlier lessons first`}
                    className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:text-ink/30 ${
                      li === index ? "bg-ink text-porcelain" : tried[l.id] ? "bg-cream-2 text-ink" : "text-ink/70 hover:bg-cream-2"
                    }`}
                  >
                    {tried[l.id] && li !== index ? "✓ " : ""}
                    {l.short}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-6">
        <motion.section key={lesson.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-porcelain" aria-labelledby="lesson-title">
          <p className="text-[14px] font-semibold text-red">
            {lesson.chapter < 4 ? `Chapter ${lesson.chapter + 1} · Lesson ${pos + 1}` : "Wrap-up"} · about {lesson.minutes} min
          </p>
          <h1 id="lesson-title" className="font-display mt-1 max-w-[18ch] text-[clamp(36px,5.4vw,68px)] font-extrabold leading-[0.92] tracking-[-0.02em]">
            {lesson.title}
          </h1>

          {/* Learn → Try stepper */}
          <ol className="mt-6 flex items-center gap-2 text-[14px]" aria-label="Lesson steps">
            {(["learn", "try"] as Step[]).map((s, i) => {
              const active = step === s;
              const complete = s === "learn" ? learned[lesson.id] : tried[lesson.id];
              return (
                <li key={s} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-8 bg-line" />}
                  <button
                    disabled={s === "try" && !canTry}
                    title={s === "try" && !canTry ? "Read the slides first" : undefined}
                    onClick={() => (s === "try" ? startTry() : setStep("learn"))}
                    aria-current={active ? "step" : undefined}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-ink text-porcelain" : complete ? "bg-cream-2 text-ink" : "bg-cream-2 text-ink/70 hover:text-ink"}`}
                  >
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${active ? "bg-white text-ink" : "bg-white/70"}`}>{complete ? "✓" : i + 1}</span>
                    {s === "learn" ? "Learn" : "Try it"}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-6">
            <LearnSlides key={lesson.id} id={lesson.id} slides={lesson.slides} onDone={markLearned} open={preview} />
            {step === "learn" && canTry && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
                <Button onClick={startTry}>Try it yourself</Button>
              </motion.div>
            )}
          </div>

          {step === "try" && (
            <motion.div ref={tryRef} data-part="try" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-14 scroll-mt-28 border-t border-line pt-10">
              <p className="text-[14px] font-semibold text-red">Try it</p>
              <h2 className="font-display mt-1 text-[clamp(28px,3.6vw,44px)] font-bold leading-[1]">{lesson.tryTitle}</h2>
              <div className="mt-8">
                <Try condition={session.condition} onDone={markTried} />
              </div>
            </motion.div>
          )}
        </motion.section>

        <div className="mt-14 flex items-center justify-between border-t border-line pt-6">
          {index > 0 ? (
            <Button variant="quiet" onClick={back}>
              Previous lesson
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {!canNext && (
              <span className="hidden text-[14px] text-muted sm:inline">{learned[lesson.id] ? "Finish the activity to continue" : "Read through the slides first"}</span>
            )}
            <Button onClick={next} disabled={finishing || !canNext}>
              {index + 1 < LESSONS.length ? "Next lesson" : finishing ? "Saving…" : "Go to the post-check"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
