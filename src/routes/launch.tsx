import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveDailySubscriber } from "@/lib/daily.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import palmLogoOnly from "@/assets/logo-palms-only.png";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Pictaria Launch — Join the Launch List" },
      {
        name: "description",
        content:
          "Watch the Pictaria launch film and join the launch list to be first to send your special moments as a game.",
      },
      { property: "og:title", content: "Pictaria Launch — Join the Launch List" },
      {
        property: "og:description",
        content:
          "Watch the Pictaria launch film and join the launch list to be first to send your special moments as a game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LaunchPage,
});

function LaunchPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const subscribe = useServerFn(saveDailySubscriber);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || value.length > 255) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await subscribe({
        data: { email: value, source: "launch_list", daily: false },
      });
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong — please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-deep px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center text-center">
          <Link to="/" aria-label="Pictaria home">
            <img
              src={palmLogoOnly}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="mt-4 font-display text-3xl tracking-[0.28em] text-accent uppercase">
            Launch
          </h1>
          <p className="mt-3 font-display text-[0.95rem] leading-snug text-shell">
            Discover beautiful photography one puzzle "peace" at a time.
          </p>
          <Link
            to="/collections"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/10 px-5 py-2.5 font-display text-[0.65rem] tracking-[0.18em] text-accent uppercase transition hover:bg-accent/20"
          >
            Play more puzzles
            <span aria-hidden>›</span>
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-[6px] border border-accent/40 shadow-lift">
          <video
            src="/pictaria-launch.mp4"
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full bg-black object-cover"
          />
        </div>

        <a
          href="/pictaria-launch.mp4"
          download="pictaria-launch.mp4"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-5 py-3 font-display text-[0.65rem] tracking-[0.18em] text-accent uppercase transition hover:bg-accent/20"
        >
          Download video
          <span aria-hidden>↓</span>
        </a>

        <section className="mt-6 rounded-[6px] border border-accent/40 bg-shell p-5">
          <h2 className="font-display text-sm tracking-[0.2em] text-foreground uppercase">
            Join the launch list
          </h2>
          <p className="mt-2 text-[0.8rem] leading-snug text-muted-foreground">
            Be the first to know when Pictaria opens up — we'll email you the
            moment it goes live.
          </p>

          {status === "done" ? (
            <div className="mt-4 rounded-[6px] border border-primary/40 bg-primary/10 p-4 text-center">
              <p className="font-display text-[0.95rem] text-foreground">
                You're on the list — count you in!
              </p>
              <Link
                to="/daily"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase"
              >
                Play today's Pictaria
                <span aria-hidden>›</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div>
                <Label
                  htmlFor="launch-email"
                  className="text-[0.6rem] tracking-[0.18em] uppercase"
                >
                  Email address
                </Label>
                <Input
                  id="launch-email"
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>
              {status === "error" && (
                <p className="text-[0.7rem] text-destructive">{errorMsg}</p>
              )}
              <Button
                type="submit"
                disabled={status === "submitting"}
                className="w-full tracking-[0.2em] uppercase"
              >
                {status === "submitting" ? "Adding you…" : "Count me in"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
