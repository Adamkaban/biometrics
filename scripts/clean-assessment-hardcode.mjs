#!/usr/bin/env node
/**
 * Detect hardcoded pricing / trial / founded-year numbers inside Assessment MDX bodies.
 *
 * Rules:
 *  - MDX body content (below --- frontmatter fence) must not hardcode:
 *      * currency+digit: $1.25, €0.55, £250
 *      * trial durations: "14 days", "500 verifications", "500 free checks"
 *      * founded years: "founded in 2015", "since 2020"
 *  - Frontmatter (between --- fences) is allowed to hold structured verdict/metadata.
 *
 * Assessments that fail this check must be rewritten to be number-free — cards + sidebar
 * pull the numbers from vendors-normalized.json.
 *
 * Reports findings to scripts/reports/assessment-hardcode.md. Exit code 1 when findings
 * exist so a build gate can wire it in.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIR = join(ROOT, "src/content/assessments");
const REPORT_DIR = join(ROOT, "scripts/reports");
const REPORT = join(REPORT_DIR, "assessment-hardcode.md");

const PATTERNS = [
  { name: "currency+digit", rx: /(?<![A-Za-z])[\$€£]\s?\d/g },
  { name: "trial-duration-days", rx: /\b\d+[\s-]?days?\s+(free\s+)?(trial|check)/gi },
  { name: "trial-count-verifications", rx: /\b\d+\s+(free\s+)?(verifications?|checks?)\b/gi },
  { name: "founded-year", rx: /\bfounded\s+(in\s+)?\d{4}\b/gi },
  { name: "since-year", rx: /\bsince\s+(19|20)\d{2}\b/gi },
];

function splitFrontmatter(text) {
  if (!text.startsWith("---")) return { frontmatter: "", body: text };
  const fenceEnd = text.indexOf("\n---", 3);
  if (fenceEnd === -1) return { frontmatter: "", body: text };
  return {
    frontmatter: text.slice(0, fenceEnd + 4),
    body: text.slice(fenceEnd + 4),
  };
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();

const findings = [];
let totalMatches = 0;

for (const file of files) {
  const full = join(DIR, file);
  const text = readFileSync(full, "utf-8");
  const { body } = splitFrontmatter(text);
  const lines = body.split("\n");
  const fileFindings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { name, rx } of PATTERNS) {
      const matches = line.match(rx);
      if (matches) {
        for (const m of matches) {
          fileFindings.push({ line: i + 1, pattern: name, match: m, context: line.trim().slice(0, 120) });
          totalMatches++;
        }
      }
    }
  }

  if (fileFindings.length > 0) {
    findings.push({ file, matches: fileFindings });
  }
}

mkdirSync(REPORT_DIR, { recursive: true });
const lines = [];
lines.push(`# Assessment MDX Hardcode Detection`);
lines.push(``);
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(``);
lines.push(`- Files scanned: ${files.length}`);
lines.push(`- Files with hardcoded numbers: ${findings.length}`);
lines.push(`- Total matches: ${totalMatches}`);
lines.push(``);
lines.push(`## Findings`);
lines.push(``);

for (const f of findings) {
  lines.push(`### ${f.file}`);
  lines.push(``);
  lines.push(`| Line | Pattern | Match | Context |`);
  lines.push(`|------|---------|-------|---------|`);
  for (const m of f.matches) {
    const ctx = m.context.replace(/\|/g, "\\|");
    lines.push(`| ${m.line} | ${m.pattern} | \`${m.match}\` | ${ctx} |`);
  }
  lines.push(``);
}

writeFileSync(REPORT, lines.join("\n"));
console.log(`Scanned ${files.length} assessment MDX files.`);
console.log(`  Files with hardcoded numbers: ${findings.length}`);
console.log(`  Total matches: ${totalMatches}`);
console.log(`  Report: scripts/reports/assessment-hardcode.md`);
if (totalMatches > 0) {
  process.exit(1);
}
