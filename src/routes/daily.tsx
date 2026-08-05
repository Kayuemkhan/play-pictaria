import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveDailySubscriber } from "@/lib/daily.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import palmLogoOnly from "@/assets/logo-palms-only.png";
import hibiscus from "@/assets/flower-hibiscus-cutout.png";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Pictaria Daily — A Free Puzzle of Paradise Every Day" },
      {
        name: "description",
        content:
          "Sign up for a free puzzle of Paradise delivered every single day.",
      },
      {
        property: "og:title",
        content: "Pictaria Daily — A Free Puzzle of Paradise Every Day",
      },
      {
        property: "og:description",
        content:
          "Sign up for a free puzzle of Paradise delivered every single day.",
      },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const saveSubscriber = useServerFn(saveDailySubscriber);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setSessionEmail(data.session.user.email);
        setSignedUp(true);
        return;
      }
      if (localStorage.getItem("pictaria_daily_signed_up") === "1") {
        setSignedUp(true);
      }
    };
    check();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      await saveSubscriber({ data: { email } });
      localStorage.setItem("pictaria_daily_signed_up", "1");
      setSignedUp(true);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  };

  if (signedUp || status === "done") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-deep px-6 py-12 text-center">
        <div
          role="img"
          aria-label="Pictaria"
          className="h-44 w-44 sm:h-56 sm:w-56"
          style={{
            maskImage: `url(${palmLogoOnly})`,
            WebkitMaskImage: `url(${palmLogoOnly})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            backgroundImage:
              "linear-gradient(158deg, oklch(0.95 0.07 92) 0%, oklch(0.86 0.12 85) 32%, oklch(0.72 0.13 74) 62%, oklch(0.55 0.11 62) 100%)",
            filter: "drop-shadow(0 6px 20px oklch(0.15 0.04 230 / 0.6))",
          }}
        />
        <p className="mt-6 max-w-sm font-display text-[1.6rem] leading-snug text-accent">
          Welcome to Pictaria
        </p>
        <p className="mt-3 max-w-sm font-display text-[1.15rem] leading-snug text-accent">
          {sessionEmail
            ? `You're on the list at ${sessionEmail} for a free puzzle every single day.`
            : "You're on the list for a free puzzle every single day."}
        </p>
        <Link
          to="/"
          className="mt-9 font-display text-[0.95rem] tracking-[0.2em] text-accent uppercase transition-opacity hover:opacity-75"
        >
          Back home <span aria-hidden>›</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-deep px-6 py-12">
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-accent/60 bg-shell p-6 text-center shadow-soft">
        <img
          src={hibiscus}
          alt=""
          width={200}
          height={200}
          className="pointer-events-none absolute -right-4 -top-4 h-20 w-auto opacity-90"
        />
        <img
          src={palmLogoOnly}
          alt="Pictaria"
          width={1024}
          height={1024}
          className="mx-auto h-16 w-auto rounded-[6px] drop-shadow-[0_2px_8px_oklch(0.15_0.04_230/0.5)]"
        />
        <h1 className="mt-3 font-display text-[1.35rem] text-foreground">
          Pictaria Daily
        </h1>
        <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          A free puzzle of Paradise, every single day
        </p>

        <form onSubmit={submit} className="mt-6 text-left">
          <Label
            htmlFor="email"
            className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-1.5"
          />
          {status === "error" && (
            <p className="mt-2 text-[11px] text-destructive">{errorMsg}</p>
          )}
          <Button
            type="submit"
            disabled={status === "submitting"}
            className="mt-4 w-full rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {status === "submitting" ? "Saving..." : "Start here"}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <span aria-hidden>‹</span>
          Back home
        </Link>
      </div>
      <BottomBackButton />
    </main>
  );
}
