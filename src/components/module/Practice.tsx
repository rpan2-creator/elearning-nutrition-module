"use client";

import { useRef, useState } from "react";
import { Options } from "@/components/items/Options";
import type { Option } from "@/content/tests";
import type { KC } from "@/content/kcs";
import { track } from "@/lib/track";

export interface PracticeItem {
  id: string;
  kc: KC;
  prompt: string;
  options: Option[];
  correct: string | string[];
  /** Why the answer works — shown after checking, right or wrong. */
  explain: string;
  image?: string;
}

/**
 * A practice question with explanatory feedback. The learner may retry once
 * after a wrong answer; every check is logged with its time and attempt number.
 */
export function Practice({ item, onDone }: { item: PracticeItem; onDone: () => void }) {
  const multiple = Array.isArray(item.correct);
  const [value, setValue] = useState<string | string[] | null>(multiple ? [] : null);
  const [revealed, setRevealed] = useState(false);
  const [wasRight, setWasRight] = useState<boolean | null>(null);
  const attempts = useRef(0);
  const shownAt = useRef(performance.now());

  function check() {
    attempts.current++;
    const right = Array.isArray(item.correct)
      ? Array.isArray(value) && value.length === item.correct.length && item.correct.every((c) => value.includes(c))
      : value === item.correct;
    track({
      phase: "learn",
      screen: item.id,
      event_type: "answer",
      item_id: item.id,
      kc: item.kc,
      response: value,
      correct: right,
      attempt: attempts.current,
      duration_ms: performance.now() - shownAt.current,
    });
    setWasRight(right);
    setRevealed(true);
    if (right || attempts.current >= 2) onDone();
  }

  function retry() {
    setRevealed(false);
    setWasRight(null);
    setValue(multiple ? [] : null);
    shownAt.current = performance.now();
    track({ phase: "learn", screen: item.id, event_type: "click", item_id: item.id, meta: { action: "retry" } });
  }

  const ready = multiple ? Array.isArray(value) && value.length > 0 : value !== null;

  return (
    <div>
      <p className="text-[19px] font-semibold leading-snug">{item.prompt}</p>
      {item.image && <img src={item.image} alt="" className="illus mt-4 h-32 w-32" />}
      <div className="mt-5">
        <Options
          name={item.id}
          options={item.options}
          multiple={multiple}
          value={value}
          onChange={setValue}
          revealed={revealed}
          correct={revealed && (wasRight || attempts.current >= 2) ? item.correct : undefined}
        />
      </div>
      {!revealed && (
        <button
          onClick={check}
          disabled={!ready}
          className="mt-5 rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
        >
          Check answer
        </button>
      )}
      {revealed && (
        <div
          role="status"
          className={`mt-5 rounded-2xl p-4 text-[15px] leading-relaxed ${wasRight ? "bg-cream-2" : "bg-[color-mix(in_srgb,var(--wrong)_8%,white)]"}`}
        >
          <p className="font-semibold">{wasRight ? "That's right." : attempts.current >= 2 ? "Here's the answer." : "Not quite — try once more."}</p>
          {(wasRight || attempts.current >= 2) && <p className="mt-1">{item.explain}</p>}
          {!wasRight && attempts.current < 2 && (
            <button onClick={retry} className="mt-3 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-white">
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** One-sentence causal explanation. Not scored automatically; saved for coding. */
export function Explain({
  id,
  kc,
  prompt,
  placeholder,
  example,
  onDone,
}: {
  id: string;
  kc: KC;
  prompt: string;
  placeholder: string;
  example: string;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const shownAt = useRef(performance.now());
  return (
    <div>
      <p className="text-[19px] font-semibold leading-snug">{prompt}</p>
      <p className="mt-1 text-[14px] text-muted">Use the chain: food or amount → its nutritional role → why that helps here.</p>
      <textarea
        value={text}
        disabled={sent}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-4 w-full rounded-2xl border border-line bg-tray p-4 text-[16px] leading-relaxed focus:border-ink focus:outline-none disabled:opacity-80"
      />
      {!sent ? (
        <button
          disabled={text.trim().length < 8}
          onClick={() => {
            setSent(true);
            track({
              phase: "learn",
              screen: id,
              event_type: "answer",
              item_id: id,
              kc,
              response: text,
              correct: null,
              duration_ms: performance.now() - shownAt.current,
            });
            onDone();
          }}
          className="mt-3 rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
        >
          Compare with an example
        </button>
      ) : (
        <div className="mt-4 rounded-2xl bg-cream-2 p-4 text-[15px] leading-relaxed">
          <p className="font-semibold">One strong answer</p>
          <p className="mt-1">{example}</p>
          <p className="mt-2 text-muted">Does yours name the food, its role, and why it helps? If it only says &ldquo;it&rsquo;s healthy,&rdquo; add the role.</p>
        </div>
      )}
    </div>
  );
}
