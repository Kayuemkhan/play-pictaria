import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { StudioComposer } from "@/components/StudioComposer";

import { saveDailySubscriber } from "@/lib/daily.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import puppyLetter from "@/assets/create-puppy-letter.webp";


export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Send a Free Pictaria — Turn One Photo Into Play" },
      {
        name: "description",
        content:
          "Upload one photograph, add a tagline and get an instant playable link you can send to anyone you love.",
      },
      {
        property: "og:title",
        content: "Send a Free Pictaria",
      },
      {
        property: "og:description",
        content:
          "One photograph, one tagline, one instant link — a puzzle for someone you love.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  // Email capture: a creator gives us their address before they start.
  const [unlocked, setUnlocked] = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [wantsDaily, setWantsDaily] = useState(true);
  const [gateStatus, setGateStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );
  const [gateError, setGateError] = useState("");
  const saveSubscriber = useServerFn(saveDailySubscriber);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (
        data.session?.user?.email ||
        localStorage.getItem("pictaria_creator_email") ||
        localStorage.getItem("pictaria_daily_signed_up") === "1"
      ) {
        setUnlocked(true);
      }
      setGateChecked(true);
    };
    check();
  }, []);

  const submitGate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGateStatus("saving");
    setGateError("");
    try {
      await saveSubscriber({
        data: { email, source: "storybook_create", daily: wantsDaily },
      });
      localStorage.setItem("pictaria_creator_email", email.trim().toLowerCase());
      setUnlocked(true);
      setGateStatus("idle");
    } catch (err) {
      setGateStatus("error");
      setGateError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  if (!unlocked) {
    return (
      <main className="relative min-h-screen bg-deep pb-16">
        {/* hero picture — the golden retriever puppy delivering your letter */}
        <div className="relative h-[38vh] min-h-[240px] w-full sm:h-[42vh]">
          <img
            src={puppyLetter}
          fetchPriority="high"
          decoding="async"
            alt="A golden retriever puppy running along a Hawaiian beach with a letter in its mouth"
            width={1024}
            height={768}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/45 to-transparent" />
        </div>

        <section className="relative z-10 -mt-10 px-6 pb-4 text-center">
          <h1 className="font-display text-[1.6rem] leading-snug text-shell sm:text-[2rem]">
            Send a free Pictaria
          </h1>
        </section>

        <section className="px-4 sm:px-8">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
              <h2 className="font-display text-lg text-shell">
                Share your vacation as a puzzle
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
                Pick one favorite photograph — the beach, the sunset, the whole
                family squinting into the light — give it a title and a little
                note, and Pictaria turns it into a playable puzzle with its own
                link. Text it or email it to anyone you love: they tap the link,
                see your picture whole, then watch it break into tiles they get
                to put back together.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-[0.9rem] leading-relaxed text-shell/70">
                Your first one is free. If you'd like your own studio for
                storybooks full of them, a subscription is $5.95 a month.
              </p>
            </div>


            <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
              <form onSubmit={submitGate} className="mx-auto max-w-sm text-left">
                <Label
                  htmlFor="creator-email"
                  className="text-[0.55rem] tracking-[0.18em] text-shell/75 uppercase"
                >
                  Email address
                </Label>
                <Input
                  id="creator-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  maxLength={255}
                  className="mt-1.5"
                />

                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={wantsDaily}
                    onChange={(e) => setWantsDaily(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="text-[12px] leading-snug text-shell/85">
                    Would you like a free Pictaria everyday?
                  </span>
                </label>

                {gateStatus === "error" && (
                  <p className="mt-2 text-[11px] text-deep-foreground/90">{gateError}</p>
                )}
                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={gateStatus === "saving" || !gateChecked}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/15 px-6 py-3 text-[0.6rem] tracking-[0.2em] text-accent uppercase transition-transform hover:scale-[1.03] disabled:opacity-60"
                  >
                    {gateStatus === "saving" ? "Saving..." : "Start here"}
                    <span aria-hidden>›</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <StudioComposer
        tier="free"
        heading="Send a free Pictaria"
        kicker="One photograph, one instant link"
        maxPhotos={1}
        highlights={[]}
        heroImage={puppyLetter}
      />
    </>
  );
}

