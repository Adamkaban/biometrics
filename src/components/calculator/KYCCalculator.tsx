import { useState, useMemo, useEffect, useCallback } from "react";
import {
  calculateMonthlyCost,
  sortVendorResults,
  type Addons,
  type VendorPricingInput,
} from "../../lib/calculator";
import { VolumeInput } from "./VolumeInput";
import { AddonControls } from "./AddonControls";
import { ResultsTable } from "./ResultsTable";

interface Props {
  vendors: VendorPricingInput[];
}

function readParams(): { volume: number; addons: Addons } {
  if (typeof window === "undefined") return { volume: 10_000, addons: { liveness: false, aml: false } };
  const p = new URLSearchParams(window.location.search);
  const volume = Math.max(1, Math.min(500_000, parseInt(p.get("volume") ?? "10000", 10) || 10_000));
  const addons: Addons = {
    liveness: p.get("liveness") === "1",
    aml: p.get("aml") === "1",
  };
  return { volume, addons };
}

export function KYCCalculator({ vendors }: Props) {
  const initial = readParams();
  const [volume, setVolume] = useState(initial.volume);
  const [addons, setAddons] = useState<Addons>(initial.addons);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set("volume", String(volume));
    if (addons.liveness) p.set("liveness", "1");
    if (addons.aml) p.set("aml", "1");
    const url = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState(null, "", url);
  }, [volume, addons]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const results = useMemo(
    () => sortVendorResults(vendors.map((v) => calculateMonthlyCost(v, volume, addons))),
    [vendors, volume, addons]
  );

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-6 space-y-6">
      <VolumeInput value={volume} onChange={setVolume} />
      <AddonControls value={addons} onChange={setAddons} />
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <ResultsTable results={results} />
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Link copied
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Share results
            </>
          )}
        </button>
      </div>
    </div>
  );
}
