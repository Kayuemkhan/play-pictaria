import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveDailySubscriber } from "@/lib/daily.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import mindfulnessHero from "@/assets/mindfulness-hero.jpg";
import palmLogoOnly from "@/assets/logo-palms-only.png";

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
  const navigate = useNavigate();

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

  useEffect(() => {
    if (status !== "done") return undefined;
    const timer = setTimeout(() => {
      navigate({ to: "/puzzle/$puzzleId", params: { puzzleId: "turtle-09" } });
    }, 1500);
    return () => clearTimeout(timer);
  }, [status, navigate]);


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

  return (
    <main className="min-h-screen bg-deep">
      <div className="relative h-[46vh] min-h-[300px] w-full sm:h-[50vh]">
        <img
          src={mindfulnessHero}
          alt="A calm Hawaiian tide pool with a floating plumeria flower at sunset"
          className="absolute inset-0 h-full w-full object-cover grayscale"
          width={1344}
          height={896}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/40 via-deep/20 to-deep" />
      </div>

      <div className="relative z-10 -mt-24 px-5 pb-12 sm:-mt-28 sm:px-8">
        <div className="mx-auto max-w-sm">
          <div className="relative overflow-hidden rounded-lg border border-accent/60 bg-shell p-6 text-center shadow-soft">
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

            {(signedUp || status === "done") ? (
              <div className="mt-6 text-center">
                <p className="font-display text-[1.15rem] leading-snug text-foreground">
                  Welcome to Pictaria
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {sessionEmail
                    ? `You're on the list at ${sessionEmail}. Taking you to today's Pictaria...`
                    : "You're on the list. Taking you to today's Pictaria..."}
                </p>
                {!sessionEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("pictaria_daily_signed_up");
                      setSignedUp(false);
                      setStatus("idle");
                    }}
                    className="mt-3 text-[10px] tracking-[0.14em] text-muted-foreground uppercase underline transition-colors hover:text-foreground"
                  >
                    Use a different email
                  </button>
                )}
              </div>

            ) : (
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
                  {status === "submitting" ? "Saving..." : "Play today's Pictaria"}
                </Button>
              </form>
            )}

            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              <span aria-hidden>‹</span>
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
