import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const dataPath = join(root, "src/data/templates/templates.json");
const publicRoot = join(root, "public");

const countryCodes = {
  Albania: "al", Andorra: "ad", Austria: "at", Belarus: "by", Belgium: "be",
  "Bosnia and Herzegovina": "ba", Bulgaria: "bg", Croatia: "hr", Czechia: "cz",
  Denmark: "dk", Estonia: "ee", Finland: "fi", France: "fr", Germany: "de",
  Greece: "gr", Hungary: "hu", Iceland: "is", Ireland: "ie", Italy: "it",
  Latvia: "lv", Liechtenstein: "li", Lithuania: "lt", Luxembourg: "lu", Malta: "mt",
  Moldova: "md", Monaco: "mc", Montenegro: "me", Netherlands: "nl",
  "North Macedonia": "mk", Norway: "no", Poland: "pl", Portugal: "pt", Romania: "ro",
  Russia: "ru", "San Marino": "sm", Serbia: "rs", Slovakia: "sk", Slovenia: "si",
  Spain: "es", Sweden: "se", Switzerland: "ch", Ukraine: "ua", "United Kingdom": "gb",
  "Vatican City": "va", Argentina: "ar", Brazil: "br", Canada: "ca", Mexico: "mx",
  "United States": "us", Egypt: "eg", Ghana: "gh", Kenya: "ke", Morocco: "ma",
  "South Africa": "za", China: "cn", India: "in", Indonesia: "id", Japan: "jp",
  "South Korea": "kr", Thailand: "th", Australia: "au", "New Zealand": "nz", Fiji: "fj",
};

const pokemonIds = {
  Pikachu: 25, Charizard: 6, Bulbasaur: 1, Squirtle: 7, Eevee: 133, Jigglypuff: 39,
  Meowth: 52, Psyduck: 54, Gengar: 94, Snorlax: 143, Mewtwo: 150, Mew: 151,
  Togepi: 175, Umbreon: 197, Scizor: 212, Gardevoir: 282, Lucario: 448, Garchomp: 445,
  Greninja: 658, Sylveon: 700, Decidueye: 724, Mimikyu: 778, Cinderace: 815, Dragapult: 887,
};

const nbaTeamIds = {
  "Atlanta Hawks": 1610612737, "Boston Celtics": 1610612738, "Brooklyn Nets": 1610612751,
  "Charlotte Hornets": 1610612766, "Chicago Bulls": 1610612741, "Cleveland Cavaliers": 1610612739,
  "Dallas Mavericks": 1610612742, "Denver Nuggets": 1610612743, "Detroit Pistons": 1610612765,
  "Golden State Warriors": 1610612744, "Houston Rockets": 1610612745, "Indiana Pacers": 1610612754,
  "LA Clippers": 1610612746, "Los Angeles Lakers": 1610612747, "Memphis Grizzlies": 1610612763,
  "Miami Heat": 1610612748, "Milwaukee Bucks": 1610612749, "Minnesota Timberwolves": 1610612750,
  "New Orleans Pelicans": 1610612740, "New York Knicks": 1610612752, "Oklahoma City Thunder": 1610612760,
  "Orlando Magic": 1610612753, "Philadelphia 76ers": 1610612755, "Phoenix Suns": 1610612756,
  "Portland Trail Blazers": 1610612757, "Sacramento Kings": 1610612758, "San Antonio Spurs": 1610612759,
  "Toronto Raptors": 1610612761, "Utah Jazz": 1610612762, "Washington Wizards": 1610612764,
};

const nbaPlayerIds = {
  "LeBron James": 2544, "Stephen Curry": 201939, "Kevin Durant": 201142, "Nikola Jokic": 203999,
  "Giannis Antetokounmpo": 203507, "Luka Doncic": 1629029, "Shai Gilgeous-Alexander": 1628983,
  "Jayson Tatum": 1628369, "Jalen Brunson": 1628973, "Anthony Edwards": 1630162,
  "Victor Wembanyama": 1641705, "Donovan Mitchell": 1628378, "Jaylen Brown": 1627759,
  "Kawhi Leonard": 202695, "Tyrese Maxey": 1630178, "Jamal Murray": 1627750,
  "Cade Cunningham": 1630595, "Chet Holmgren": 1631096,
};

