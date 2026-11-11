"use client";

import { getSession } from "./session";
import { phCapture } from "./posthog";

export type EventType =
  | "page_view"
  | "page_leave"
  | "click"
  | "answer"
  | "skip"
  | "reveal"
  | "feedback_view"
  | "drag"
  | "slider"
  | "section_complete"
  | "phase_complete";

export interface TrackEvent {
  phase: string;
  screen: string;
  event_type: EventType;
  item_id?: string;
  kc?: string;
  response?: unknown;
  correct?: boolean | null;
  attempt?: number;
  duration_ms?: number;
  meta?: Record<string, unknown>;
}

interface Queued extends TrackEvent {
  participant_id: string;
  condition: string;
  client_ts: string;
}

let queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function flush(useBeacon = false) {
  if (!queue.length) return;
  const batch = queue;
  queue = [];
  const body = JSON.stringify({ events: batch });
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/log", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Put the batch back so the next flush retries it.
    queue = batch.concat(queue);
  });
}

function ensureListeners() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
}

/** Records one learner interaction to Supabase (via /api/log) and PostHog. */
export function track(e: TrackEvent) {
  const s = getSession();
  if (!s) return;
  ensureListeners();
  queue.push({
    ...e,
    participant_id: s.id,
    condition: s.condition,
    client_ts: new Date().toISOString(),
  });
  phCapture(e.event_type, { ...e, condition: s.condition });
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => flush(), 1500);
}

export function flushNow() {
  flush();
}
