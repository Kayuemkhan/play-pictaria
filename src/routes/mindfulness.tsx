import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import mindfulnessHero from "@/assets/mindfulness-hero.jpg";

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
    <main className="min-h-screen bg-deep">
      <div className="relative h-[46vh] min-h-[300px] w-full sm:h-[50vh]">
        <img
          src={mindfulnessHero}
          alt="A calm Hawaiian tide pool with a floating plumeria flower at sunset"
          className="absolute inset-0 h-full w-full object-cover"
          width={1344}
          height={896}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/40 via-deep/20 to-deep" />

        <Link
          to="/"
          className="absolute left-5 top-6 inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] text-shell uppercase transition-opacity hover:opacity-70 sm:left-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Home
        </Link>
      </div>

      <div className="relative z-10 -mt-24 px-5 pb-12 sm:-mt-28 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl tracking-[0.12em] text-shell uppercase sm:text-3xl">
            Mindfulness
          </h1>

          <div className="mt-5 rounded-[6px] border border-accent/40 bg-deep/90 p-6 shadow-soft backdrop-blur-md sm:p-8">
            <p className="font-body text-base leading-relaxed text-shell/95 sm:text-lg">
              Puzzles are more than entertainment. Research suggests they engage
              multiple areas of the brain at once, supporting visual-spatial
              skills, attention, working memory, and problem-solving. They also
              invite a state of mindfulness, gently drawing your attention into
              the present moment as the outside world fades away, creating a
              calming, focused experience that many people find both relaxing and
              deeply satisfying.
            </p>
          </div>

          <Link
            to="/collection/$collectionId"
            params={{ collectionId: "mindfulness" }}
            className="mt-6 inline-flex items-center justify-center rounded-[4px] bg-primary px-6 py-3 font-body text-[0.7rem] tracking-[0.18em] text-primary-foreground uppercase shadow-soft transition-opacity hover:opacity-90"
          >
            Play the mindfulness collection
          </Link>
        </div>
      </div>
    </main>
  );
}
