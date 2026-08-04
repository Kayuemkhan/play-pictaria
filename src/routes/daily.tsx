import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveDailySubscriber } from "@/lib/daily.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import palmLogo from "@/assets/logo-palms.png";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Pictaria Daily — A Free Puzzle Every Day" },
      {
        name: "description",
        content:
          "Sign up for a free Pictaria puzzle delivered every single day.",
      },
      {
        property: "og:title",
        content: "Pictaria Daily — A Free Puzzle Every Day",
      },
      {
        property: "og:description",
        content:
          "Sign up for a free Pictaria puzzle delivered every single day.",
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
        <img
          src={palmLogo}
          alt="Pictaria"
          width={1024}
          height={1024}
          className="h-16 w-auto [filter:brightness(1.35)_saturate(1.2)]"
        />
        <h1 className="mt-5 max-w-xs font-display text-[1.75rem] leading-tight text-shell">
          Welcome to the magical land of Pictaria
        </h1>
        <p className="mt-3 text-sm text-accent">
          {sessionEmail
            ? `You're all set at ${sessionEmail}.`
            : "You're on the list for a free puzzle every single day."}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
        >
          Back home
          <span aria-hidden>›</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-deep px-6 py-12">
      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-accent/60 bg-shell p-6 text-center shadow-soft">
        <img
          src={palmLogo}
          alt="Pictaria"
          width={1024}
          height={1024}
          className="mx-auto h-12 w-auto [filter:brightness(1.2)_saturate(1.15)]"
        />
        <h1 className="mt-3 font-display text-[1.35rem] text-foreground">
          Pictaria Daily
        </h1>
        <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          A free puzzle, every single day
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
    </main>
  );
}
