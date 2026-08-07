import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { unlockPortal } from "@/lib/portal.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import palmLogo from "@/assets/logo-palms-only.png";

/** Passcode gate for the internal portal. */
export function PortalLock({ onUnlocked }: { onUnlocked: () => void }) {
  const unlock = useServerFn(unlockPortal);
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("checking");
    try {
      const { ok } = await unlock({ data: { passcode } });
      if (!ok) {
        setStatus("error");
        return;
      }
      setStatus("idle");
      onUnlocked();
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-deep px-6 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-accent/60 bg-shell p-6 text-center shadow-soft"
      >
        <img
          src={palmLogo}
          alt=""
          width={1024}
          height={1024}
          className="mx-auto h-12 w-auto"
        />
        <h1 className="mt-3 font-display text-[1.3rem] text-foreground">
          Project Pictaria's
        </h1>
        <p className="mt-1 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          a community project for Maui support
        </p>

        <div className="mt-6 text-left">
          <Label
            htmlFor="portal-passcode"
            className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase"
          >
            Passcode
          </Label>
          <Input
            id="portal-passcode"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        {status === "error" && (
          <p className="mt-2 text-[11px] text-destructive">
            That passcode didn&apos;t match.
          </p>
        )}

        <Button
          type="submit"
          disabled={status === "checking"}
          className="mt-5 w-full rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift disabled:opacity-60"
        >
          {status === "checking" ? "Checking…" : "Enter portal"}
        </Button>
      </form>
    </main>
  );
}
