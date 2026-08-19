import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveDailySubscriber } from "@/lib/daily.functions";
import { getDailyPicks } from "@/lib/daily-pick.functions";
import { isPortalPick, portalPickCode } from "@/lib/daily-display";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import dailyDogsWindow from "@/assets/daily-dogs-window.jpg";

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
  // Which puzzle the founder has chosen as today's Pictaria in the portal.
  const [todaysPuzzleId, setTodaysPuzzleId] = useState("turtle-09");
  const saveSubscriber = useServerFn(saveDailySubscriber);
  const loadPicks = useServerFn(getDailyPicks);
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
    const loadToday = async () => {
      try {
        const result = await loadPicks({});
        if (result.current?.puzzle_id) setTodaysPuzzleId(result.current.puzzle_id);
      } catch {
        // Keep the fallback puzzle if the pick can't be read.
      }
    };
    void loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "done") return undefined;
    const timer = setTimeout(() => {
      if (isPortalPick(todaysPuzzleId)) {
        navigate({
          to: "/p/$code",
          params: { code: portalPickCode(todaysPuzzleId) },
        });
        return;
      }
      navigate({
        to: "/puzzle/$puzzleId",
        params: { puzzleId: todaysPuzzleId },
        search: { grid: undefined },
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [status, navigate, todaysPuzzleId]);



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
    <main className="relative min-h-screen bg-deep">
      {/* the whole picture, muted and grayed back behind the card */}
      <img
        src={dailyDogsWindow}
        alt="A chihuahua and a Maltese puppy excited at a window waiting for the mailman"
        width={1024}
        height={1408}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-40 grayscale-[0.65]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/55 to-deep/85" />

      <div className="relative z-[2] flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <Link to="/" aria-label="Home">
          <img
            src={palmLogoOnly}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="h-[3rem] w-auto drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)] transition-transform hover:scale-[1.06]"
          />
        </Link>

        <h1 className="mt-5 bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-3xl leading-none tracking-[0.14em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)] sm:text-4xl">
          Pictaria Daily
        </h1>

        {/* the box — same rounded glass style as the Easter Egg page */}
        <div className="mt-8 w-full max-w-sm rounded-[6px] border border-accent/50 bg-deep/70 px-6 py-7 shadow-lift backdrop-blur-sm">
          <p className="font-display text-[0.95rem] leading-relaxed text-deep-foreground">
            A free puzzle of Paradise, delivered every single day. Sign up and
            today's Pictaria will arrive in your inbox.
          </p>

          {(signedUp || status === "done") ? (
            <div className="mt-6 text-center">
              <p className="font-display text-[1.15rem] leading-snug text-deep-foreground">
                Welcome to Pictaria
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-deep-foreground/80">
                {status === "done"
                  ? "You're on the list. Taking you to today's Pictaria..."
                  : sessionEmail
                    ? `You're on the list at ${sessionEmail}.`
                    : "You're on the list."}
              </p>
              {status !== "done" && isPortalPick(todaysPuzzleId) && (
                <Link
                  to="/p/$code"
                  params={{ code: portalPickCode(todaysPuzzleId) }}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >
                  Play today's Pictaria
                </Link>
              )}
              {status !== "done" && !isPortalPick(todaysPuzzleId) && (
                <Link
                  to="/puzzle/$puzzleId"
                  params={{ puzzleId: todaysPuzzleId }}
                  search={{ grid: undefined }}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >

                  Play today's Pictaria
                </Link>
              )}
              {!sessionEmail && status !== "done" && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("pictaria_daily_signed_up");
                    setSignedUp(false);
                    setStatus("idle");
                  }}
                  className="mt-3 block w-full text-[10px] tracking-[0.14em] text-deep-foreground/80 uppercase underline transition-colors hover:text-deep-foreground"
                >
                  Use a different email
                </button>
              )}

            </div>

          ) : (
            <form onSubmit={submit} className="mt-6 text-left">
              <Label
                htmlFor="email"
                className="text-[0.55rem] tracking-[0.18em] text-deep-foreground/80 uppercase"
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
            className="mt-5 inline-flex items-center gap-1 text-[11px] tracking-[0.12em] text-deep-foreground/80 uppercase transition-colors hover:text-deep-foreground"
          >
            <span aria-hidden>‹</span>
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
