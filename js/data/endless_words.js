// Typing Quest - Endless Mode Vocabulary Pool
// A massive, diverse collection of 600+ English words spanning multiple categories,
// everyday verbs, adjectives, science, nature, technology, culture, and daily life.

export const ENDLESS_WORD_POOL = [
  // --- Animals & Creatures ---
  "dog", "cat", "lion", "tiger", "bear", "wolf", "fox", "deer", "horse", "zebra",
  "rabbit", "monkey", "panda", "koala", "elephant", "giraffe", "camel", "leopard", "cheetah", "kangaroo",
  "dolphin", "whale", "shark", "seal", "otter", "penguin", "eagle", "hawk", "falcon", "owl",
  "parrot", "flamingo", "peacock", "swan", "turtle", "lizard", "chameleon", "crocodile", "alligator", "snake",
  "badger", "beaver", "raccoon", "hedgehog", "gorilla", "chimpanzee", "octopus", "jellyfish", "lobster", "crab",
  "dragonfly", "butterfly", "beetle", "mantis", "sparrow", "seagull", "pelican", "hummingbird", "panther", "rhino",
  "hippo", "walrus", "squid", "starfish", "seahorse", "stingray", "hamster", "squirrel", "platypus", "buffalo",

  // --- Colors, Shades & Gems ---
  "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white",
  "gray", "silver", "gold", "bronze", "cyan", "magenta", "violet", "indigo", "teal", "lime",
  "ruby", "amber", "emerald", "sapphire", "crimson", "scarlet", "turquoise", "lavender", "maroon", "coral",
  "olive", "beige", "peach", "charcoal", "ivory", "copper", "mint", "plum", "navy", "aqua",
  "topaz", "garnet", "crystal", "diamond", "obsidian", "jade", "platinum", "amethyst", "pearl", "onyx",

  // --- Objects, Tools & Daily Items ---
  "chair", "table", "desk", "sofa", "lamp", "mirror", "clock", "window", "door", "pillow",
  "blanket", "curtain", "bottle", "glass", "cup", "plate", "spoon", "fork", "knife", "teapot",
  "book", "notebook", "pencil", "eraser", "ruler", "scissors", "backpack", "wallet", "umbrella", "lantern",
  "camera", "watch", "glasses", "compass", "telescope", "hammer", "wrench", "flashlight", "candle", "bucket",
  "guitar", "keyboard", "headphones", "speaker", "bicycle", "helmet", "ladder", "basket", "cushion", "padlock",
  "magnet", "needle", "thread", "battery", "canteen", "anvil", "whistle", "telescope", "microscope", "briefcase",

  // --- Food, Treats & Drinks ---
  "apple", "banana", "orange", "mango", "grape", "lemon", "peach", "strawberry", "blueberry", "pineapple",
  "watermelon", "papaya", "avocado", "coconut", "cherry", "pizza", "burger", "sandwich", "pasta", "spaghetti",
  "sushi", "ramen", "curry", "steak", "chicken", "salad", "soup", "bread", "croissant", "toast",
  "butter", "cheese", "pancake", "waffle", "cookie", "cake", "muffin", "chocolate", "icecream", "donut",
  "coffee", "tea", "milk", "juice", "lemonade", "smoothie", "honey", "noodle", "popcorn", "pudding",
  "lasagna", "biscuit", "dumpling", "omurice", "pretzel", "brownie", "yogurt", "cinnamon", "vanilla", "caramel",

  // --- Nature, Space & Geography ---
  "sun", "moon", "star", "planet", "earth", "mars", "jupiter", "saturn", "uranus", "neptune",
  "comet", "asteroid", "meteor", "galaxy", "nebula", "cosmos", "orbit", "gravity", "eclipse", "satellite",
  "rocket", "telescope", "astronaut", "spaceship", "universe", "aurora", "volcano", "mountain", "valley", "canyon",
  "ocean", "river", "waterfall", "island", "forest", "jungle", "desert", "glacier", "horizon", "rainbow",
  "thunder", "lightning", "hurricane", "tornado", "blizzard", "tsunami", "meadow", "cave", "geyser", "crater",
  "oasis", "plateau", "breeze", "equator", "atmosphere", "solstice", "constellation", "tide", "stream", "summit",

  // --- Technology, Science & Computing ---
  "computer", "laptop", "monitor", "mouse", "screen", "tablet", "phone", "network", "server", "router",
  "cloud", "database", "software", "hardware", "firmware", "browser", "program", "coding", "python", "script",
  "developer", "algorithm", "variable", "function", "compiler", "security", "firewall", "encryption", "password", "storage",
  "memory", "processor", "graphics", "terminal", "console", "wireless", "bluetooth", "digital", "pixel", "virtual",
  "robot", "sensor", "quantum", "interface", "gadget", "engine", "circuit", "binary", "cyber", "vector",
  "matrix", "protocol", "bandwidth", "cache", "syntax", "socket", "kernel", "module", "debug", "compile",

  // --- Actions & Verbs ---
  "run", "jump", "sprint", "climb", "swim", "fly", "glide", "dash", "leap", "bounce",
  "build", "craft", "design", "create", "explore", "discover", "invent", "launch", "travel", "navigate",
  "sing", "dance", "laugh", "smile", "dream", "listen", "ponder", "wonder", "reflect", "inspire",
  "strike", "shield", "vanquish", "conquer", "defend", "rescue", "ignite", "channel", "unravel", "balance",
  "harvest", "gather", "cultivate", "flourish", "illuminate", "captivate", "transform", "resonate", "accelerate", "radiate",

  // --- Descriptive Adjectives ---
  "swift", "brave", "silent", "gentle", "fierce", "calm", "bright", "vibrant", "radiant", "luminous",
  "ancient", "modern", "golden", "crystal", "frozen", "blazing", "serene", "mystic", "epic", "cosmic",
  "nimble", "agile", "mighty", "humble", "stellar", "boundless", "infinite", "harmonic", "dynamic", "resilient",
  "curious", "daring", "splendid", "vivid", "tranquil", "majestic", "dazzling", "fearless", "endless", "limitless",

  // --- Travel, Places & Everyday Life ---
  "castle", "palace", "village", "city", "bridge", "harbor", "airport", "station", "market", "library",
  "museum", "theatre", "stadium", "garden", "fountain", "statue", "monument", "tower", "pyramid", "temple",
  "journey", "adventure", "voyage", "expedition", "safari", "quest", "horizon", "pathway", "highway", "railway",
  "compass", "backpack", "passport", "luggage", "ticket", "voyager", "pioneer", "wanderer", "explorer", "captain"
];

