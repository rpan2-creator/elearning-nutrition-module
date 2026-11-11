"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowHeader, Button, useFlowGuard } from "@/components/Shell";
import { Options } from "@/components/items/Options";
import { formFor, isCorrect, TestItem } from "@/content/tests";
import { completePhase } from "@/lib/flow";
import { track } from "@/lib/track";

export interface StoredAnswer {
  id: string;
  answer: unknown;
  correct: boolean | null;
}

export function answersKey(which: "pre" | "post") {
  return `nm-answers-${which}`;
}

/** One question per screen, no feedback. Logs answer, changes, and time per item. */
export default function TestRunner({ which }: { which: "pre" | "post" }) {
  const router = useRouter();
  const session = useFlowGuard(which);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState<string | string[] | null>(null);
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const shownAt = useRef(0);
  const changes = useRef(0);

  const order = session?.order;
  const form = useMemo(() => (order ? formFor(order, which) : null), [order, which]);
  const item: TestItem | undefined = form?.form[index];

  useEffect(() => {
    if (!item || !form) return;
    shownAt.current = performance.now();
    changes.current = 0;
    setValue(item.type === "multi" ? [] : item.type === "text" ? "" : null);
    track({ phase: which, screen: `${which}-${item.id}`, event_type: "page_view", item_id: item.id, kc: item.kc, meta: { form: form.name, position: index + 1 } });
  }, [item, form, index, which]);

  if (!session || !form || !item) {
    return <FlowHeader phase={which} />;
  }

  const total = form.form.length;
  const ready =
    item.type === "text" ? typeof value === "string" && value.trim().length > 3 :
    item.type === "multi" ? Array.isArray(value) && value.length > 0 : value !== null;

  async function next() {
    if (!item || !form || !session) return;
    const correct = isCorrect(item, value);
    track({
      phase: which,
      screen: `${which}-${item.id}`,
      event_type: "answer",
      item_id: item.id,
      kc: item.kc,
      response: value,
      correct,
      attempt: changes.current,
      duration_ms: performance.now() - shownAt.current,
      meta: { form: form.name, position: index + 1 },
    });
    const all = [...answers, { id: item.id, answer: value, correct }];
    setAnswers(all);
    if (index + 1 < total) {
      setIndex(index + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    const scored = all.filter((a) => a.correct !== null);
    const score = { correct: scored.filter((a) => a.correct).length, total: scored.length };
    try {
      localStorage.setItem(answersKey(which), JSON.stringify({ form: form.name, answers: all }));
    } catch {}
    await completePhase(
      session,
      which,
      which === "pre" ? "learn" : "done",
      which === "pre" ? { preScore: score } : { postScore: score },
      which === "pre" ? { pre_correct: score.correct, pre_total: score.total } : { post_correct: score.correct, post_total: score.total },
    );
    router.push(which === "pre" ? "/learn" : "/done");
  }

  return (
    <>
      <FlowHeader phase={which} right={`${index + 1} of ${total}`} />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
        <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-leaf transition-[width] duration-300" style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <p className="mt-6 text-[14px] text-muted">
          {which === "pre" ? "Pre-check" : "Post-check"} · answer as best you can; there&rsquo;s no feedback until the end.
        </p>
        <h1 className="mt-3 text-[clamp(22px,3vw,28px)] font-semibold leading-snug">{item.prompt}</h1>
        {item.image && (
          <img src={item.image} alt="" className="food mt-6 h-40 w-auto sm:h-48" draggable={false} />
        )}
        <div className="mt-8">
          {item.type === "text" ? (
            <textarea
              value={typeof value === "string" ? value : ""}
              onChange={(e) => {
                changes.current++;
                setValue(e.target.value);
              }}
              placeholder={item.placeholder}
              rows={4}
              className="w-full rounded-2xl border border-line bg-tray p-4 text-[16px] leading-relaxed focus:border-ink focus:outline-none"
            />
          ) : (
            <Options
              name={item.id}
              options={item.options}
              multiple={item.type === "multi"}
              value={value}
              onChange={(v) => {
                changes.current++;
                setValue(v);
              }}
            />
          )}
        </div>
        <div className="mt-10 flex justify-end">
          <Button onClick={next} disabled={!ready}>
            {index + 1 < total ? "Next question" : which === "pre" ? "Finish and start learning" : "Finish and see results"}
          </Button>
        </div>
      </main>
    </>
  );
}
