import { createFileRoute, Link } from "@tanstack/react-router";

import eggPalms from "@/assets/easter-egg-palms.jpg";
import palmLogo from "@/assets/logo-palms-only.png";

export const Route = createFileRoute("/easter-egg")({
  head: () => ({
    meta: [
      { title: "Easter Egg — Pictaria" },
      {
        name: "description",
        content:
          "A little Easter egg hides behind the palm trees in Pictaria — press them and they carry you home.",
      },
      { property: "og:title", content: "Easter Egg — Pictaria" },
      {
        property: "og:description",
        content:
          "A little Easter egg hides behind the palm trees in Pictaria — press them and they carry you home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EasterEggPage,
});

function EasterEggPage() {
  return (
    <main className="relative min-h-screen bg-deep">
      {/* the whole picture, muted and grayed back behind the message */}
      <img
        src={eggPalms}
        alt="Palm trees silhouetted against a soft Hawaiian sunset over the ocean"
        width={1024}
        height={1408}
        className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale-[0.65]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/55 to-deep/85" />

      <div className="relative z-[2] flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <Link to="/" aria-label="Home">
          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="h-[3rem] w-auto drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)] transition-transform hover:scale-[1.06]"
          />
        </Link>

        <h1 className="mt-5 bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-3xl leading-none tracking-[0.14em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)] sm:text-4xl">
          Easter Egg
        </h1>

        {/* the box */}
        <div className="mt-8 w-full max-w-sm rounded-[6px] border border-accent/50 bg-deep/70 px-6 py-7 shadow-lift backdrop-blur-sm">
          <p className="font-display text-[0.95rem] leading-relaxed text-deep-foreground">
            We built in a little Easter egg. It's behind the palm trees — press
            on the palm trees and you'll find that they work just like clicking
            ruby slippers to bring you home.
          </p>
          <Link
            to="/puzzle/$puzzleId"
            params={{ puzzleId: "dog-02" }}
            search={{ grid: undefined }}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-[0.6rem] tracking-[0.18em] text-accent uppercase transition-colors hover:bg-accent/15"
          >
            Try the palm trees
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
