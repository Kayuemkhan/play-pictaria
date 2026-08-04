import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mindfulness")({
  head: () => ({
    meta: [
      { title: "Mindfulness — Pictaria" },
      {
        name: "description",
        content:
          "Puzzles invite mindfulness. Discover how solving a Pictaria can calm the mind, focus attention, and bring you gently into the present moment.",
      },
      {
        property: "og:title",
        content: "Mindfulness — Pictaria",
      },
      {
        property: "og:description",
        content:
          "Puzzles invite mindfulness. Discover how solving a Pictaria can calm the mind, focus attention, and bring you gently into the present moment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MindfulnessPage,
});

function MindfulnessPage() {
  return (
    <main className="min-h-screen bg-deep px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] text-accent uppercase transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Home
        </Link>

        <h1 className="mt-6 font-display text-2xl tracking-[0.12em] text-shell uppercase sm:text-3xl">
          Mindfulness
        </h1>

        <div className="mt-6 rounded-[6px] border border-accent/40 bg-deep-foreground/5 p-6 shadow-soft sm:p-8">
          <p className="font-body text-base leading-relaxed text-shell/90 sm:text-lg">
            Puzzles are more than entertainment. Research suggests they engage
            multiple areas of the brain at once, supporting visual-spatial
            skills, attention, working memory, and problem-solving. They also
            invite a state of mindfulness, gently drawing your attention into
            the present moment as the outside world fades away, creating a
            calming, focused experience that many people find both relaxing and
            deeply satisfying.
          </p>
        </div>
      </div>
    </main>
  );
}
