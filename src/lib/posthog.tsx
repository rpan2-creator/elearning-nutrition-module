"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { getSession } from "./session";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let started = false;

export function posthogEnabled() {
  return Boolean(KEY) && started;
}

/** Starts PostHog (with session recording) when a project key is configured. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!KEY || started) return;
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: false,
      person_profiles: "identified_only",
      session_recording: { maskAllInputs: false },
    });
    started = true;
    const s = getSession();
    if (s) posthog.identify(s.id, { condition: s.condition, order: s.order });
  }, []);

  useEffect(() => {
    if (started) posthog.capture("$pageview", { path: pathname });
  }, [pathname]);

  return null;
}

export function identifyParticipant(id: string, props: Record<string, unknown>) {
  if (started) posthog.identify(id, props);
}

export function phCapture(name: string, props: Record<string, unknown>) {
  if (started) posthog.capture(name, props);
}
