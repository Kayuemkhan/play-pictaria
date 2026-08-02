import turtle01 from "@/assets/turtle-01.jpg";
import turtle02 from "@/assets/turtle-02.jpg";
import turtle03 from "@/assets/turtle-03.jpg";
import turtle04 from "@/assets/turtle-04.jpg";
import turtle05 from "@/assets/turtle-05.jpg";
import turtle06 from "@/assets/turtle-06.jpg";
import turtle07 from "@/assets/turtle-07.jpg";
import turtle08 from "@/assets/turtle-08.jpg";
import turtle09 from "@/assets/turtle-09.jpg";
import turtle10 from "@/assets/turtle-10.jpg";
import flowerHibiscus from "@/assets/flower-hibiscus.jpg";
import flowerHibiscusPink from "@/assets/flower-hibiscus-pink.jpg";
import flowerPlumeria from "@/assets/flower-plumeria.jpg";
import flowerBirdOfParadise from "@/assets/flower-bird-of-paradise.jpg";
import flowerAnthurium from "@/assets/flower-anthurium.jpg";
import flowerHeliconia from "@/assets/flower-heliconia.jpg";
import flowerTorchGinger from "@/assets/flower-torch-ginger.jpg";
import flowerOrchid from "@/assets/flower-orchid.jpg";
import flowerBougainvillea from "@/assets/flower-bougainvillea.jpg";
import flowerPassionflower from "@/assets/flower-passionflower.jpg";
import flowerOhiaLehua from "@/assets/flower-ohia-lehua.jpg";
import waterfall01 from "@/assets/waterfall-01.jpg";
import waterfall02 from "@/assets/waterfall-02.jpg";
import waterfall03 from "@/assets/waterfall-03.jpg";
import waterfall04 from "@/assets/waterfall-04.jpg";
import waterfall05 from "@/assets/waterfall-05.jpg";
import waterfall06 from "@/assets/waterfall-06.jpg";
import waterfall07 from "@/assets/waterfall-07.jpg";
import waterfall08 from "@/assets/waterfall-08.jpg";
import waterfall09 from "@/assets/waterfall-09.jpg";
import waterfall10 from "@/assets/waterfall-10.jpg";
import sunset01 from "@/assets/sunset-01.jpg";
import sunset02 from "@/assets/sunset-02.jpg";
import sunset03 from "@/assets/sunset-03.jpg";
import sunset04 from "@/assets/sunset-04.jpg";
import sunset05 from "@/assets/sunset-05.jpg";
import sunset06 from "@/assets/sunset-06.jpg";
import sunset07 from "@/assets/sunset-07.jpg";
import sunset08 from "@/assets/sunset-08.jpg";
import sunset09 from "@/assets/sunset-09.jpg";
import sunset10 from "@/assets/sunset-10.jpg";
import coverWaterfalls from "@/assets/cover-waterfalls.jpg";
import coverSunsets from "@/assets/cover-sunsets.jpg";
import fsmResortCove from "@/assets/fsm-resort-cove.jpg.asset.json";
import fsmInfinitySunset from "@/assets/fsm-infinity-sunset.jpg.asset.json";
import fsmPoolCaviar from "@/assets/fsm-pool-caviar.jpg.asset.json";
import fsmCanoeGirls from "@/assets/fsm-canoe-girls.jpg.asset.json";
import fsmBeachYoga from "@/assets/fsm-beach-yoga.jpg.asset.json";
import amy01 from "@/assets/amy-art-01.jpg.asset.json";
import amy02 from "@/assets/amy-art-02.jpg.asset.json";
import amy03 from "@/assets/amy-art-03.jpg.asset.json";
import amy04 from "@/assets/amy-art-04.jpg.asset.json";
import amy05 from "@/assets/amy-art-05.jpg.asset.json";
import amy06 from "@/assets/amy-art-06.jpg.asset.json";
import amy07 from "@/assets/amy-art-07.jpg.asset.json";
import amy08 from "@/assets/amy-art-08.jpg.asset.json";
import amy09 from "@/assets/amy-art-09.jpg.asset.json";
import amy10 from "@/assets/amy-art-10.jpg.asset.json";

export interface Puzzle {
  id: string;
  title: string;
  caption: string;
  image: string;
}

export interface Collection {
  id: string;
  title: string;
  tagline: string;
  cover: string;
  /** Free collections are playable in guest mode. */
  free: boolean;
  /** Storybook announced on the home screen but not yet filled with puzzles. */
  comingSoon?: boolean;
  puzzles: Puzzle[];
}

/**
 * Adding a collection: drop images in src/assets, import them above, and append
 * an entry here. Everything else (routing, difficulty, play) picks it up.
 */
