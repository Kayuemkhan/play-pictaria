import { createFileRoute, Link } from "@tanstack/react-router";
import mindfulnessHero from "@/assets/mindfulness-hero.jpg";
import { MindfulMusic } from "@/components/MindfulMusic";

export const Route = createFileRoute("/mindfulness")({
  head: () => ({
    meta: [
      { title: "Mindful Music — Pictaria" },
      {
        name: "description",
        content:
          "Play a Pictaria with ocean waves, singing bowls, binaural beats, or a peaceful didgeridoo drum — gentle soundscapes for a calmer, more present mind.",
      },
      {
        property: "og:title",
        content: "Mindful Music — Pictaria",
      },
      {
        property: "og:description",
        content:
          "Play a Pictaria with ocean waves, singing bowls, binaural beats, or a peaceful didgeridoo drum — gentle soundscapes for a calmer, more present mind.",
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
              Puzzles quietly draw your attention into the present moment, and
              slow music without lyrics deepens it — breathing lengthens, heart
              rate eases, and the body shifts out of alert mode into its calmer,
              restorative state. Waves and drones mask the sudden noises that keep
              us on edge, while bowls, binaural pulses, and stillness invite the
              spacious attention of meditation, turning a few quiet minutes into a
              real reset for a tired nervous system.
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
