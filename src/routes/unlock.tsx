import { createFileRoute, Link } from "@tanstack/react-router";
import { collections } from "@/data/collections";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Pictaria Premium — Unlock every collection" },
      {
        name: "description",
        content:
          "Unlock all Pictaria puzzle collections with a monthly membership or a one-time purchase. New galleries added regularly.",
      },
      {
        property: "og:title",
        content: "Pictaria Premium — Unlock every collection",
      },
      {
        property: "og:description",
        content:
          "Every gallery, every difficulty, no interruptions. Monthly or one-time.",
      },
    ],
  }),
  component: Unlock,
});

const plans = [
  {
    name: "Monthly",
    price: "$3.99",
    per: "per month",
    points: [
      "Every collection, unlocked",
      "New gallery each month",
      "Cancel anytime",
    ],
    highlight: true,
  },
  {
    name: "Lifetime",
    price: "$24.99",
    per: "one-time",
    points: [
      "All current collections forever",
      "All future galleries included",
      "No subscription",
    ],
    highlight: false,
  },
];

function Unlock() {
  const lockedCount = collections.filter((c) => !c.free).length;

  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/"
          className="inline-block py-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Gallery
        </Link>

        <header className="mt-6 text-center">
          <p className="text-[11px] tracking-[0.42em] text-muted-foreground uppercase">
            Pictaria Premium
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">
            Every picture, every pace
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            The sea turtles stay free, always. Premium opens the remaining{" "}
            {lockedCount} collections and everything we add next.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-7 shadow-soft ${
                plan.highlight
                  ? "border-primary/40 bg-card shadow-lift"
                  : "border-border bg-card/70"
              }`}
            >
              <p className="text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
                {plan.name}
              </p>
              <p className="mt-3 font-display text-4xl">{plan.price}</p>
              <p className="text-xs text-muted-foreground">{plan.per}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.points.map((point) => (
                  <li key={point} className="flex gap-2 text-muted-foreground">
                    <span className="text-primary">✦</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-7 w-full rounded-full py-3 text-sm tracking-wide transition-opacity hover:opacity-90 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Checkout isn't connected yet — say the word and I'll wire up payments.
        </p>
      </div>
    </main>
  );
}
