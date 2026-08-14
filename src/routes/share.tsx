import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Check, Download, Share2 } from "lucide-react";

import catOcean from "@/assets/share-cat-ocean.jpg";
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
  const [copied, setCopied] = useState(false);

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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pictaria",
          text: "Turn pictures into play — come visit Pictaria.",
          url: SHARE_URL,
        });
        return;
      } catch {
        /* dismissed */
      }
    }
    void copy();
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-deep px-6 pt-10 pb-12 text-center">
      <img
        src={catOcean}
        alt="A cat on a lava ledge gazing out over the Hawaiian ocean at sunset"
        width={1024}
        height={1408}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 saturate-50"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/50 to-deep/85" />

      <div className="relative z-[2] flex w-full max-w-sm flex-col items-center">
        <img
          src={palmLogo}
          alt="Pictaria"
          width={1024}
          height={1024}
          className="h-[3.25rem] w-auto drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)]"
        />
        <span className="mt-4 bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-4xl leading-none tracking-[0.34em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)]">
          Pictaria
        </span>
        <h1
          className="-mt-1 font-display text-[0.81rem] tracking-[0.42em] uppercase"
          style={{
            color: "oklch(0.98 0.025 85)",
            textShadow: "0 2px 12px oklch(0.15 0.04 230 / 0.55)",
          }}
        >
          Welcome to Pictaria
        </h1>

        {/* QR square */}
        <div className="mt-8 w-full max-w-[19rem] rounded-[6px] border border-accent/50 bg-shell p-4 shadow-lift">
          <span className="block aspect-square w-full overflow-hidden rounded-[4px] bg-white">
            {qr ? (
              <img
                src={qr}
                alt={`QR code linking to ${SHARE_URL}`}
                className="h-full w-full object-contain"
              />
            ) : null}
          </span>
          <p className="mt-3 text-[0.55rem] tracking-[0.2em] text-muted-foreground uppercase">
            Scan to play
          </p>
        </div>

        <p className="mt-4 text-[0.7rem] tracking-[0.14em] text-accent uppercase">
          play-pictaria.lovable.app
        </p>

        <div className="mt-6 flex w-full max-w-[19rem] flex-col gap-2">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.02]"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Pictaria
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-[0.55rem] tracking-[0.2em] text-shell uppercase transition-colors hover:bg-accent/15"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={qr || undefined}
              download="pictaria-qr.png"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-[0.55rem] tracking-[0.2em] text-shell uppercase transition-colors hover:bg-accent/15"
            >
              <Download className="h-3.5 w-3.5" />
              Save QR
            </a>
          </div>
        </div>

        <Link
          to="/"
          className="mt-8 text-[0.55rem] tracking-[0.2em] text-shell/70 uppercase transition-opacity hover:opacity-100"
        >
          ‹ Home
        </Link>
      </div>
    </main>
  );
}
