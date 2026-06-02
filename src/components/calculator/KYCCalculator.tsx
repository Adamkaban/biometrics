import { useState, useMemo } from "react";
import { calculateMonthlyCost, sortVendorResults, type VendorPricingInput } from "../../lib/calculator";
import { VolumeInput } from "./VolumeInput";
import { ResultsTable } from "./ResultsTable";

interface Props {
  vendors: VendorPricingInput[];
}

export function KYCCalculator({ vendors }: Props) {
  const [volume, setVolume] = useState(10_000);

  const results = useMemo(
    () => sortVendorResults(vendors.map((v) => calculateMonthlyCost(v, volume))),
    [vendors, volume]
  );

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-6 space-y-6">
      <VolumeInput value={volume} onChange={setVolume} />
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <ResultsTable results={results} />
    </div>
  );
}
