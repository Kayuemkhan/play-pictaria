import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import mindfulnessHero from "@/assets/mindfulness-hero.jpg";
import mindfulnessRocks from "@/assets/mindfulness-rocks.jpg";
import mindfulnessBamboo from "@/assets/mindfulness-bamboo.jpg";
import mindfulnessBuddha from "@/assets/mindfulness-buddha.jpg";
import mindfulnessStarfish from "@/assets/mindfulness-starfish.jpg";
import mindfulnessMeditation from "@/assets/mindfulness-meditation.jpg";
import mindfulnessLotus from "@/assets/mindfulness-lotus.jpg";
import mindfulnessWaves from "@/assets/mindfulness-waves.jpg";
import mindfulnessZenGarden from "@/assets/mindfulness-zengarden.jpg";
import mindfulnessWaterfall from "@/assets/mindfulness-waterfall.jpg";
import mindfulnessLavatube from "@/assets/mindfulness-lavatube.jpg";

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

const gallery = [
  { src: mindfulnessHero, alt: "A calm Hawaiian tide pool with a floating plumeria flower at sunset" },
  { src: mindfulnessRocks, alt: "A zen stack of smooth black lava stones on a Hawaiian beach at sunrise" },
  { src: mindfulnessBamboo, alt: "A peaceful bamboo forest path with golden rays of sunlight" },
  { src: mindfulnessBuddha, alt: "A serene Buddha statue in a tropical garden at golden hour" },
  { src: mindfulnessStarfish, alt: "A delicate starfish resting on wet golden sand at the water's edge" },
  { src: mindfulnessMeditation, alt: "A person meditating on a cliff overlooking the ocean at sunrise" },
  { src: mindfulnessLotus, alt: "A pink lotus flower floating on still water at dawn" },
  { src: mindfulnessWaves, alt: "Gentle turquoise waves rolling onto a black sand beach" },
  { src: mindfulnessZenGarden, alt: "A Hawaiian zen garden with raked black sand and smooth stones" },
  { src: mindfulnessWaterfall, alt: "A tranquil tropical waterfall in a lush Hawaiian rainforest" },
  { src: mindfulnessSunset, alt: "A single palm tree silhouetted against a vibrant Hawaiian sunset" },
];

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

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {gallery.map((image, i) => (
              <div
                key={i}
                className="group aspect-[3/2] overflow-hidden rounded-[6px] border border-accent/20 bg-deep-foreground/5 shadow-soft"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  width={1344}
                  height={896}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
