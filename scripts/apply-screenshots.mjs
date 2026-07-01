// scripts/apply-screenshots.mjs
// After scripts/screenshot-vendors.mjs has produced webps and a run log,
// write vendor.screenshots[] into src/data/vendors.json for the slugs that succeeded.
//
// - Reads scripts/config/vendor-screenshots.json for alt/caption/claim metadata.
// - Reads scripts/logs/screenshot-run-*.json (latest) to know which captures succeeded.
// - Only writes entries whose webp file actually exists on disk.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";

const VENDORS_PATHS = [
  "src/data/vendors.json",
  "src/data/vendors-normalized.json",
];
const CONFIG_PATH = "scripts/config/vendor-screenshots.json";
const LOG_DIR = "scripts/logs";
const IMG_DIR = "public/images/vendors";

const slugify = (n) => n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

// Source of truth = file presence in public/images/vendors. Captures from any prior run count.

function buildShots(vendor) {
  const slug = slugify(vendor.name);
  const cfg = config[slug];
  if (!cfg) return null;
  const shots = [];
  cfg.forEach((entry, i) => {
    const filename = `${slug}-${i + 1}.webp`;
    if (!existsSync(`${IMG_DIR}/${filename}`)) return;
    shots.push({
      src: `/images/vendors/${filename}`,
      alt: entry.alt,
      caption: entry.caption,
      claim: entry.claim,
    });
  });
  return shots;
}

for (const path of VENDORS_PATHS) {
  if (!existsSync(path)) continue;
  const data = JSON.parse(readFileSync(path, "utf8"));
  let updatedCount = 0;
  let totalShots = 0;
  for (const vendor of data.vendors) {
    const shots = buildShots(vendor);
    if (shots && shots.length > 0) {
      vendor.screenshots = shots;
      updatedCount++;
      totalShots += shots.length;
    } else if (vendor.screenshots) {
      delete vendor.screenshots;
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`${path}: ${updatedCount} vendors, ${totalShots} screenshots`);
}
