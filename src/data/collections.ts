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
import whale01 from "@/assets/whale-01.jpg";
import whale02 from "@/assets/whale-02.jpg";
import whale03 from "@/assets/whale-03.jpg";
import whale04 from "@/assets/whale-04.jpg";
import whale06 from "@/assets/whale-06.jpg";
import whale08 from "@/assets/whale-08.jpg";
import whale09 from "@/assets/whale-09.jpg";
import whale10 from "@/assets/whale-10.jpg";
import whale13 from "@/assets/whale-13.jpg";
import whale14 from "@/assets/whale-14.jpg";
import cat01 from "@/assets/cat-01.jpg";
import cat02 from "@/assets/cat-02.jpg";
import cat03 from "@/assets/cat-03.jpg";
import cat04 from "@/assets/cat-04.jpg";
import cat05 from "@/assets/cat-05.jpg";
import cat06 from "@/assets/cat-06.jpg";
import cat07 from "@/assets/cat-07.jpg";
import cat08 from "@/assets/cat-08.jpg";
import cat09 from "@/assets/cat-09.jpg";
import cat10 from "@/assets/cat-10.jpg";
import pineapple01 from "@/assets/pineapple-01.jpg";
import pineapple02 from "@/assets/pineapple-02.jpg";
import pineapple03 from "@/assets/pineapple-03.jpg";
import pineapple04 from "@/assets/pineapple-04.jpg";
import pineapple05 from "@/assets/pineapple-05.jpg";
import pineapple06 from "@/assets/pineapple-06.jpg";
import pineapple07 from "@/assets/pineapple-07.jpg";
import pineapple08 from "@/assets/pineapple-08.jpg";
import pineapple09 from "@/assets/pineapple-09.jpg";
import pineapple10 from "@/assets/pineapple-10.jpg";
import pineapple11 from "@/assets/pineapple-11.jpg";
import pineapple12 from "@/assets/pineapple-12.jpg";
import pineapple13 from "@/assets/pineapple-13.jpg";



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
import amy09 from "@/assets/amy-art-09.jpg.asset.json";
import amy10 from "@/assets/amy-art-10.jpg.asset.json";
import amy11 from "@/assets/amy-art-11.jpg.asset.json";
import amy12 from "@/assets/amy-art-12.jpg.asset.json";

import amy06Enhanced from "@/assets/amy-art-06-enhanced.jpg";
import amy03Enhanced from "@/assets/amy-art-03-enhanced.jpg";
import amy05Enhanced from "@/assets/amy-art-05-enhanced.jpg";
import amy08Enhanced from "@/assets/amy-art-08-enhanced.jpg";
import amy13Enhanced from "@/assets/amy-art-13-enhanced.jpg";

export interface Puzzle {
  id: string;
  title: string;
  caption: string;
  image: string;
  /** Optional recipe to show beneath the puzzle image. */
  recipe?: string;
  /** Optional story/bio paragraphs to show beneath the puzzle image. */
  story?: string[];
}


export interface Collection {
  id: string;
  title: string;
  tagline: string;
  cover: string;
  /** Optional zoom applied to the cover image on the home screen. */
  coverZoom?: number;
  /** Free collections are playable in guest mode. */
  free: boolean;
  /** Storybook announced on the home screen but not yet filled with puzzles. */
  comingSoon?: boolean;
  /**
   * Set when the collection is a member's or brand's own storybook. Visitors
   * opening a shared storybook play a set number of puzzles for free, then get
   * invited into Pictaria for the rest.
   */
  storybook?: {
    /** Whose storybook this is, as the visitor should read it. */
    owner: string;
    /** personal = 3 free puzzles, white-label = 10 free puzzles. */
    plan: "personal" | "white-label";
  };
  puzzles: Puzzle[];
}

/** How many puzzles a visitor may open in a shared storybook. */
export const STORYBOOK_ALLOWANCE = { personal: 3, "white-label": 10 } as const;

/**
 * Number of puzzles a visitor can open in this collection.
 * Pictaria's own collections are fully open (Infinity).
 */
export function visitorAllowance(collection: Collection): number {
  if (!collection.storybook) return Number.POSITIVE_INFINITY;
  return STORYBOOK_ALLOWANCE[collection.storybook.plan];
}

/** Puzzles in this storybook the visitor has not been given access to. */
export function waitingCount(collection: Collection): number {
  return Math.max(0, collection.puzzles.length - visitorAllowance(collection));
}

