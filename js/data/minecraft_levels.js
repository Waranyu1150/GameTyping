// Typing Chicken - Minecraft Mode Dataset (20 Levels)
// Essential Minecraft items, blocks, mobs, and tools carefully balanced across 5 difficulty tiers.

export const MINECRAFT_LEVELS = [
  // ==========================================
  // TIER 1: BEGINNER SURVIVAL (Levels 1-4, 10 words, 3-6 letters)
  // ==========================================
  {
    id: 1,
    difficulty: "Beginner",
    category: "Basic Resources",
    timeLimit: 60,
    words: [
      "dirt",
      "wood",
      "sand",
      "gravel",
      "clay",
      "stick",
      "leaves",
      "seeds",
      "coal",
      "vine"
    ]
  },
  {
    id: 2,
    difficulty: "Beginner",
    category: "First Tools & Housing",
    timeLimit: 60,
    words: [
      "torch",
      "bed",
      "shovel",
      "axe",
      "hoe",
      "door",
      "gate",
      "boat",
      "sign",
      "bowl"
    ]
  },
  {
    id: 3,
    difficulty: "Beginner",
    category: "Food & Farming",
    timeLimit: 60,
    words: [
      "wheat",
      "bread",
      "apple",
      "beef",
      "porkchop",
      "mutton",
      "chicken",
      "fish",
      "egg",
      "milk"
    ]
  },
  {
    id: 4,
    difficulty: "Beginner",
    category: "Passive Wildlife",
    timeLimit: 60,
    words: [
      "cow",
      "pig",
      "sheep",
      "wolf",
      "cat",
      "horse",
      "fox",
      "frog",
      "bee",
      "bat"
    ]
  },

  // ==========================================
  // TIER 2: EXPLORATION & CRAFTING (Levels 5-8, 12 words, 4-8 letters)
  // ==========================================
  {
    id: 5,
    difficulty: "Easy",
    category: "Camp & Construction",
    timeLimit: 60,
    words: [
      "cobblestone",
      "stone",
      "craftingtable",
      "furnace",
      "chest",
      "planks",
      "brick",
      "glass",
      "fence",
      "stairs",
      "ladder",
      "slab"
    ]
  },
  {
    id: 6,
    difficulty: "Easy",
    category: "Iron Age & Harvest",
    timeLimit: 60,
    words: [
      "ironingot",
      "copperingot",
      "bucket",
      "shears",
      "flint",
      "steak",
      "carrot",
      "potato",
      "melon",
      "pumpkin",
      "sugarcane",
      "charcoal"
    ]
  },
  {
    id: 7,
    difficulty: "Easy",
    category: "Combat Essentials",
    timeLimit: 60,
    words: [
      "sword",
      "shield",
      "bow",
      "arrow",
      "crossbow",
      "helmet",
      "chestplate",
      "leggings",
      "boots",
      "ironarmor",
      "leatherarmor",
      "chainmail"
    ]
  },
  {
    id: 8,
    difficulty: "Easy",
    category: "Overworld Monsters",
    timeLimit: 60,
    words: [
      "zombie",
      "skeleton",
      "creeper",
      "spider",
      "enderman",
      "slime",
      "witch",
      "pillager",
      "drowned",
      "phantom",
      "husk",
      "stray"
    ]
  },

  // ==========================================
  // TIER 3: MINING & REDSTONE (Levels 9-12, 14 words, 5-10 letters)
  // ==========================================
  {
    id: 9,
    difficulty: "Intermediate",
    category: "Precious Minerals & Deep Caves",
    timeLimit: 60,
    words: [
      "diamond",
      "emerald",
      "rawiron",
      "rawgold",
      "lapislazuli",
      "amethyst",
      "deepslate",
      "diorite",
      "granite",
      "andesite",
      "tuff",
      "calcite",
      "dripstone",
      "bedrock"
    ]
  },
  {
    id: 10,
    difficulty: "Intermediate",
    category: "Specialized Workstations",
    timeLimit: 60,
    words: [
      "anvil",
      "grindstone",
      "smithingtable",
      "smoker",
      "blastfurnace",
      "cartographytable",
      "fletchingtable",
      "loom",
      "stonecutter",
      "campfire",
      "barrel",
      "composter",
      "lectern",
      "cauldron"
    ]
  },
  {
    id: 11,
    difficulty: "Intermediate",
    category: "Redstone Mechanisms",
    timeLimit: 60,
    words: [
      "redstone",
      "redstonetorch",
      "repeater",
      "comparator",
      "observer",
      "piston",
      "stickypiston",
      "dispenser",
      "dropper",
      "hopper",
      "lever",
      "daylightsensor",
      "tripwire",
      "trappedchest"
    ]
  },
  {
    id: 12,
    difficulty: "Intermediate",
    category: "Transportation & Exploration",
    timeLimit: 60,
    words: [
      "minecart",
      "rail",
      "poweredrail",
      "detectorrail",
      "activatorrail",
      "saddle",
      "compass",
      "clock",
      "spyglass",
      "lead",
      "bundle",
      "bell",
      "jukebox",
      "fireworkrocket"
    ]
  },

  // ==========================================
  // TIER 4: THE NETHER & ALCHEMY (Levels 13-16, 16 words, 6-12 letters)
  // ==========================================
  {
    id: 13,
    difficulty: "Advanced",
    category: "Nether Portal & Terrain",
    timeLimit: 60,
    words: [
      "obsidian",
      "flintandsteel",
      "netherrack",
      "soulsand",
      "soulsoil",
      "basalt",
      "blackstone",
      "glowstone",
      "cryingobsidian",
      "shroomlight",
      "warpedstem",
      "crimsonstem",
      "ancientdebris",
      "netherquartz",
      "magmablock",
      "boneblock"
    ]
  },
  {
    id: 14,
    difficulty: "Advanced",
    category: "Nether Stronghold & Inhabitants",
    timeLimit: 60,
    words: [
      "blazerod",
      "ghasttear",
      "magmacream",
      "netherwart",
      "blaze",
      "ghast",
      "piglin",
      "hoglin",
      "strider",
      "witherskeleton",
      "goldnugget",
      "respawnanchor",
      "lodestone",
      "netherbrick",
      "crimsonnylium",
      "warpednylium"
    ]
  },
  {
    id: 15,
    difficulty: "Advanced",
    category: "Alchemy & Brewing",
    timeLimit: 60,
    words: [
      "brewingstand",
      "glassbottle",
      "waterbottle",
      "potion",
      "splashpotion",
      "lingeringpotion",
      "dragonsbreath",
      "glisteringmelon",
      "goldenapple",
      "honeybottle",
      "rabbitfoot",
      "pufferfish",
      "fermentedeye",
      "awkwardpotion",
      "blazepowder",
      "gunpowder"
    ]
  },
  {
    id: 16,
    difficulty: "Advanced",
    category: "Enchanting & Ocean Treasures",
    timeLimit: 60,
    words: [
      "enchantingtable",
      "bookshelf",
      "enchantedbook",
      "totemofundying",
      "heartofthesea",
      "conduit",
      "nautilusshell",
      "trident",
      "riptide",
      "channeling",
      "impaling",
      "unbreaking",
      "mending",
      "sharpness",
      "prismarine",
      "sponge"
    ]
  },

  // ==========================================
  // TIER 5: THE END & MASTER GEAR (Levels 17-20, 18 words, 6-14 letters)
  // ==========================================
  {
    id: 17,
    difficulty: "Master",
    category: "Stronghold & The End Realm",
    timeLimit: 60,
    words: [
      "enderpearl",
      "eyeofender",
      "endportalframe",
      "silverfish",
      "infestedstone",
      "ironbars",
      "chiseledstone",
      "mossystone",
      "spawner",
      "nametag",
      "diamondhorsearmor",
      "goldenhorsearmor",
      "musicdisc",
      "pigstep",
      "endstone",
      "endstonebricks",
      "endrod",
      "enchantedgoldenapple"
    ]
  },
  {
    id: 18,
    difficulty: "Master",
    category: "Dragon Fight & Void Cities",
    timeLimit: 60,
    words: [
      "endcrystal",
      "enderdragon",
      "dragonegg",
      "dragonhead",
      "enderman",
      "endermite",
      "endgateway",
      "endportal",
      "purpurblock",
      "purpurpillar",
      "purpurstairs",
      "purpurslab",
      "chorusfruit",
      "chorusflower",
      "chorusplant",
      "poppedchorus",
      "obsidianpillar",
      "spectralarrow"
    ]
  },
  {
    id: 19,
    difficulty: "Master",
    category: "Treasures of the Void & Deep Dark",
    timeLimit: 60,
    words: [
      "elytra",
      "shulkerbox",
      "shulkershell",
      "shulker",
      "netherstar",
      "wither",
      "witherrose",
      "beacon",
      "echoshard",
      "warden",
      "sculkcatalyst",
      "sculksensor",
      "sculkshrieker",
      "sculkvein",
      "recoverycompass",
      "discrelic",
      "heavycore",
      "breeze"
    ]
  },
  {
    id: 20,
    difficulty: "Master",
    category: "Netherite Mastery & Ultimate Enchants",
    timeLimit: 60,
    words: [
      "netherite",
      "netheriteingot",
      "netheritescrap",
      "netheritesword",
      "netheritepickaxe",
      "netheriteaxe",
      "netheriteshovel",
      "netheritehoe",
      "netheritehelmet",
      "netheritechestplate",
      "netheriteleggings",
      "netheriteboots",
      "silktouch",
      "fortune",
      "infinity",
      "efficiency",
      "protection",
      "featherfalling"
    ]
  }
];

export const TOTAL_MINECRAFT_LEVELS = MINECRAFT_LEVELS.length; // 20

export function getMinecraftLevel(id) {
  const numId = parseInt(id, 10);
  return MINECRAFT_LEVELS.find(lvl => lvl.id === numId) || null;
}