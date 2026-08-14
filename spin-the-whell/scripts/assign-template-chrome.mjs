import { readFile, writeFile } from "node:fs/promises";

const dataPath = new URL("../src/data/templates/templates.json", import.meta.url);
const templates = JSON.parse(await readFile(dataPath, "utf8"));

const chromeByTemplate = {
  "europe-country-wheel": ["compass", "left", "compass", "map-pins"],
  "country-spin-the-wheel": ["compass", "right", "compass", "map-pins"],
  "nba-teams-spin-the-wheel": ["court", "center", "court", "scoreboard"],
  "nba-player-spin-the-wheel": ["court", "right", "court", "scoreboard"],
  "movie-spin-the-wheel": ["cinema", "bottom", "cinema", "premiere"],
  "games-spin-the-wheel": ["chevron", "right", "neon", "aurora"],
  "pokemon-spin-the-wheel": ["claw", "left", "neon", "aurora"],
  "pokemon-type-team-wheel": ["claw", "bottom", "neon", "aurora"],
  "raffle-wheel": ["jewel", "top", "classic", "classic"],
  "spin-the-wheel-yes-or-no": ["arrow", "center", "rose", "classic"],
  "color-spin-the-wheel": ["needle", "center", "ocean", "aurora"],
};

for (const template of templates) {
  const chrome = chromeByTemplate[template.addressBar];
  if (!chrome) continue;
  [
    template.pointerStyle,
    template.pointerPosition,
    template.rimStyle,
    template.lightsStyle,
  ] = chrome;
}

await writeFile(dataPath, `${JSON.stringify(templates, null, 2)}\n`);
console.log("Assigned themed chrome to templates.");