const typeIcons = {
  Normal: 1, Fighting: 2, Flying: 3, Poison: 4, Ground: 5, Rock: 6, Bug: 7, Ghost: 8,
  Steel: 9, Fire: 10, Water: 11, Grass: 12, Electric: 13, Psychic: 14, Ice: 15,
  Dragon: 16, Dark: 17, Fairy: 18,
};

const stages = {
  "raffle-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Findings_Festival_2018.jpg/1280px-Findings_Festival_2018.jpg",
    file: "festival-stage.webp",
  },
  "spin-the-wheel-yes-or-no": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/East_Lothian_Landscape_%2C_I_went_down_to_the_crossroads_-_geograph.org.uk_-_7789915.jpg/1280px-East_Lothian_Landscape_%2C_I_went_down_to_the_crossroads_-_geograph.org.uk_-_7789915.jpg",
    file: "crossroads.webp",
  },
  "europe-country-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Europe_satellite_orthographic.jpg/1280px-Europe_satellite_orthographic.jpg",
    file: "europe-map.webp",
  },
  "country-spin-the-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Antique_World_Map_of_Continents_and_Oceans_1700_%28cropped%29.png/1280px-Antique_World_Map_of_Continents_and_Oceans_1700_%28cropped%29.png",
    file: "world-map.webp",
  },
  "color-spin-the-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/66/A_palette_with_a_spatula_and_paint_brushes.jpg",
    file: "paint-palette.webp",
  },
  "nba-teams-spin-the-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/AIS_Arena_interior%2C_January_2026_01.jpg/1280px-AIS_Arena_interior%2C_January_2026_01.jpg",
    file: "basketball-arena.webp",
  },
  "nba-player-spin-the-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/AIS_Arena_interior%2C_January_2026_01.jpg/1280px-AIS_Arena_interior%2C_January_2026_01.jpg",
    file: "basketball-arena.webp",
  },
  "games-spin-the-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Game_Controllers.jpg",
    file: "game-controllers.webp",
  },
  "movie-spin-the-wheel": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Movie_theater_seats_%28Unsplash%29.jpg",
    file: "movie-theater.webp",
  },
};

const gameCoverIds = {
  Action: 853770,
  Adventure: 292030,
  Education: 619150,
  Entertainment: 1222670,
  "Obby & Platformer": 504230,
  "Party & Casual": 880940,
  Puzzle: 620,
  RPG: 1086940,
  "Roleplay & Avatar Sim": 413150,
  Shooter: 730,
  Shopping: 2670630,
  Simulation: 227300,
  Social: 438100,
  "Sports & Racing": 1551360,
  Strategy: 289070,
  Survival: 322330,
};

const movieCoverUrls = {
  Action: "https://lumiere-a.akamaihd.net/v1/images/p_avengersendgame_19751_e14a0104.jpeg?region=0%2C0%2C540%2C810",
  Comedy: "https://lumiere-a.akamaihd.net/v1/images/p_cruella_21672_ba40c762.jpeg?region=0%2C0%2C540%2C810",
  Drama: "https://lumiere-a.akamaihd.net/v1/images/p_rememberthetitans_19871_35d7e7fd.jpeg?region=0%2C0%2C540%2C810",
  Horror: "https://lumiere-a.akamaihd.net/v1/images/p_disneymovies_hauntedmansion_poster_rebrand_e6c61d0d.jpeg?region=0%2C0%2C540%2C810",
  Thriller: "https://lumiere-a.akamaihd.net/v1/images/p_thenightmarebeforechristmas_2428_acaebc42.jpeg?region=0%2C0%2C540%2C810",
  "Sci-Fi": "https://lumiere-a.akamaihd.net/v1/images/p_disneyplusoriginals_avatar_thewayofwater_poster_rebra_fa08636d.jpeg?region=0%2C0%2C540%2C810",
  Fantasy: "https://lumiere-a.akamaihd.net/v1/images/p_piratesofthecaribbean_thecurseoftheblackpearl_19642_d1ba8e66.jpeg?region=0%2C0%2C540%2C810",
  Animation: "https://lumiere-a.akamaihd.net/v1/images/p_toystory_19639_424d94a0.jpeg?region=0%2C0%2C540%2C810",
  Documentary: "https://lumiere-a.akamaihd.net/v1/images/p_soul_disneyplus_v2_20907_764da65d.jpeg?region=0%2C0%2C540%2C810",
  Mystery: "https://lumiere-a.akamaihd.net/v1/images/p_nationaltreasure_19873_2e5da612.jpeg?region=0%2C0%2C540%2C810",
  Romance: "https://lumiere-a.akamaihd.net/v1/images/pt_coco_31b33206.jpeg?region=0%2C0%2C300%2C450",
  Family: "https://lumiere-a.akamaihd.net/v1/images/p_thelionking_19752_1_0b9de87b.jpeg?region=0%2C0%2C540%2C810",
};

