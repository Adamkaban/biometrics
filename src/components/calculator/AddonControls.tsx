import type { Addons } from "../../lib/calculator";
import { LIVENESS_SURCHARGE_USD, AML_SURCHARGE_USD } from "../../lib/calculator";

interface Props {
  value: Addons;
  onChange: (next: Addons) => void;
}

export function AddonControls({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Verification components
      </legend>

      <div className="flex flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
          <input
            type="checkbox"
            checked
            disabled
            className="accent-blue-600"
            aria-label="ID document verification (always included)"
          />
          <span>ID Document Verification</span>
          <span className="text-xs text-zinc-400">(included)</span>
        </label>

        <label className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-blue-600">
          <input
            type="checkbox"
            checked={value.liveness}
            onChange={(e) => onChange({ ...value, liveness: e.target.checked })}
            className="accent-blue-600"
            aria-label="Biometric liveness check"
          />
          <span>Biometric Liveness</span>
          <span className="text-xs text-zinc-500">
            +${LIVENESS_SURCHARGE_USD.toFixed(2)}/check
          </span>
        </label>

        <label className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-blue-600">
          <input
            type="checkbox"
            checked={value.aml}
            onChange={(e) => onChange({ ...value, aml: e.target.checked })}
            className="accent-blue-600"
            aria-label="AML and PEP watchlist screening"
          />
          <span>AML / PEP Screening</span>
          <span className="text-xs text-zinc-500">
            +${AML_SURCHARGE_USD.toFixed(2)}/check
          </span>
        </label>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Add-on surcharges are industry-average estimates applied to per-check vendors. Vendors that
        lack a feature are flagged accordingly.
      </p>
    </fieldset>
  );
}
