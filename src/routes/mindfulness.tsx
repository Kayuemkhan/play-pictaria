import { createFileRoute, Link } from "@tanstack/react-router";
import { Music } from "lucide-react";
import mindfulnessHero from "@/assets/mindfulness-hero.jpg";
import { MindfulMusic, playMindfulTrack, type TrackId } from "@/components/MindfulMusic";

export const Route = createFileRoute("/mindfulness")({
  head: () => ({
    meta: [
      { title: "Mindful Music — Pictaria" },
      {
        name: "description",
        content:
          "Play a Pictaria with ocean waves, singing bowls, binaural beats, a peaceful didgeridoo drum, or a still meditation piece — gentle soundscapes for a calmer, more present mind.",
      },
      {
        property: "og:title",
        content: "Mindful Music — Pictaria",
      },
      {
        property: "og:description",
        content:
          "Play a Pictaria with ocean waves, singing bowls, binaural beats, a peaceful didgeridoo drum, or a still meditation piece — gentle soundscapes for a calmer, more present mind.",
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
      </div>

      <div className="relative z-10 -mt-24 px-5 pb-12 sm:-mt-28 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl tracking-[0.12em] text-shell uppercase sm:text-3xl">
            Mindful Music
          </h1>

          <div className="mt-5 rounded-[6px] border border-accent/40 bg-deep/90 p-6 shadow-soft backdrop-blur-md sm:p-8">
            <p className="font-body text-base leading-relaxed font-light text-shell/90 sm:text-lg">
              Pictaria puzzles are a gentle kind of meditation. A quiet picture,
              a slow breath, and the soft click of a piece falling into place
              draw the mind out of the noise and into the present moment.
            </p>
            <p className="mt-4 font-body text-base leading-relaxed font-light text-shell/90 sm:text-lg">
              Add slow music without lyrics — waves, bowls, binaural tones, or a
              grounding didgeridoo — and the calm deepens. Breathing lengthens,
              the heart rate eases, and the body shifts from alert mode into a
              calmer, more restorative state. It is a simple ritual: focus,
              restore, and finish feeling a little more peaceful than when you
              started.
            </p>
          </div>

          <MindfulMusic />

          <Link
            to="/collection/$collectionId"
            params={{ collectionId: "mindfulness" }}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-body text-[0.7rem] tracking-[0.18em] text-primary-foreground uppercase shadow-soft transition-opacity hover:opacity-90"
          >
            Play the mindfulness collection
          </Link>
        </div>
      </div>
    </main>
  );
}