const pokemonStageUrl = "https://gaming-cdn.com/images/products/16028/screenshot/pokemon-legends-z-a-switch-nintendo-eshop-wallpaper-1.jpg?v=1760611596";

async function download(url, output, { width = 360, height = 360, fit = "contain" } = {}) {
  try {
    await readFile(output);
    return;
  } catch {
    // Download missing assets only so a retry resumes instead of starting over.
  }
  const requestUrl = url.startsWith("https://upload.wikimedia.org/") && !url.endsWith("/9/9f/Game_Controllers.jpg")
    ? `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${Math.max(width, 1280)}`
    : url;
  let response;
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      response = await fetch(requestUrl, { headers: { "User-Agent": "SpinTheWheel template artwork preparation" } });
      if (response.ok) break;
      lastError = new Error(`${response.status} ${url}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 650));
  }
  if (!response?.ok) throw lastError ?? new Error(`Could not download ${url}`);
  let buffer;
  let bufferError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      buffer = Buffer.from(await response.arrayBuffer());
      break;
    } catch (error) {
      bufferError = error;
      response = await fetch(requestUrl, { headers: { "User-Agent": "SpinTheWheel template artwork preparation" } });
    }
  }
  if (!buffer) throw bufferError ?? new Error(`Could not read ${url}`);
  await mkdir(dirname(output), { recursive: true });
  await sharp(buffer)
    .resize({ width, height, fit, withoutEnlargement: true, background: { r: 15, g: 23, b: 42, alpha: 0 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(output);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function mapDownloads(entries, urlFor, folder) {
  const results = [];
  for (const entry of entries) {
    const file = `${slug(entry)}.webp`;
    const publicPath = `/images/templates/wheel-art/${folder}/${file}`;
    await download(urlFor(entry), join(publicRoot, publicPath), { width: 320, height: 320 });
    results.push(publicPath);
  }
  return results;
}

const templates = JSON.parse(await readFile(dataPath, "utf8"));
for (const template of templates) {
  const stage = stages[template.addressBar];
  if (stage) {
    const publicPath = `/images/templates/stages/${stage.file}`;
    const output = join(publicRoot, publicPath);
    try {
      await readFile(output);
    } catch {
      await download(stage.url, output, { width: 1600, height: 900, fit: "cover" });
    }
    template.stageImage = publicPath;
  }

  if (["pokemon-spin-the-wheel", "pokemon-type-team-wheel"].includes(template.addressBar)) {
    const publicPath = "/images/templates/stages/pokemon-lumiose.webp";
    await download(pokemonStageUrl, join(publicRoot, publicPath), { width: 1600, height: 900, fit: "cover" });
    template.stageImage = publicPath;
  }

  if (["europe-country-wheel", "country-spin-the-wheel"].includes(template.addressBar)) {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => `https://flagcdn.com/w320/${countryCodes[entry]}.png`,
      "flags",
    );
  } else if (template.addressBar === "pokemon-spin-the-wheel") {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonIds[entry]}.png`,
      "pokemon",
    );
  } else if (template.addressBar === "pokemon-type-team-wheel") {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${typeIcons[entry]}.png`,
      "pokemon-types",
    );
  } else if (template.addressBar === "nba-teams-spin-the-wheel") {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => `https://cdn.nba.com/logos/nba/${nbaTeamIds[entry]}/global/L/logo.svg`,
      "nba-teams",
    );
  } else if (template.addressBar === "nba-player-spin-the-wheel") {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaPlayerIds[entry]}.png`,
      "nba-players",
    );
  } else if (template.addressBar === "games-spin-the-wheel") {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => `https://cdn.akamai.steamstatic.com/steam/apps/${gameCoverIds[entry]}/header.jpg`,
      "game-covers",
    );
  } else if (template.addressBar === "movie-spin-the-wheel") {
    template.entryImages = await mapDownloads(
      template.entries,
      (entry) => movieCoverUrls[entry],
      "movie-covers",
    );
  }
}

await writeFile(dataPath, `${JSON.stringify(templates, null, 2)}\n`, "utf8");
console.log(`Prepared artwork for ${templates.length} templates.`);
