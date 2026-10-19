"use client";

import mixpanel from "mixpanel-browser";
import { env } from "@/env";

// Thin wrapper around mixpanel-browser. Every function is a no-op until
// initAnalytics() succeeds, so components can call track/identify freely
// without null checks — and without analytics when no token is configured.

let ready = false;

export function initAnalytics() {
  if (ready || typeof window === "undefined") return;
  const token = env.mixpanelToken;
  if (!token) return;
  mixpanel.init(token, {
    track_pageview: false, // AnalyticsProvider fires $pageview on route changes
    batch_requests: false, // send every event immediately, don't lose them on unload
    persistence: "localStorage",
    ip: true
  });
  ready = true;
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!ready) return;
  mixpanel.track(event, properties);
}

export function identify(id: string, properties?: Record<string, unknown>) {
  if (!ready) return;
  mixpanel.identify(id);
  if (properties) mixpanel.people.set(properties);
}

export function resetAnalytics() {
  if (!ready) return;
  mixpanel.reset();
}
