import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { StudioComposer } from "@/components/StudioComposer";

import { saveDailySubscriber } from "@/lib/daily.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import palmLogo from "@/assets/logo-palms-only.png";
import puppyLetter from "@/assets/create-puppy-letter.jpg";


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
      <main className="flex min-h-screen flex-col items-center justify-center bg-deep px-6 py-12">
        <div className="w-full max-w-sm overflow-hidden rounded-lg border border-accent/60 bg-shell text-center shadow-soft">
          <div className="relative h-36 w-full overflow-hidden">
            <img
              src={puppyLetter}
              alt=""
              aria-hidden
              width={1024}
              height={768}
              className="h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shell/40 to-shell" />
          </div>
          <div className="p-6">

          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="mx-auto h-16 w-auto rounded-[6px] drop-shadow-[0_2px_8px_oklch(0.15_0.04_230/0.5)]"
          />
          <h1 className="mt-3 font-display text-[1.35rem] text-foreground">
            Send a free Pictaria
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Send a free Pictaria with one photo. If you want more, a
            subscription is $5.95 a month.
          </p>

          <form onSubmit={submitGate} className="mt-6 text-left">
            <Label
              htmlFor="creator-email"
              className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase"
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
              <span className="text-[12px] leading-snug text-foreground">
                Would you like a free Pictaria everyday?
              </span>
            </label>

            {gateStatus === "error" && (
              <p className="mt-2 text-[11px] text-destructive">{gateError}</p>
            )}
            <Button
              type="submit"
              disabled={gateStatus === "saving" || !gateChecked}
              className="mt-4 w-full rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              {gateStatus === "saving" ? "Saving..." : "Start here"}
            </Button>
          </form>

          <Link
            to="/"
            className="mt-4 inline-block text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            Back home
          </Link>
        </div>
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