// Deduplicate and sanitize pool
const wordSet = new Set();
export const CLEAN_ENDLESS_POOL = [];
for (const w of ENDLESS_WORD_POOL) {
  const clean = w.trim().toLowerCase();
  if (clean.length >= 2 && !wordSet.has(clean)) {
    wordSet.add(clean);
    CLEAN_ENDLESS_POOL.push(clean);
  }
}

/**
 * Get a random endless word, ensuring no immediate consecutive duplicate.
 * @param {string} [previousWord]
 * @returns {string}
 */
export function getRandomEndlessWord(previousWord = "") {
  if (CLEAN_ENDLESS_POOL.length === 0) return "endless";
  if (CLEAN_ENDLESS_POOL.length === 1) return CLEAN_ENDLESS_POOL[0];

  let pick = CLEAN_ENDLESS_POOL[Math.floor(Math.random() * CLEAN_ENDLESS_POOL.length)];
  let attempts = 0;
  const prevNorm = previousWord ? previousWord.toLowerCase().trim() : "";
  while (pick === prevNorm && attempts < 15) {
    pick = CLEAN_ENDLESS_POOL[Math.floor(Math.random() * CLEAN_ENDLESS_POOL.length)];
    attempts++;
  }
  return pick;
}

// Backward-compatibility shims
export const ENDLESS_CATEGORIES = {
  all: {
    id: "all",
    name: "Endless Pool",
    nameTh: "โหมดสุ่มคำศัพท์",
    icon: "♾️",
    description: "Diverse random vocabulary across all topics",
    words: CLEAN_ENDLESS_POOL
  }
};

export function getEndlessCategory() {
  return ENDLESS_CATEGORIES.all;
}

export function getRandomCategoryWord(categoryId, previousWord = "") {
  return getRandomEndlessWord(previousWord);
}
