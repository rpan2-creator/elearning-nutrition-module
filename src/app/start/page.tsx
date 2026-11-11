"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowHeader, Button } from "@/components/Shell";
import { getSession, newSession, PHASE_PATH, saveSession } from "@/lib/session";
import { identifyParticipant } from "@/lib/posthog";
import { track } from "@/lib/track";

const BACKGROUNDS = [
  { id: "none", label: "Not much — I haven't really studied nutrition" },
  { id: "informal", label: "Some, from social media, fitness, or my own reading" },
  { id: "course", label: "I've taken a nutrition or health course" },
  { id: "professional", label: "I work or train in nutrition or health" },
];

export default function StartPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [background, setBackground] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resume, setResume] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (s && s.phase !== "start") setResume(PHASE_PATH[s.phase]);
  }, []);

  async function begin() {
    setBusy(true);
    const s = newSession();
    s.phase = "pre";
    saveSession(s);
    identifyParticipant(s.id, { condition: s.condition, order: s.order, background });
    try {
      await fetch("/api/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, condition: s.condition, order: s.order, background, consent }),
      });
    } catch {
      /* the module still works offline; events will retry */
    }
    track({ phase: "start", screen: "start", event_type: "phase_complete", response: { background } });
    router.push("/pre");
  }

  return (
    <>
      <FlowHeader phase="start" />
      <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
        <h1 className="font-display text-[clamp(34px,5vw,56px)] font-bold leading-[0.95]">
          Before you start
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          You&rsquo;ll take a 10-minute pre-check, spend about 30 minutes learning, and finish with a
          10-minute post-check. Please do it in one sitting, without looking things up.
        </p>

        {resume && (
          <div className="mt-8 rounded-2xl border border-line bg-tray p-5">
            <p className="text-[15px]">You already started on this device.</p>
            <div className="mt-3">
              <Button variant="quiet" onClick={() => router.push(resume)}>
                Continue where I left off
              </Button>
            </div>
          </div>
        )}

        <fieldset className="mt-10">
          <legend className="text-[18px] font-semibold">How much do you know about nutrition?</legend>
          <div className="mt-4 grid gap-2">
            {BACKGROUNDS.map((b) => (
              <label
                key={b.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-tray px-4 py-3.5 text-[15px] transition-colors ${
                  background === b.id ? "border-ink" : "border-line hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  name="background"
                  value={b.id}
                  checked={background === b.id}
                  onChange={() => setBackground(b.id)}
                  className="h-4 w-4 accent-[var(--red)]"
                />
                {b.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-tray p-4 text-[15px] leading-relaxed">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--red)]"
          />
          <span>
            I agree that my answers, clicks, and time on each screen are recorded anonymously for a
            class research project. I understand this is general education, not personal nutrition
            advice.
          </span>
        </label>

        <div className="mt-8">
          <Button onClick={begin} disabled={!consent || !background || busy}>
            {busy ? "Starting…" : "Start the pre-check"}
          </Button>
        </div>
      </main>
    </>
  );
}
