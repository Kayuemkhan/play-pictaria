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
    <main className="relative min-h-screen bg-deep pb-16">
      {/* hero picture — the pups at the window, up at the top */}
      <div className="relative h-[58vh] min-h-[360px] w-full sm:h-[62vh]">
        <img
          src={dailyDogsWindow}
          alt="A chihuahua and a Maltese puppy at a window, looking out toward palm trees and the ocean, waiting for the mailman"
          width={1024}
          height={1408}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/50 via-deep/10 to-deep" />

        {/* palm trees at the very top */}
        <Link
          to="/"
          aria-label="Home"
          className="absolute left-1/2 top-3 z-20 block -translate-x-1/2"
        >
          <img
            src={palmLogoOnly}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="h-14 w-auto rounded-[6px] drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.65)] transition-transform hover:scale-[1.04] sm:h-16"
          />
        </Link>
      </div>

      {/* wordmark */}
      <section className="relative z-10 -mt-20 px-6 pb-10 text-center sm:-mt-24">
        <div className="relative mx-auto max-w-2xl">
          <h1 className="font-display text-[1.6rem] leading-snug text-shell sm:text-[2rem]">
            Pictaria Daily
          </h1>
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              A little peek of paradise
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Just imagine how lovely it would be to get just a little peek of
              paradise in your mailbox every day. Sign up and today's Pictaria
              will arrive in your inbox.
            </p>
          </div>

          <div>
            {signedUp || status === "done" ? (
              <div className="text-center">
                <p className="font-display text-[1.15rem] leading-snug text-shell">
                  Welcome to Pictaria
                </p>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-shell/75">
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
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/15 px-6 py-3 text-[0.6rem] tracking-[0.2em] text-accent uppercase transition-transform hover:scale-[1.03]"
                  >
                    Play today's Pictaria
                    <span aria-hidden>›</span>
                  </Link>
                )}
                {status !== "done" && !isPortalPick(todaysPuzzleId) && (
                  <Link
                    to="/puzzle/$puzzleId"
                    params={{ puzzleId: todaysPuzzleId }}
                    search={{ grid: undefined }}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/15 px-6 py-3 text-[0.6rem] tracking-[0.2em] text-accent uppercase transition-transform hover:scale-[1.03]"
                  >
                    Play today's Pictaria
                    <span aria-hidden>›</span>
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
                    className="mt-4 block w-full text-[10px] tracking-[0.14em] text-shell/70 uppercase underline transition-colors hover:text-accent"
                  >
                    Use a different email
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={submit} className="mx-auto max-w-sm text-left">
                <h2 className="font-display text-lg text-shell">
                  Send me a daily Pictaria
                </h2>
                <Label
                  htmlFor="email"
                  className="mt-6 block text-[0.55rem] tracking-[0.18em] text-shell/75 uppercase"
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
                  {status === "submitting"
                    ? "Saving..."
                    : "Play today's Pictaria"}
                </Button>
              </form>
            )}
          </div>

          <PushNotifyToggle />
        </div>
      </section>

    </main>
  );
}
