import { useState } from "react";
import type { VendorResult } from "../../lib/calculator";
import { VendorRow } from "./VendorRow";

interface Props {
  results: VendorResult[];
}

export function ResultsTable({ results }: Props) {
  const [customExpanded, setCustomExpanded] = useState(false);

  const calculable = results.filter(
    (r) => r.pricing.type !== "custom"
  );
  const custom = results.filter((r) => r.pricing.type === "custom");

  return (
    <div className="space-y-2">
      {calculable.map((r) => (
        <VendorRow key={r.slug} result={r} />
      ))}

      {custom.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setCustomExpanded((v) => !v)}
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${customExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            {custom.length} vendor{custom.length !== 1 ? "s" : ""} require custom pricing
          </button>

          {customExpanded && (
            <div className="mt-2 space-y-2">
              {custom.map((r) => (
                <VendorRow key={r.slug} result={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
