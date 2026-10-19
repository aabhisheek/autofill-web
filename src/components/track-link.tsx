"use client";

import * as React from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

// A Link that fires a Mixpanel event on click — used inside <Button asChild>
// on the server-rendered landing page, where inline handlers aren't available.
export const TrackLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & {
    trackEvent: string;
    trackProperties?: Record<string, unknown>;
  }
>(function TrackLink({ trackEvent, trackProperties, onClick, ...props }, ref) {
  return (
    <Link
      ref={ref}
      {...props}
      onClick={(e) => {
        track(trackEvent, trackProperties);
        onClick?.(e);
      }}
    />
  );
});
