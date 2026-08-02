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
import coverReef from "@/assets/cover-reef.jpg";
import coverBlooms from "@/assets/cover-blooms.jpg";
import coverShores from "@/assets/cover-shores.jpg";
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
    id: "coral-reef",
    title: "Coral Reef",
    tagline: "Twelve reef gardens in bloom",
    cover: coverReef,
    free: false,
    puzzles: [],
  },
  {
    id: "island-blooms",
    title: "Island Blooms",
    tagline: "Plumeria, hibiscus, and quiet green",
    cover: coverBlooms,
    free: false,
    puzzles: [],
  },
  {
    id: "still-shores",
    title: "Still Shores",
    tagline: "Long horizons and soft light",
    cover: coverShores,
    free: false,
    puzzles: [],
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
  { grid: 5, label: "Challenging", note: "25 pieces" },
  { grid: 6, label: "Intriguing", note: "36 pieces" },
];
