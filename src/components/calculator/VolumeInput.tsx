import { useState } from "react";

const PRESETS = [
  { label: "100", value: 100 },
  { label: "1K", value: 1_000 },
  { label: "5K", value: 5_000 },
  { label: "25K", value: 25_000 },
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
];

// Logarithmic slider: map 0–1000 range to 100–1,000,000 (10x more steps = ~4x better granularity at top)
function sliderToVolume(slider: number): number {
  return Math.round(Math.pow(10, 2 + (slider / 1000) * 4));
}

function volumeToSlider(volume: number): number {
  return Math.round(((Math.log10(volume) - 2) / 4) * 1000);
}

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeInput({ value, onChange }: Props) {
  const [inputStr, setInputStr] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const sliderValue = volumeToSlider(Math.max(100, Math.min(1_000_000, value)));

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(sliderToVolume(Number(e.target.value)));
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setIsEditing(true);
    setInputStr(String(value));
    e.target.select();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setInputStr(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1) onChange(Math.min(1_000_000, n));
  }

  function handleBlur() {
    setIsEditing(false);
    const n = parseInt(inputStr.replace(/\D/g, ""), 10);
    if (!isNaN(n)) onChange(Math.max(100, Math.min(1_000_000, n)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Monthly verifications
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={isEditing ? inputStr : value.toLocaleString("en-US")}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-32 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-right font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Number of monthly verifications"
        />
      </div>

      <input
        type="range"
        min={0}
        max={1000}
        value={sliderValue}
        onChange={handleSlider}
        className="w-full accent-blue-600"
        aria-label="Monthly verifications slider"
      />

      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === p.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
