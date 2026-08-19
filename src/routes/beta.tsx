import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { redeemBetaCode } from "@/lib/beta.functions";
import palmLogo from "@/assets/logo-palms-only.png";

export const Route = createFileRoute("/beta")({
  head: () => ({
    meta: [
      { title: "Pictaria Beta — Unlock Your Studio" },
      {
        name: "description",
        content:
          "Have a Pictaria beta code? Enter it with your email address to unlock the Artist or Brand Studio while we're in beta.",
      },
      { property: "og:title", content: "Pictaria Beta — Unlock Your Studio" },
      {
        property: "og:description",
        content:
          "Redeem your beta code to unlock the Artist or Brand Studio: retouching, story notes, logo placement and shareable puzzle links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BetaRedeem,
});

function BetaRedeem() {
  const redeem = useServerFn(redeemBetaCode);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tier, setTier] = useState<"artist" | "brand">("artist");

  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("code");
    if (fromLink) setCode(fromLink.toUpperCase());
    const saved = window.localStorage.getItem("pictaria-email");
    if (saved) setEmail(saved);
  }, []);

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await redeem({ data: { email: email.trim(), code } });
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      window.localStorage.setItem("pictaria-email", result.email);
      window.localStorage.setItem("pictaria-beta-tier", result.tier);
      setTier(result.tier === "brand" ? "brand" : "artist");
      setDone(true);
    } catch {
      setError("Something went sideways — please try that again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-deep px-4 pt-12 pb-16">
      <div className="mx-auto w-full max-w-md flex-1">
        <Link to="/" aria-label="Home" className="mx-auto block w-fit">
          <img
            src={palmLogo}
            alt="Pictaria"
            className="mx-auto h-20 w-auto transition-transform hover:scale-[1.04]"
            loading="lazy"
          />
        </Link>

        <section className="mt-6 rounded-lg bg-shell/95 p-6 text-center shadow-soft">
          {done ? (
            <>
              <h1 className="font-display text-[1.5rem] text-foreground">
                Welcome to the beta
              </h1>
              <p className="mt-2 text-[12px] text-muted-foreground">
                {tier === "brand"
                  ? "Brand Studio is open for you — logo placement, action buttons, analytics and unlimited branded storybooks."
                  : "The Artist Studio is open for you — retouching, story notes and your own shareable Pictaria links."}
              </p>
              <Link
                to={tier === "brand" ? "/studio/brand" : "/studio/artist"}
                className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-[11px] tracking-[0.16em] text-primary-foreground uppercase"
              >
                {tier === "brand" ? "Open Brand Studio" : "Open Artist Studio"}
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-[1.5rem] text-foreground">
                Your beta code
              </h1>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Enter your email and the code you were given to unlock your
                studio.
              </p>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                className="mt-5 w-full rounded-full border border-accent/40 px-4 py-3 text-center text-[13px] text-foreground"
              />
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="ARTIST3 or BRANDSTUDIO50"
                className="mt-3 w-full rounded-full border border-accent/40 px-4 py-3 text-center text-[13px] tracking-[0.14em] text-foreground"
              />

              {error && (
                <p className="mt-3 text-[11px] text-destructive">{error}</p>
              )}

              <button
                type="button"
                onClick={() => void submit()}
                disabled={busy || !email.trim() || !code.trim()}
                className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-[11px] tracking-[0.16em] text-primary-foreground uppercase disabled:opacity-50"
              >
                {busy ? "Unlocking…" : "Unlock your studio"}
              </button>
            </>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
          >
            Back to Pictaria
          </Link>
        </div>
      </div>
    </main>
  );
}
