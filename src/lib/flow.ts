"use client";

import { Phase, Session, updateSession } from "./session";
import { flushNow, track } from "./track";

export async function patchParticipant(id: string, patch: Record<string, unknown>) {
  try {
    await fetch("/api/participant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
  } catch {
    /* recorded locally; the dashboard will show it as incomplete */
  }
}

/** Marks the current phase complete and moves the learner to the next one. */
export async function completePhase(
  s: Session,
  from: Phase,
  to: Phase,
  extra: Partial<Session> = {},
  dbPatch: Record<string, unknown> = {},
) {
  track({ phase: from, screen: from, event_type: "phase_complete", meta: dbPatch });
  flushNow();
  updateSession({ phase: to, ...extra });
  await patchParticipant(s.id, { [`${from}_completed_at`]: new Date().toISOString(), ...dbPatch });
}
