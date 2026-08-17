import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";


import waterRocks from "@/assets/share-water-rocks.jpg";
import palmLogo from "@/assets/logo-palms-only.png";

const SHARE_URL = "https://play-pictaria.lovable.app/";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Share Pictaria — Scan to Play" },
      {
        name: "description",
        content:
          "Scan the QR code to step into Pictaria and turn beautiful pictures into play.",
      },
      { property: "og:title", content: "Share Pictaria — Scan to Play" },
      {
        property: "og:description",
        content:
          "Scan the QR code to step into Pictaria and turn beautiful pictures into play.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const [qr, setQr] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(SHARE_URL, {
        width: 1024,
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: "#0d3b4c", light: "#ffffff" },
      });
      if (alive) setQr(url);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-deep pb-16 text-center">
      {/* soft-focus water feature up top, fading into the page */}
      <div className="relative w-full">
        <img
          src={waterRocks}
          alt="Ocean waves splashing over volcanic rocks beside plumeria blossoms and palm fronds"
          width={1024}
          height={768}
          className="h-56 w-full object-cover blur-[2px] sm:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/35 via-deep/45 to-deep" />
      </div>

      <div className="relative z-[2] -mt-24 flex w-full max-w-sm flex-col items-center px-6">
        <Link to="/" aria-label="Home">
          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="h-[3.25rem] w-auto drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)]"
          />
        </Link>
        <span className="mt-4 bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-3xl leading-none tracking-[0.14em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)]">
          Pictaria
        </span>
        <h1
          className="mt-0.5 font-display text-[0.81rem] tracking-[0.42em] uppercase"
          style={{
            color: "oklch(0.98 0.025 85)",
            textShadow: "0 2px 12px oklch(0.15 0.04 230 / 0.55)",
          }}
        >
          Turn pictures into play
        </h1>

        {/* QR square */}
        <div className="mt-8 w-full max-w-[14rem] rounded-[6px] border border-accent/50 bg-shell p-3 shadow-lift">
          <Link
            to="/collection/$collectionId"
            params={{ collectionId: "portal" }}
            aria-label="Scan to play"
            className="block aspect-square w-full overflow-hidden rounded-[4px] bg-white"
          >
            {qr ? (
              <img
                src={qr}
                alt={`QR code linking to ${SHARE_URL}`}
                className="h-full w-full object-contain"
              />
            ) : null}
          </Link>
          <p className="mt-2 text-[0.55rem] tracking-[0.2em] text-muted-foreground uppercase">
            Scan to play
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-[19rem] flex-col items-center gap-2">
          <a
            href={SHARE_URL}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-[0.6rem] tracking-[0.18em] text-accent uppercase transition-colors hover:bg-accent/15"
          >
            link play-pictaria.com
            <span aria-hidden>›</span>
          </a>
        </div>
      </div>
    </main>
  );
}
