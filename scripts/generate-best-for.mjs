/**
 * Generate best_for + avoid_if fields for all vendors using Claude API.
 *
 * Run:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-best-for.mjs
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-best-for.mjs --dry
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-best-for.mjs --dry --vendor veriff
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-best-for.mjs --vendor veriff
 *
 * Flags:
 *   --dry        Print output without writing to disk
 *   --vendor <slug>  Process only one vendor (for testing)
 *   --force      Re-generate even if best_for already set
 *
 * Creates timestamped backup before writing.
 * Skips vendors where best_for already set (idempotent).
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");
const NORMALIZED_PATH = resolve(ROOT, "src/data/vendors-normalized.json");

const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const vendorFlag = process.argv.indexOf("--vendor");
const ONLY_VENDOR = vendorFlag !== -1 ? process.argv[vendorFlag + 1] : null;

// ── Validate API key ──────────────────────────────────────────────────────────
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
  console.error("Run: ANTHROPIC_API_KEY=sk-... node scripts/generate-best-for.mjs");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

// ── Build prompt for a vendor ─────────────────────────────────────────────────
function buildPrompt(v) {
  const lines = [
    `Vendor: ${v.name}`,
    `Tagline: ${v.tagline || "not provided"}`,
    `Market position: ${v.value_tier || "unknown"} (budget/mid/enterprise)`,
    `Categories: ${v.categories?.join(", ") || "not specified"}`,
    `Capabilities: ${v.verification_types?.join(", ") || "not specified"}`,
  ];

  const industries = v.website_data?.target_industries?.join(", ");
  if (industries) lines.push(`Target industries: ${industries}`);

  const useCases = v.website_data?.use_cases?.join(", ");
  if (useCases) lines.push(`Use cases: ${useCases}`);

  lines.push("");
  lines.push("Write TWO descriptions for this vendor:");
  lines.push(
    'BEST_FOR: The ideal buyer. 40-75 characters. Start with a buyer type ' +
    '(fintechs, crypto exchanges, enterprise banks, healthcare orgs, etc.). ' +
    'Include their specific need or key differentiator. Be specific, not generic.'
  );
  lines.push(
    'AVOID_IF: Honest limitation. 40-75 characters. Who should look elsewhere and why.'
  );
  lines.push("");
  lines.push('Output valid JSON only: {"best_for": "...", "avoid_if": "..."}');
  lines.push("");
  lines.push('Good BEST_FOR: "Fintechs needing automated KYC with global document coverage"');
  lines.push('Bad BEST_FOR: "Companies needing identity verification" (too generic — reject this)');

  return lines.join("\n");
}

// ── Call Claude API ──────────────────────────────────────────────────────────
async function generateForVendor(vendor) {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system:
      "You write concise buyer-focused descriptions for B2B software vendor cards on a " +
      "biometric/identity verification comparison site. Audience: IT directors, security " +
      "officers, compliance teams evaluating KYC/AML/biometric software. Always output " +
      "valid JSON only — no markdown, no extra text.",
    messages: [{ role: "user", content: buildPrompt(vendor) }],
  });

  const raw = message.content[0]?.text?.trim() ?? "";

  // Strip markdown code fences if model adds them despite instructions
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();

  const parsed = JSON.parse(cleaned);

  if (typeof parsed.best_for !== "string" || typeof parsed.avoid_if !== "string") {
    throw new Error(`Unexpected shape: ${cleaned}`);
  }

  return {
    best_for: parsed.best_for.slice(0, 100),
    avoid_if: parsed.avoid_if.slice(0, 100),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const data = JSON.parse(readFileSync(NORMALIZED_PATH, "utf-8"));
  const vendors = data.vendors;

  let targets = vendors;
  if (ONLY_VENDOR) {
    targets = vendors.filter((v) => v.slug === ONLY_VENDOR);
    if (targets.length === 0) {
      console.error(`Vendor with slug "${ONLY_VENDOR}" not found.`);
      console.error("Available slugs:", vendors.map((v) => v.slug).join(", "));
      process.exit(1);
    }
  }

  const toProcess = FORCE
    ? targets
    : targets.filter((v) => !v.best_for);

  console.log(
    `Processing ${toProcess.length} of ${targets.length} vendors` +
    (ONLY_VENDOR ? ` (filtered to: ${ONLY_VENDOR})` : "") +
    (DRY ? " [DRY RUN]" : "") +
    (FORCE ? " [FORCE]" : "")
  );

  if (toProcess.length === 0) {
    console.log("Nothing to do — all vendors already have best_for. Use --force to regenerate.");
    return;
  }

  let succeeded = 0;
  let failed = 0;

  for (const vendor of toProcess) {
    process.stdout.write(`  ${vendor.slug} ... `);

    try {
      const result = await generateForVendor(vendor);

      if (DRY) {
        console.log("\n    best_for:", result.best_for);
        console.log("    avoid_if:", result.avoid_if);
      } else {
        vendor.best_for = result.best_for;
        vendor.avoid_if = result.avoid_if;
        console.log("✓");
      }

      succeeded++;
    } catch (err) {
      console.log("✗ ERROR:", err.message);
      if (!DRY) {
        vendor.best_for = null;
        vendor.avoid_if = null;
      }
      failed++;
    }

    // Rate limit buffer (200ms between calls)
    if (toProcess.indexOf(vendor) < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\nDone: ${succeeded} succeeded, ${failed} failed.`);

  if (DRY) {
    console.log("[DRY RUN] No files written.");
    return;
  }

  // Backup before write
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupPath = NORMALIZED_PATH.replace(".json", `.backup-${ts}.json`);
  copyFileSync(NORMALIZED_PATH, backupPath);
  console.log(`Backup: ${backupPath}`);

  // Atomic write via temp file
  const tmpPath = NORMALIZED_PATH + ".tmp";
  writeFileSync(tmpPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  writeFileSync(NORMALIZED_PATH, readFileSync(tmpPath, "utf-8"), "utf-8");
  const { unlinkSync } = await import("fs");
  unlinkSync(tmpPath);

  console.log(`Written: ${NORMALIZED_PATH}`);
  if (failed > 0) {
    console.warn(`${failed} vendor(s) set to null — review and re-run with --force --vendor <slug>`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
