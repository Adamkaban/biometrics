import type { VendorResult, PricingResult } from "../../lib/calculator";

function formatCost(pricing: PricingResult): { primary: string; secondary?: string } {
  switch (pricing.type) {
    case "free":
      return { primary: "Free" };
    case "calculated": {
      const usd = pricing.monthlyUSD;
      const primary =
        usd >= 1000
          ? `$${(usd / 1000).toFixed(1)}K/mo`
          : `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo`;
      const secondary = pricing.perVerification
        ? `$${pricing.perVerification}/check${pricing.approx ? " (~USD)" : ""}`
        : undefined;
      return { primary, secondary };
    }
    case "flat": {
      const label = pricing.label ?? "/mo";
      return {
        primary: `$${pricing.usd}${label}`,
        secondary: "flat rate",
      };
    }
    case "custom":
      return { primary: pricing.label };
  }
}

interface Props {
  result: VendorResult;
}

export function VendorRow({ result }: Props) {
  const { primary, secondary } = formatCost(result.pricing);
  const isCustom = result.pricing.type === "custom";

  const actionHref = result.has_assessment
    ? `/vendors/${result.slug}`
    : result.affiliate_url ?? result.vendor_website;

  const actionLabel = result.has_assessment ? "View Review" : "Visit Website";
  const isExternal = !result.has_assessment;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
        result.featured
          ? "border-blue-200 bg-blue-50/50 dark:border-blue-600/30 dark:bg-blue-950/10"
          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      }`}
    >
      {/* Logo */}
      <div className="shrink-0 w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        {result.logo_url ? (
          <img src={result.logo_url} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
        ) : (
          <span className="text-xs font-semibold text-zinc-500 uppercase">
            {result.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {result.name}
          </span>
          {result.has_free_trial && (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5">
              Free Trial
            </span>
          )}
          {result.featured && (
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5">
              Featured
            </span>
          )}
        </div>
        {secondary && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{secondary}</p>
        )}
      </div>

      {/* Cost */}
      <div className="text-right shrink-0">
        <span
          className={`font-mono text-sm font-semibold ${
            result.pricing.type === "free"
              ? "text-emerald-600 dark:text-emerald-400"
              : isCustom
              ? "text-zinc-400"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {primary}
        </span>
      </div>

      {/* Action */}
      <a
        href={actionHref}
        {...(isExternal ? { rel: "nofollow noopener", target: "_blank" } : {})}
        className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
      >
        {actionLabel}
      </a>
    </div>
  );
}