/** True when the visitor may open this puzzle for free. */
export function isPuzzleOpenToVisitor(
  collection: Collection,
  puzzleId: string,
): boolean {
  const index = collection.puzzles.findIndex((p) => p.id === puzzleId);
  return index >= 0 && index < visitorAllowance(collection);
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
        id: "flower-02",
        title: "Pink Hibiscus",
        caption: "Morning light on open petals",
        image: flowerHibiscusPink,
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
    id: "whales",
    title: "Whales",
    tagline: "Ten encounters with the ocean's gentle giants",
    cover: whale02,
    free: true,
    puzzles: [
      {
        id: "whale-01",
        title: "Mother and Calf",
        caption: "Side by side in the light",
        image: whale01,
      },
      {
        id: "whale-02",
        title: "Breach",
        caption: "Rising whole from the water",
        image: whale02,
      },
      {
        id: "whale-03",
        title: "Fluke Slap",
        caption: "A clap across still blue",
        image: whale03,
      },
      {
        id: "whale-04",
        title: "Deep Blue",
        caption: "Immense and unhurried",
        image: whale04,
      },
      {
        id: "whale-06",
        title: "Evening Spout",
        caption: "Breath against a gold sky",
        image: whale06,
      },
      {
        id: "whale-08",
        title: "The Pod",
        caption: "Traveling together at dawn",
        image: whale08,
      },
      {
        id: "whale-09",
        title: "Standing Still",
        caption: "Resting in a column of sun",
        image: whale09,
      },
      {
        id: "whale-10",
        title: "Going Down",
        caption: "The last of the tail at dusk",
        image: whale10,
      },
      {
        id: "whale-13",
        title: "Sunlit Pair",
        caption: "Two giants in a turquoise cathedral",
        image: whale13,
      },
      {
        id: "whale-14",
        title: "Sunset Farewell",
        caption: "A fluke against the last light",
        image: whale14,
      },
    ],
  },
  {
    id: "hawaii-cats",
    title: "Cats of Hawaii",
    tagline: "Ten island cats among blooms, tikis, and turquoise water",
    cover: cat01,
    free: true,
    puzzles: [
      {
        id: "cat-01",
        title: "Hibiscus Kitten",
        caption: "A tiny face among coral blooms",
        image: cat01,
      },
      {
        id: "cat-03",
        title: "Plumeria Behind the Ear",
        caption: "Dressed for the evening",
        image: cat03,
      },
      {
        id: "cat-02",
        title: "Sunset Sand",
        caption: "Golden hour on the shoreline",
        image: cat02,
      },
      {
        id: "cat-06",
        title: "Little Surfer",
        caption: "Waiting for a gentle set",
        image: cat06,
      },
      {
        id: "cat-05",
        title: "Tiki Watch",
        caption: "Peeking around a carved guardian",
        image: cat05,
      },
      {
        id: "cat-07",
        title: "Two in a Basket",
        caption: "Cuddled up on the lanai",
        image: cat07,
      },
      {
        id: "cat-04",
        title: "Rattan Nap",
        caption: "Asleep among the monstera",
        image: cat04,
      },
      {
        id: "cat-08",
        title: "E Komo Mai",
        caption: "Orchids and an ocean view",
        image: cat08,
      },
      {
        id: "cat-09",
        title: "Bougainvillea",
        caption: "Magenta petals and green ferns",
        image: cat09,
      },
      {
        id: "cat-10",
        title: "Tide Pool",
        caption: "Curious on the lava rock",
        image: cat10,
      },
    ],
  },
  {
    id: "pineapples-of-hawaii",
    title: "Pineapples of Hawaii",
    tagline: "Thirteen golden island moments, from plantation house to palm-framed sunset",
    cover: pineapple05,
    free: true,
    puzzles: [
      {
        id: "pineapple-01",
        title: "Plantation House",
        caption: "Morning light through old glass",
        image: pineapple01,
      },
      {
        id: "pineapple-02",
        title: "Island Feast",
        caption: "Pineapple beside a Hawaiian plate",
        image: pineapple02,
      },
      {
        id: "pineapple-03",
        title: "Beach Cool",
        caption: "Sunglasses and white sand",
        image: pineapple03,
      },
      {
        id: "pineapple-04",
        title: "Waterfall Rest",
        caption: "Mist above black lava rock",
        image: pineapple04,
      },
      {
        id: "pineapple-05",
        title: "Palm Sunset",
        caption: "Glowing gold through the fronds",
        image: pineapple05,
      },
      {
        id: "pineapple-06",
        title: "Lanai Bloom",
        caption: "Hibiscus tucked in the crown",
        image: pineapple06,
      },
      {
        id: "pineapple-07",
        title: "Shore Break",
        caption: "Coconut drink and ukulele",
        image: pineapple07,
      },
      {
        id: "pineapple-08",
        title: "Tide Pool",
        caption: "Floating among coral and fish",
        image: pineapple08,
      },
      {
        id: "pineapple-09",
        title: "Market Day",
        caption: "Bananas, papayas, and orchids",
        image: pineapple09,
      },
      {
        id: "pineapple-10",
        title: "Rainforest Floor",
        caption: "Moss and bamboo",
        image: pineapple10,
      },
      {
        id: "pineapple-11",
        title: "Pineapple Sunset Cocktail",
        caption: "A golden island sipper for golden hour",
        image: pineapple11,
        recipe:
          "Muddle 4 pineapple chunks with 6 mint leaves and ½ oz lime juice.\nAdd 2 oz white rum, 1 oz pineapple juice, and ½ oz simple syrup.\nFill with ice and shake until cold.\nStrain into an ice-filled glass.\nTop with soda and garnish with pineapple and mint.",
      },
      {
        id: "pineapple-12",
        title: "Pineapple Upside-Down Cake",
        caption: "Caramelized rings over a soft golden crumb",
        image: pineapple12,
        recipe:
          "Melt ¼ cup butter in a 9-inch round cake pan.\nSprinkle with ½ cup brown sugar.\nArrange pineapple rings with cherries in the centers.\nWhisk 1½ cups flour, 1½ tsp baking powder, and ¼ tsp salt.\nCream ½ cup butter and ¾ cup sugar.\nBeat in 2 eggs, 1 tsp vanilla, and ½ cup milk.\nSpread batter over the pineapple.\nBake at 350°F for 40–45 minutes.\nCool 10 minutes, then invert onto a plate.",
      },
      {
        id: "pineapple-13",
        title: "Bamboo Forest",
        caption: "Sunlight through tall stalks and a golden visitor",
        image: pineapple13,
      },
    ],
  },


  {
    id: "four-seasons-maui",
    title: "Four Seasons Maui",
    tagline: "Wailea, as their photographers see it",
    cover: fsmResortCove.url,
    free: true,
    storybook: { owner: "Four Seasons Maui", plan: "white-label" },
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
        id: "fsm-05",
        title: "Warrior",
        caption: "Morning practice on the sand",
        image: fsmBeachYoga.url,
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
    ],

  },
  {
    id: "amys-art",
    title: "Amy's Art",
    tagline: "Hand-blown glass sea turtles made in Maui",
    cover: amy08Enhanced,
    coverZoom: 1.15,
    free: true,
    storybook: { owner: "Amy", plan: "personal" },
    puzzles: [
      { id: "amy-06", title: "Kuipo", caption: "An affectionate term for a loved one", image: amy02.url },
      { id: "amy-12", title: "Sweetheart", caption: "Pink embers dance in the light — this piece celebrates love", image: amy12.url },
      { id: "amy-08", title: "Akoni in Coral", caption: "Akoni means worthy and reminds you of your worth", image: amy08Enhanced },
      { id: "amy-05", title: "Kalele", caption: "Trust your dreams, they know the way", image: amy05Enhanced },
      { id: "amy-13", title: "Hana", caption: "Gold-plated glass turtle with a luminous blue shell", image: amy13Enhanced },
      { id: "amy-03", title: "Akoni Friends", caption: "Reminding you of your worthiness — but if you can't see it, don't forget your friends can", image: amy03Enhanced },
      { id: "amy-10", title: "Malama", caption: "Malama means protect what you love — your people, your planet and your peace", image: amy10.url },
      { id: "amy-02", title: "Mahalo Moon", caption: "Turquoise accented with green and gold crystal", image: amy06Enhanced },
      {
        id: "amy-11",
        title: "At the Torch",
        caption: "The artist at work in her studio",
        image: amy11Retouched,
        story: [
          "Amy WakingWolf is a Maui-based glass artisan, jewelry designer, ocean advocate, and storyteller whose work blends fine craftsmanship with a deep love for the natural world. Best known as the creator of The Honu Collection, she handcrafts collectible wearable signed and numbered sculptures inspired by Hawaii's sea turtles.",
          "Each piece is a reflection of her decades of artistic dedication and conservation work. Drawn to beauty, innovation, and meaningful connection, Amy is equally passionate about creating experiences that bring people together, whether through her art or imaginative projects like Pictaria, where memories become interactive stories.",
          "Her work is guided by a sense of wonder, a playful spirit, and the belief that the most meaningful creations don't just decorate our lives, they tell our stories.",
        ],
      },
      { id: "amy-01", title: "Mahalo: Gratitude", caption: "Apatite and tourmaline half moon necklace", image: amy01.url },

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
