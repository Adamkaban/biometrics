const GBP_TO_USD = 1.27;

export type ParsedPrice =
  | { type: "per-check"; usd: number; monthlyMin?: number; approx?: true }
  | { type: "flat"; usd: number; label?: string }
  | { type: "free" }
  | { type: "custom"; label: string };

export function parsePrice(raw: string): ParsedPrice {
  const s = (raw ?? "").trim();

  // Sentinel / unknown data values → custom (no pricing info)
  if (!s || s === "null" || s === "N/A") {
    return { type: "custom", label: "Contact Sales" };
  }

  // Free / $0
  if (s === "Free" || s === "$0") {
    return { type: "free" };
  }

  // $0 / per check
  if (/^\$0\s*\/\s*per\s+check$/i.test(s)) {
    return { type: "free" };
  }

  // Custom / contact variants
  const customPatterns = [
    /contact/i,
    /custom/i,
    /request\s+pricing/i,
    /usage\s+based/i,
    /let\.s\s+(chat|talk)/i,
  ];
  if (customPatterns.some((p) => p.test(s))) {
    return { type: "custom", label: "Contact Sales" };
  }

  // GBP per candidate/client/check
  const gbpPerCheck = s.match(/£([\d.]+)\s+per\s+\w+/i);
  if (gbpPerCheck) {
    return {
      type: "per-check",
      usd: parseFloat(gbpPerCheck[1]) * GBP_TO_USD,
      approx: true,
    };
  }

  // Per-check with monthly minimum: "$0.80 per verification / $49 month min"
  const perCheckWithMin = s.match(
    /\$([\d.]+)\s*(?:per\s+verification|\/\s*per\s+check|\/\s*verification)\s*\/\s*\$([\d.]+)\s+month/i
  );
  if (perCheckWithMin) {
    return {
      type: "per-check",
      usd: parseFloat(perCheckWithMin[1]),
      monthlyMin: parseFloat(perCheckWithMin[2]),
    };
  }

  // Per-check without minimum
  const perCheck = s.match(
    /\$([\d.]+)\s*(?:per\s+(?:verification|check)|\/\s*(?:per\s+check|verification))/i
  );
  if (perCheck) {
    const usd = parseFloat(perCheck[1]);
    if (usd === 0) return { type: "free" };
    return { type: "per-check", usd };
  }

  // Per-user monthly
  const perUser = s.match(/\$([\d.]+)\s*\/\s*user\s*\/\s*mo/i);
  if (perUser) {
    return { type: "flat", usd: parseFloat(perUser[1]), label: "/user/month" };
  }

  // Flat monthly — /month, /mo, or standalone / mo
  const flatMonthly = s.match(/\$([\d.]+)\s*(?:\/\s*mo(?:nth)?|\/?\s*mo\b)/i);
  if (flatMonthly) {
    return { type: "flat", usd: parseFloat(flatMonthly[1]) };
  }

  // Bare dollar amount (e.g. "$19.99", "$49.99")
  const bareDollar = s.match(/^\$([\d.]+)$/);
  if (bareDollar) {
    const usd = parseFloat(bareDollar[1]);
    if (usd === 0) return { type: "free" };
    return { type: "flat", usd };
  }

  return { type: "custom", label: "Contact Sales" };
}
