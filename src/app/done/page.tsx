"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlowHeader, Button, useFlowGuard } from "@/components/Shell";
import { answersKey, StoredAnswer } from "@/components/TestRunner";
import { FORM_A, FORM_B, TestItem } from "@/content/tests";
import { KCS } from "@/content/kcs";
import { clearSession } from "@/lib/session";

function load(which: "pre" | "post"): { form: string; answers: StoredAnswer[] } | null {
  try {
    const raw = localStorage.getItem(answersKey(which));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DonePage() {
  const session = useFlowGuard("done");
  const [post, setPost] = useState<{ form: string; answers: StoredAnswer[] } | null>(null);
  useEffect(() => setPost(load("post")), []);

  if (!session) return <FlowHeader phase="done" />;
  const pre = session.preScore;
  const postS = session.postScore;
  const form: TestItem[] = post?.form === "A" ? FORM_A : FORM_B;

  return (
    <>
      <FlowHeader phase="done" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-[clamp(36px,6vw,64px)] font-bold leading-[0.95]">Thanks — you&rsquo;re done.</h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">
          Here&rsquo;s how your two checks compare. The written explanation isn&rsquo;t scored automatically.
        </p>

        <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
          {[
            ["Pre-check", pre],
            ["Post-check", postS],
          ].map(([label, s], i) => {
            const sc = s as typeof pre;
            const pct = sc && sc.total ? sc.correct / sc.total : 0;
            return (
              <div key={label as string} className="rounded-3xl bg-tray p-5">
                <p className="text-[14px] text-muted">{label as string}</p>
                <p className="font-display mt-1 text-[44px] font-bold leading-none">
                  {sc ? `${sc.correct}/${sc.total}` : "—"}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
                  <motion.div className="h-full rounded-full" style={{ background: i ? "var(--red)" : "var(--muted)" }} initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ delay: 0.3 + i * 0.3, duration: 0.8 }} />
                </div>
              </div>
            );
          })}
        </div>

        {post && (
          <section className="mt-14">
            <h2 className="font-display text-[28px] font-bold">Post-check answers</h2>
            <ol className="mt-6 grid gap-3">
              {form.map((item) => {
                const a = post.answers.find((x) => x.id === item.id);
                const tone = a?.correct === true ? "var(--ok)" : a?.correct === false && !a?.skipped ? "var(--wrong)" : "var(--line)";
                return (
                  <li key={item.id} className="rounded-2xl bg-tray p-5" style={{ boxShadow: `inset 4px 0 0 ${tone}` }}>
                    <p className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
                      <span>{KCS[item.kc]}</span>
                      <span className={`font-semibold ${a?.correct === true ? "text-ink" : a?.correct === false && !a?.skipped ? "text-red" : "text-muted"}`}>
                        {a?.skipped ? "Skipped" : a?.correct === true ? "✓ Correct" : a?.correct === false ? "Not correct" : item.type === "text" ? "Not scored" : "—"}
                      </span>
                    </p>
                    <p className="mt-1 text-[16px] font-semibold leading-snug">{item.prompt}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.explanation}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-6">
          <Button
            variant="quiet"
            onClick={() => {
              clearSession();
              ["pre", "post"].forEach((w) => localStorage.removeItem(`nm-answers-${w}`));
              window.location.href = "/";
            }}
          >
            Start over on this device
          </Button>
        </div>
      </main>
    </>
  );
}
