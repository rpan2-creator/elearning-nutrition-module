"use client";

export type Condition = "predict" | "told";
export type Phase = "start" | "pre" | "learn" | "post" | "done";

export interface Session {
  id: string;
  condition: Condition;
  /** Which test form is the pre-test; the other is the post-test. */
  order: "AB" | "BA";
  phase: Phase;
  preScore?: { correct: number; total: number };
  postScore?: { correct: number; total: number };
  createdAt: number;
}

const KEY = "nm-session-v1";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: the session lives only in memory for this page */
  }
}

export function updateSession(patch: Partial<Session>): Session | null {
  const s = getSession();
  if (!s) return null;
  const next = { ...s, ...patch };
  saveSession(next);
  return next;
}

export function clearSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

export function newSession(): Session {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    condition: Math.random() < 0.5 ? "predict" : "told",
    order: Math.random() < 0.5 ? "AB" : "BA",
    phase: "start",
    createdAt: Date.now(),
  };
}

export const PHASE_PATH: Record<Phase, string> = {
  start: "/start",
  pre: "/pre",
  learn: "/learn",
  post: "/post",
  done: "/done",
};

const PREVIEW_KEY = "nm-preview";

/**
 * Preview mode is for the design team: every part and lesson is open, and
 * every event is flagged so it can be filtered out of the study data.
 * Turn it on with ?preview=1 on any page, off with ?preview=0.
 */
export function isPreview(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const q = new URLSearchParams(window.location.search).get("preview");
    if (q === "1") localStorage.setItem(PREVIEW_KEY, "1");
    if (q === "0") localStorage.removeItem(PREVIEW_KEY);
    return localStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

