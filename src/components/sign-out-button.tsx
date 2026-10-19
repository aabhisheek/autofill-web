"use client";

import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <Button variant="ghost" size="sm" type="submit" onClick={() => track("Logged Out")}>
        Sign out
      </Button>
    </form>
  );
}
