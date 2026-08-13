import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicRoot = join(root, "public");
const dataPath = join(root, "src/data/templates/templates.json");

const sheets = [
  {
    template: "games-spin-the-wheel",
    source: "game-genres.png",
    folder: "game-scenes",
    columns: 4,
    rows: 4,
  },
  {
    template: "movie-spin-the-wheel",
    source: "movie-genres.png",
    folder: "movie-scenes",
    columns: 4,
    rows: 3,
  },
  {
    template: "pokemon-type-team-wheel",
    source: "pokemon-types.png",
    folder: "pokemon-type-scenes",
    columns: 3,
    rows: 6,
  },
];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function splitSheet(config, entries) {
  const source = join(publicRoot, "images/templates/source-sheets", config.source);
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Could not read ${source}`);

  const cellWidth = Math.floor(metadata.width / config.columns);
  const cellHeight = Math.floor(metadata.height / config.rows);
  const targetFolder = join(publicRoot, "images/templates/wheel-art", config.folder);
  await mkdir(targetFolder, { recursive: true });

  const results = [];
  for (let index = 0; index < entries.length; index += 1) {
    const column = index % config.columns;
    const row = Math.floor(index / config.columns);
    const file = `${slug(entries[index])}.webp`;
    const publicPath = `/images/templates/wheel-art/${config.folder}/${file}`;
    await sharp(source)
      .extract({
        left: column * cellWidth,
        top: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
      })
      .resize({ width: 512, height: 512, fit: "cover" })
      .webp({ quality: 84 })
      .toFile(join(targetFolder, file));
    results.push(publicPath);
  }
  return results;
}

const templates = JSON.parse(await readFile(dataPath, "utf8"));
for (const config of sheets) {
  const template = templates.find((item) => item.addressBar === config.template);
  if (!template) throw new Error(`Missing template ${config.template}`);
  if (template.entries.length !== config.columns * config.rows) {
    throw new Error(`${config.template} must contain ${config.columns * config.rows} entries`);
  }
  template.entryImages = await splitSheet(config, template.entries);
}

await mkdir(dirname(dataPath), { recursive: true });
await import("node:fs/promises").then(({ writeFile }) => (
  writeFile(dataPath, `${JSON.stringify(templates, null, 2)}\n`)
));

console.log("Prepared wheel-slice background scenes.");
