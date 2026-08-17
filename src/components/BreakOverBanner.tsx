import kittenLook from "@/assets/work-life-kitten-look.jpg";
import { clearBreak } from "@/lib/break-session";

/**
 * Shown once the visitor finishes the number of puzzles they picked on the
 * Work Life Balance page — the kitten turns her head fully toward the viewer,
 * wire-rim glasses clearly visible, and sends them gently back to work.
 */
export function BreakOverBanner({ onClose }: { onClose: () => void }) {
  const exitApp = () => {
    clearBreak();
    onClose();
    if (typeof window === "undefined") return;
    // Try to close the tab/app window. If the browser blocks it (window was not
    // opened by script), fall back to a blank page so the user leaves Pictaria.
    window.close();
    window.setTimeout(() => {
      window.location.href = "about:blank";
    }, 120);
  };

  const shareThenExit = async () => {
    const url = "https://play-pictaria.lovable.app";
    const text = "Take a little brain break with me in Pictaria 🧩";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pictaria", text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
    } catch {
      // User cancelled the share/copy — stay in the banner so they can choose again.
      return;
    }
    exitApp();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-deep/70 px-4 backdrop-blur-sm">
      <div className="animate-soft-in w-full max-w-sm overflow-hidden rounded-[10px] border border-accent/40 bg-card shadow-lift">
        <div className="relative">
          <img
            src={kittenLook}
            alt="A kitten in wireframe glasses at a laptop, looking directly at you"
            className="h-56 w-full object-cover"
            width={1024}
            height={1024}
          />
          <Link
            to="/"
            onClick={onClose}
            aria-label="Home"
            className="absolute top-2 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5 text-accent/90 drop-shadow-[0_2px_8px_oklch(0.15_0.04_230/0.7)] transition-transform hover:scale-105 active:scale-95"
          >
            <img src={palmLogo} alt="" aria-hidden className="h-7 w-auto" />
            <span className="text-[0.5rem] font-medium tracking-[0.14em] uppercase">
              home
            </span>
          </Link>
        </div>

        <div className="p-6 text-center">
          <p className="font-display text-xl leading-snug text-foreground">
            Okay, that was fun!
          </p>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
            Let's both go back to work now....
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={exitApp}
              className="rounded-full border border-accent/60 bg-accent/15 py-3 text-sm tracking-wide text-accent transition-colors hover:bg-accent/25"
            >
              click out of this app completely
            </button>
            <button
              type="button"
              onClick={shareThenExit}
              className="rounded-full border border-accent/60 bg-accent/15 py-3 text-sm tracking-wide text-accent transition-colors hover:bg-accent/25"
            >
              pass the fun to a friend, then back to work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
