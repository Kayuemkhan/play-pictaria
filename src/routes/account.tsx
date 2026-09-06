import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Gift, Heart, X } from "lucide-react";

import plumeria from "@/assets/flower-plumeria.webp";
import { submitSubscriptionRequest } from "@/lib/subscription.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Pictaria Membership — Manage or Cancel" },
      {
        name: "description",
        content:
          "Manage your Pictaria membership: see your plan, claim a free month, or cancel any time. No hoops, no hold music.",
      },
      { property: "og:title", content: "Your Pictaria Membership" },
      {
        property: "og:description",
        content:
          "See your plan, claim a free month, or cancel any time — your storybooks stay yours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

const PLANS = ["Personal", "Artist", "Brand"] as const;

type Step = "manage" | "retention" | "reason" | "kept" | "cancelled";

function AccountPage() {
  const submit = useServerFn(submitSubscriptionRequest);

  const [step, setStep] = useState<Step>("manage");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<string>("Personal");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /.+@.+\..+/.test(email.trim());

  // Keep the page from scrolling behind the retention card on phones.
  useEffect(() => {
    const open = step === "retention" || step === "reason";
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [step]);

  const send = async (kind: "free_month" | "cancel") => {
    setBusy(true);
    setError(null);
    try {
      await submit({
        data: {
          email: email.trim(),
          plan,
          kind,
          reason: kind === "cancel" ? reason.trim() || undefined : undefined,
        },
      });
      setStep(kind === "free_month" ? "kept" : "cancelled");
    } catch {
      setError("That didn't go through. Please try once more.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist-gradient px-5 pt-20 pb-28">
      <div className="mx-auto max-w-md">
        <header className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            your membership
          </p>
          <h1 className="mt-2 font-display text-[2rem] leading-tight text-foreground">
            Manage your Pictaria
          </h1>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
            Change your mind any time. Cancelling is two taps and we never make
            you call anyone.
          </p>
        </header>

        {step === "manage" && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <label className="block text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Your email
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-[0.95rem] text-foreground outline-none focus:border-ring"
            />

            <p className="mt-5 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Your plan
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLANS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  aria-pressed={plan === p}
                  className={`rounded-full px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors ${
                    plan === p
                      ? "bg-primary text-primary-foreground"
                      : "border border-input bg-background text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!emailOk}
              onClick={() => setStep("retention")}
              className="mt-7 w-full rounded-full border border-input bg-background px-6 py-3.5 text-[11px] tracking-[0.2em] text-foreground uppercase disabled:opacity-45"
            >
              Cancel my membership
            </button>
            {!emailOk && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Add the email on your membership to continue.
              </p>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/pricing"
                className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase underline underline-offset-4"
              >
                See all plans
              </Link>
            </div>
          </section>
        )}

        {step === "kept" && (
          <section className="mt-8 rounded-2xl border border-accent/50 bg-card p-6 text-center shadow-soft">
            <Heart className="mx-auto h-7 w-7 text-primary" strokeWidth={1.5} />
            <h2 className="mt-3 font-display text-[1.5rem] text-foreground">
              Oh good — you stayed
            </h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
              Your free month is requested and saved under {email.trim()}. Amy
              applies it by hand right now, so you&rsquo;ll get an email
              confirming it before your next payment date — your membership stays
              exactly as it is in the meantime.
            </p>
            <Link
              to="/collections"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[11px] tracking-[0.2em] text-primary-foreground uppercase"
            >
              Back to my pictures
            </Link>
          </section>
        )}

        {step === "cancelled" && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <h2 className="font-display text-[1.5rem] text-foreground">
              Your cancellation is in
            </h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
              We&rsquo;ve recorded the cancellation for {email.trim()} and
              you&rsquo;ll get an email once it&rsquo;s closed out. Nothing new
              will be charged after that, and the door is always open.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full border border-input bg-background px-6 py-3 text-[11px] tracking-[0.2em] text-foreground uppercase"
            >
              Go home
            </Link>
          </section>
        )}

        {error && (
          <p className="mt-4 text-center text-[12px] text-foreground">{error}</p>
        )}
      </div>

      {(step === "retention" || step === "reason") && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-deep/70 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0">
          <div className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-accent/40 bg-card p-6 text-center shadow-lift">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setStep("manage")}
              className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {step === "retention" ? (
              <>
                <img
                  src={plumeria}
                  alt=""
                  aria-hidden
                  className="mx-auto h-24 w-24 rounded-full object-cover shadow-soft"
                />
                <h2 className="mt-4 font-display text-[1.7rem] leading-tight text-foreground">
                  Hey, don&rsquo;t go&hellip;
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                  Do you really want to send your pictures back to your phone,
                  where you might never see them again?
                </p>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-foreground">
                  Stay a little longer, on us.
                </p>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void send("free_month")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[11px] tracking-[0.2em] text-primary-foreground uppercase shadow-lift disabled:opacity-60"
                >
                  <Gift className="h-4 w-4" strokeWidth={1.75} />
                  {busy ? "One moment…" : "Enjoy a free month"}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStep("reason")}
                  className="mt-3 w-full rounded-full border border-input bg-background px-6 py-3 text-[11px] tracking-[0.18em] text-muted-foreground uppercase disabled:opacity-60"
                >
                  No thanks, continue cancelling
                </button>

                <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
                  The free month is added by hand and confirmed by email. Your
                  pictures stay yours either way.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-[1.5rem] leading-tight text-foreground">
                  Alright — before you go
                </h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
                  Anything you&rsquo;d like Amy to know? Totally optional.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Too many photos, not enough time…"
                  className="mt-4 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-[0.92rem] text-foreground outline-none focus:border-ring"
                />

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void send("cancel")}
                  className="mt-5 w-full rounded-full bg-deep px-6 py-3.5 text-[11px] tracking-[0.2em] text-deep-foreground uppercase disabled:opacity-60"
                >
                  {busy ? "One moment…" : "Confirm cancellation"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void send("free_month")}
                  className="mt-3 w-full rounded-full border border-accent/60 bg-background px-6 py-3 text-[11px] tracking-[0.18em] text-foreground uppercase disabled:opacity-60"
                >
                  Actually, take the free month
                </button>

                {error && (
                  <p className="mt-3 text-[12px] text-foreground">{error}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
