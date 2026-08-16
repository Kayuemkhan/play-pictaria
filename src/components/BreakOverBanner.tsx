import { useNavigate } from "@tanstack/react-router";
import kittenLook from "@/assets/work-life-kitten-look.jpg";
import { clearBreak } from "@/lib/break-session";

/**
 * Shown once the visitor finishes the number of puzzles they picked on the
 * Work Life Balance page — the kitten looks up over her glasses and sends
 * them gently back to work.
 */
export function BreakOverBanner({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const dismiss = () => {
    clearBreak();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-deep/70 px-4 backdrop-blur-sm">
      <div className="animate-soft-in w-full max-w-sm overflow-hidden rounded-[10px] border border-accent/40 bg-card shadow-lift">
        <img
          src={kittenLook}
          alt="A kitten in wireframe glasses at a laptop, looking over the top of her glasses at you"
          className="h-56 w-full object-cover"
          width={1024}
          height={1024}
        />
        <div className="p-6 text-center">
          <p className="font-display text-xl leading-snug text-foreground">
            Okay, that was fun!
          </p>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
            Let's both go back to work now....
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-primary/70 py-3 text-sm tracking-wide text-primary transition-colors hover:bg-primary/10"
            >
              Back to work
            </button>
            <button
              type="button"
              onClick={() => {
                clearBreak();
                onClose();
                navigate({ to: "/work-life-balance" });
              }}
              className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              One more little break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
