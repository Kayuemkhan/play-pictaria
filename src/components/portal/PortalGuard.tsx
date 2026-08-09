import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { getPortalStatus } from "@/lib/portal.functions";
import { PortalLock } from "@/components/portal/PortalLock";

/** Wraps every Pictaria Project admin page in the founder passcode gate. */
export function PortalGuard({ children }: { children: React.ReactNode }) {
  const status = useServerFn(getPortalStatus);
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");

  const check = useCallback(() => {
    void status({})
      .then((result) => setState(result.unlocked ? "open" : "locked"))
      .catch(() => setState("locked"));
  }, [status]);

  useEffect(() => {
    check();
  }, [check]);

  if (state === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-deep">
        <p className="text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          opening…
        </p>
      </main>
    );
  }

  if (state === "locked") return <PortalLock onUnlocked={check} />;

  return <>{children}</>;
}