export const collections: Collection[] = [
  {
    id: "hawaiian-flowers",
    title: "Hawaiian Flowers",
    tagline: "Eleven island blooms in full color",
    cover: flowerPlumeria,
    free: true,
    puzzles: [
      {
        id: "flower-01",
        title: "Hibiscus",
        caption: "Dew on coral petals",
        image: flowerHibiscus,
      },
      {
        id: "flower-02",
        title: "Pink Hibiscus",
        caption: "Morning light on open petals",
        image: flowerHibiscusPink,
      },
      {
        id: "flower-03",
        title: "Plumeria",
        caption: "Sunset fragrance",
        image: flowerPlumeria,
      },
      {
        id: "flower-04",
        title: "Bird of Paradise",
        caption: "A crane in orange and blue",
        image: flowerBirdOfParadise,
      },
      {
        id: "flower-05",
        title: "Anthurium",
        caption: "A heart of glossy red",
        image: flowerAnthurium,
      },
      {
        id: "flower-06",
        title: "Heliconia",
        caption: "Scarlet bracts reaching up",
        image: flowerHeliconia,
      },
      {
        id: "flower-07",
        title: "Torch Ginger",
        caption: "A pink flame in the jungle",
        image: flowerTorchGinger,
      },
      {
        id: "flower-08",
        title: "Orchid",
        caption: "Purple petals in dappled light",
        image: flowerOrchid,
      },
      {
        id: "flower-09",
        title: "Bougainvillea",
        caption: "Magenta paper petals",
        image: flowerBougainvillea,
      },
      {
        id: "flower-10",
        title: "Passion Flower",
        caption: "A blue crown of filaments",
        image: flowerPassionflower,
      },
      {
        id: "flower-11",
        title: "Ōhia Lehua",
        caption: "Scarlet blooms on mountain slopes",
        image: flowerOhiaLehua,
      },
    ],
  },
  {
    id: "sea-turtles",
    title: "Sea Turtles",
    tagline: "Ten quiet moments beneath the surface",
    cover: turtle01,
    free: true,
    puzzles: [
      {
        id: "turtle-01",
        title: "Sunbeams",
        caption: "Gliding through morning light",
        image: turtle01,
      },

      {
        id: "turtle-02",
        title: "White Sand",
        caption: "Resting in the shallows",
        image: turtle02,
      },
      {
        id: "turtle-03",
        title: "Mosaic",
        caption: "A shell like stained glass",
        image: turtle03,
      },
      {
        id: "turtle-04",
        title: "Coral Garden",
        caption: "Above the pastel reef",
        image: turtle04,
      },
      {
        id: "turtle-05",
        title: "First Journey",
        caption: "A hatchling at sunrise",
        image: turtle05,
      },
      {
        id: "turtle-06",
        title: "Surface Song",
        caption: "Silhouette and still water",
        image: turtle06,
      },
      {
        id: "turtle-07",
        title: "Seagrass",
        caption: "Two travelers, emerald meadow",
        image: turtle07,
      },
      {
        id: "turtle-08",
        title: "Gentle Eye",
        caption: "A portrait in teal",
        image: turtle08,
      },
      {
        id: "turtle-09",
        title: "Tide Pool",
        caption: "Golden hour on lava rock",
        image: turtle09,
      },
      {
        id: "turtle-10",
        title: "Open Blue",
        caption: "Weightless in deep water",
        image: turtle10,
      },
    ],
  },
  {
    id: "waterfalls",
    title: "Waterfalls",
    tagline: "Ten hidden cascades and jade pools",
    cover: coverWaterfalls,
    free: true,
    puzzles: [
      {
        id: "waterfall-01",
        title: "Emerald Veil",
        caption: "A single fall into a jade pool",
        image: waterfall01,
      },
      {
        id: "waterfall-02",
        title: "Twin Falls",
        caption: "Two ribbons in a mossy canyon",
        image: waterfall02,
      },
      {
        id: "waterfall-03",
        title: "Silk Curtain",
        caption: "Smooth water over black basalt",
        image: waterfall03,
      },
      {
        id: "waterfall-04",
        title: "Rainbow Grotto",
        caption: "Light bending in the mist",
        image: waterfall04,
      },
      {
        id: "waterfall-05",
        title: "Fern Steps",
        caption: "A staircase of quiet water",
        image: waterfall05,
      },
      {
        id: "waterfall-06",
        title: "Cathedral",
        caption: "Looking up through the spray",
        image: waterfall06,
      },
      {
        id: "waterfall-07",
        title: "Violet Hour",
        caption: "Dusk over a still pool",
        image: waterfall07,
      },
      {
        id: "waterfall-08",
        title: "Close Water",
        caption: "Foam and moss in detail",
        image: waterfall08,
      },
      {
        id: "waterfall-09",
        title: "Where Rivers Meet",
        caption: "A fall onto black sand",
        image: waterfall09,
      },
      {
        id: "waterfall-10",
        title: "Green Valley",
        caption: "Clouds drifting past the ridge",
        image: waterfall10,
      },
    ],
  },
  {
    id: "sunsets",
    title: "Sunsets",
    tagline: "Ten gold hours over the islands",
    cover: coverSunsets,
    free: true,
    puzzles: [
      {
        id: "sunset-01",
        title: "Palm Glow",
        caption: "Gold through the fronds",
        image: sunset01,
      },
      {
        id: "sunset-02",
        title: "Mirror Sand",
        caption: "The sky on a wet shore",
        image: sunset02,
      },
      {
        id: "sunset-03",
        title: "Cliff Fire",
        caption: "Surf lit orange",
        image: sunset03,
      },
      {
        id: "sunset-04",
        title: "Canoe Bay",
        caption: "Pastel evening at anchor",
        image: sunset04,
      },
      {
        id: "sunset-05",
        title: "Long Light",
        caption: "One canoe on glass",
        image: sunset05,
      },
      {
        id: "sunset-06",
        title: "Cloud Furnace",
        caption: "Thunderheads lit from within",
        image: sunset06,
      },
      {
        id: "sunset-07",
        title: "Garden Dusk",
        caption: "Backlit petals at the shore",
        image: sunset07,
      },
      {
        id: "sunset-08",
        title: "Surfacing",
        caption: "A turtle in copper water",
        image: sunset08,
      },
      {
        id: "sunset-09",
        title: "Ridge Line",
        caption: "Layered blue silhouettes",
        image: sunset09,
      },
      {
        id: "sunset-10",
        title: "Last Sliver",
        caption: "Twilight over tide pools",
        image: sunset10,
      },
    ],
  },
  {
    id: "four-seasons-maui",
    title: "Four Seasons Maui",
    tagline: "Wailea, as their photographers see it",
    cover: fsmResortCove.url,
    free: true,
    puzzles: [
      {
        id: "fsm-01",
        title: "Wailea",
        caption: "Sunrise over the resort cove",
        image: fsmResortCove.url,
      },
      {
        id: "fsm-02",
        title: "Infinity",
        caption: "Palms and dusk at the edge pool",
        image: fsmInfinitySunset.url,
      },
      {
        id: "fsm-03",
        title: "Poolside",
        caption: "Umbrellas, salads, and open ocean",
        image: fsmPoolCaviar.url,
      },
      {
        id: "fsm-04",
        title: "Outrigger",
        caption: "Carrying the canoe to the shore break",
        image: fsmCanoeGirls.url,
      },
      {
        id: "fsm-05",
        title: "Warrior",
        caption: "Morning practice on the sand",
        image: fsmBeachYoga.url,
      },
    ],
  },
  {
    id: "amys-art",
    title: "Amy's Art",
    tagline: "Hand-blown glass sea turtles in gold and silver",
    cover: amy10.url,
    free: true,
    puzzles: [
      { id: "amy-01", title: "Worn Well", caption: "Turquoise glass at the throat", image: amy01.url },
      { id: "amy-02", title: "Golden Hour", caption: "Opal turtle on the wrist", image: amy02.url },
      { id: "amy-03", title: "Pair", caption: "Cobalt drops on gold hooks", image: amy03.url },
      { id: "amy-04", title: "Deep Blue", caption: "Sea glass and starfish", image: amy04.url },
      { id: "amy-05", title: "Sea Grass", caption: "Green glass on silver", image: amy05.url },
      { id: "amy-06", title: "Lagoon", caption: "Teal beads and gold fins", image: amy06.url },
      { id: "amy-07", title: "Sapphire", caption: "Indigo shell, gold flippers", image: amy07.url },
      { id: "amy-08", title: "Coral Branch", caption: "Blue swirl resting on white coral", image: amy08.url },
      { id: "amy-09", title: "Amber Dusk", caption: "Firelight caught in glass", image: amy09.url },
      { id: "amy-10", title: "Aurora", caption: "Violet and flame in one bead", image: amy10.url },
    ],
  },
];



export const freeCollection = collections[0]!;

export function findPuzzle(puzzleId: string) {
  for (const collection of collections) {
    const puzzle = collection.puzzles.find((p) => p.id === puzzleId);
    if (puzzle) return { puzzle, collection };
  }
  return null;
}

export interface Difficulty {
  grid: 3 | 4 | 5 | 6;
  label: string;
  note: string;
}

export const difficulties: Difficulty[] = [
  { grid: 3, label: "Relaxing", note: "9 pieces" },
  { grid: 4, label: "Engaging", note: "16 pieces" },
  { grid: 5, label: "Intriguing", note: "25 pieces" },
  { grid: 6, label: "Challenging", note: "36 pieces" },
];
